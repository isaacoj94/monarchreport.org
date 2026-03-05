import type { Bill } from "./types";

export type RiskLevel = "critical" | "high" | "moderate" | "low" | "neutral";

export interface BillAnalysis {
  titleEn: string;
  titleJa: string;
  summaryEn: string;
  summaryJa: string;
  riskLevel: RiskLevel;
  riskReason: string;
  riskReasonKo: string;
  riskReasonJa: string;
  affectedRights: string[];
}

// In-memory cache for analyzed bills (persists across requests during server lifetime)
const analysisCache = new Map<string, BillAnalysis>();

function getAnthropicKey(): string {
  return process.env.ANTHROPIC_API_KEY || "";
}

// Analyze a batch of bills using Claude Haiku for translation + risk assessment
export async function analyzeBills(bills: Bill[]): Promise<Map<string, BillAnalysis>> {
  const results = new Map<string, BillAnalysis>();
  const apiKey = getAnthropicKey();

  // Return cached results for bills we've already analyzed
  const uncachedBills: Bill[] = [];
  for (const bill of bills) {
    const cached = analysisCache.get(bill.id);
    if (cached) {
      results.set(bill.id, cached);
    } else {
      uncachedBills.push(bill);
    }
  }

  // If all bills are cached or no API key, return what we have
  if (uncachedBills.length === 0 || !apiKey) {
    // For bills without analysis and no API key, provide fallback
    for (const bill of uncachedBills) {
      const fallback = createFallbackAnalysis(bill);
      results.set(bill.id, fallback);
    }
    return results;
  }

  // Batch bills into groups of 20 for efficient API calls
  const batchSize = 20;
  for (let i = 0; i < uncachedBills.length; i += batchSize) {
    const batch = uncachedBills.slice(i, i + batchSize);

    try {
      const analyses = await callClaudeForAnalysis(apiKey, batch);
      for (const [billId, analysis] of analyses) {
        results.set(billId, analysis);
        analysisCache.set(billId, analysis); // Cache for future requests
      }
    } catch (error) {
      console.error("[Bill Analysis] Claude API error:", error);
      // Fallback for failed batch
      for (const bill of batch) {
        const fallback = createFallbackAnalysis(bill);
        results.set(bill.id, fallback);
      }
    }
  }

  return results;
}

// Analyze a single bill
export async function analyzeSingleBill(bill: Bill): Promise<BillAnalysis> {
  const cached = analysisCache.get(bill.id);
  if (cached) return cached;

  const apiKey = getAnthropicKey();
  if (!apiKey) return createFallbackAnalysis(bill);

  try {
    const analyses = await callClaudeForAnalysis(apiKey, [bill]);
    const analysis = analyses.get(bill.id);
    if (analysis) {
      analysisCache.set(bill.id, analysis);
      return analysis;
    }
  } catch (error) {
    console.error("[Bill Analysis] Single bill error:", error);
  }

  return createFallbackAnalysis(bill);
}

async function callClaudeForAnalysis(
  apiKey: string,
  bills: Bill[]
): Promise<Map<string, BillAnalysis>> {
  const billDescriptions = bills
    .map(
      (b, i) =>
        `[${i}] ID: ${b.id}\n    Title: ${b.title.ko}\n    Proposer: ${b.proposer}\n    Committee: ${b.committee}\n    Status: ${b.status}\n    Last Action: ${b.lastAction}`
    )
    .join("\n\n");

  const prompt = `You are an expert analyst of Korean legislation with deep knowledge of constitutional law, human rights, and democratic governance.

For each Korean bill listed below, provide:
1. An accurate English translation of the bill title
2. A Japanese translation of the bill title
3. A brief English summary (1-2 sentences)
4. A brief Japanese summary (1-2 sentences)
5. A democracy risk assessment:
   - "critical": Directly threatens fundamental rights (religious freedom, free speech, free press, assembly, due process)
   - "high": Significantly expands government surveillance, control, or restrictions on civil liberties
   - "moderate": Contains provisions that could be used to limit freedoms if misapplied
   - "low": Minor regulatory changes with limited rights implications
   - "neutral": Administrative, budgetary, or procedural with no rights implications
6. A brief reason for the risk level (in English, Korean, and Japanese)
7. Which specific rights are affected (from: religious_freedom, free_speech, free_press, assembly, privacy, due_process, property, education, labor, none)

BILLS:
${billDescriptions}

Respond in valid JSON format as an array:
[
  {
    "index": 0,
    "titleEn": "...",
    "titleJa": "...",
    "summaryEn": "...",
    "summaryJa": "...",
    "riskLevel": "neutral|low|moderate|high|critical",
    "riskReason": "English reason...",
    "riskReasonKo": "Korean reason...",
    "riskReasonJa": "Japanese reason...",
    "affectedRights": ["none"]
  }
]

Be fair and objective. Most bills are routine legislation. Only flag as high/critical if there are genuine concerns. Respond ONLY with the JSON array, no other text.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || "[]";

  // Parse the JSON response
  let analyses: Array<{
    index: number;
    titleEn: string;
    titleJa: string;
    summaryEn: string;
    summaryJa: string;
    riskLevel: RiskLevel;
    riskReason: string;
    riskReasonKo: string;
    riskReasonJa: string;
    affectedRights: string[];
  }>;

  try {
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    analyses = JSON.parse(jsonMatch ? jsonMatch[0] : content);
  } catch {
    console.error("[Bill Analysis] Failed to parse Claude response:", content.slice(0, 200));
    throw new Error("Failed to parse analysis response");
  }

  const results = new Map<string, BillAnalysis>();
  for (const analysis of analyses) {
    const bill = bills[analysis.index];
    if (bill) {
      results.set(bill.id, {
        titleEn: analysis.titleEn,
        titleJa: analysis.titleJa,
        summaryEn: analysis.summaryEn,
        summaryJa: analysis.summaryJa,
        riskLevel: analysis.riskLevel,
        riskReason: analysis.riskReason,
        riskReasonKo: analysis.riskReasonKo,
        riskReasonJa: analysis.riskReasonJa,
        affectedRights: analysis.affectedRights,
      });
    }
  }

  return results;
}

// Fallback when API is not available - provide basic info without AI
function createFallbackAnalysis(bill: Bill): BillAnalysis {
  return {
    titleEn: bill.title.ko, // Korean as fallback
    titleJa: bill.title.ko,
    summaryEn: bill.summary.en,
    summaryJa: bill.summary.ja,
    riskLevel: "neutral",
    riskReason: "Analysis unavailable",
    riskReasonKo: "분석 불가",
    riskReasonJa: "分析不可",
    affectedRights: ["none"],
  };
}

// Risk level display helpers
export const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30" },
  high: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/30" },
  moderate: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/30" },
  low: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
  neutral: { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/30" },
};

export const RISK_ICONS: Record<RiskLevel, string> = {
  critical: "🚨",
  high: "⚠️",
  moderate: "🔶",
  low: "🔵",
  neutral: "⚪",
};

export const RIGHTS_LABELS: Record<string, { en: string; ko: string; ja: string }> = {
  religious_freedom: { en: "Religious Freedom", ko: "종교의 자유", ja: "宗教の自由" },
  free_speech: { en: "Free Speech", ko: "언론의 자유", ja: "言論の自由" },
  free_press: { en: "Free Press", ko: "출판의 자유", ja: "報道の自由" },
  assembly: { en: "Assembly", ko: "집회의 자유", ja: "集会の自由" },
  privacy: { en: "Privacy", ko: "사생활", ja: "プライバシー" },
  due_process: { en: "Due Process", ko: "적법 절차", ja: "適正手続" },
  property: { en: "Property", ko: "재산권", ja: "財産権" },
  education: { en: "Education", ko: "교육권", ja: "教育権" },
  labor: { en: "Labor", ko: "노동권", ja: "労働権" },
  none: { en: "None", ko: "해당 없음", ja: "該当なし" },
};
