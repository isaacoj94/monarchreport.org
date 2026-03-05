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

function getApiKey(): string {
  return process.env.OPENAI_API_KEY || "";
}

// === MONARCH REPORT EDITORIAL SYSTEM PROMPT ===
// This defines the watchdog lens through which bills are assessed.
// Aligned with Monarch Report's mission: protecting God-given rights,
// religious freedom, freedom of speech, freedom of the press,
// and guarding against government overreach.

const SYSTEM_PROMPT = `You are a legislative analyst working for Monarch Report, an independent watchdog journalism platform focused on South Korea and East Asia.

MONARCH REPORT'S EDITORIAL VALUES:
- We believe in God-given, inalienable rights that no government may justly infringe upon
- Religious freedom is paramount: the right to worship, believe, and practice faith without government interference or persecution
- Freedom of speech and freedom of the press must be fiercely protected against any form of government censorship, regulation, or chilling effect
- The right to peaceful assembly and protest is fundamental to a free society
- Government surveillance powers must be viewed with extreme skepticism — the burden of proof is on the state to justify any expansion
- We oppose government overreach in all forms: excessive regulation of civil society, NGOs, religious organizations, media, or individual conduct
- We are skeptical of laws that concentrate power in government agencies or expand bureaucratic control over citizens' lives
- Due process and the presumption of innocence are non-negotiable
- Property rights and economic freedom deserve strong protection
- We view any law requiring government registration, licensing, or approval for exercising fundamental rights as inherently suspect
- "National security" justifications for restricting freedoms deserve heightened scrutiny, not deference
- We recognize that seemingly benign laws can be weaponized against dissidents, religious minorities, and journalists

RISK ASSESSMENT FRAMEWORK — assess from the perspective described above:
- "critical": Directly targets or would chill religious freedom, free speech, free press, or peaceful assembly. Creates new criminal penalties for exercising rights. Mandates government registration/approval of religious groups, media, or civil society. Grants sweeping surveillance or censorship powers.
- "high": Significantly expands government authority over individual conduct, digital life, or organizational activity. Creates vague standards that could be selectively enforced against dissidents or minorities. Strengthens prosecution powers at the expense of defendant rights.
- "moderate": Increases regulatory burden on civil society, media, or religious organizations. Expands data collection or reporting requirements. Could indirectly affect the exercise of fundamental rights.
- "low": Minor regulatory changes with limited but nonzero implications for individual liberty or government power.
- "neutral": Administrative, budgetary, procedural, or infrastructure bills with no rights implications.

IMPORTANT INSTRUCTIONS:
- Translate bill titles accurately — do not editorialize in the translation itself
- Be rigorous but not alarmist — most bills ARE routine. Only flag genuine concerns.
- When in doubt about risk, lean toward flagging it rather than ignoring it. Our readers depend on us to catch threats others miss.
- Provide specific, concrete reasons for risk assessments — cite what the bill does, not vague generalities`;

// Analyze a batch of bills using GPT-4o-mini
export async function analyzeBills(bills: Bill[]): Promise<Map<string, BillAnalysis>> {
  const results = new Map<string, BillAnalysis>();
  const apiKey = getApiKey();

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
    for (const bill of uncachedBills) {
      const fallback = createFallbackAnalysis(bill);
      results.set(bill.id, fallback);
    }
    return results;
  }

  // Batch bills into groups of 25 for efficient API calls
  const batchSize = 25;
  for (let i = 0; i < uncachedBills.length; i += batchSize) {
    const batch = uncachedBills.slice(i, i + batchSize);

    try {
      const analyses = await callGPTForAnalysis(apiKey, batch);
      for (const [billId, analysis] of analyses) {
        results.set(billId, analysis);
        analysisCache.set(billId, analysis);
      }
    } catch (error) {
      console.error("[Bill Analysis] GPT API error:", error);
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

  const apiKey = getApiKey();
  if (!apiKey) return createFallbackAnalysis(bill);

  try {
    const analyses = await callGPTForAnalysis(apiKey, [bill]);
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

async function callGPTForAnalysis(
  apiKey: string,
  bills: Bill[]
): Promise<Map<string, BillAnalysis>> {
  const billDescriptions = bills
    .map(
      (b, i) =>
        `[${i}] ID: ${b.id}\n    Title: ${b.title.ko}\n    Proposer: ${b.proposer}\n    Committee: ${b.committee}\n    Status: ${b.status}\n    Last Action: ${b.lastAction}`
    )
    .join("\n\n");

  const userPrompt = `Analyze the following Korean bills. For each one provide:
1. Accurate English translation of the bill title
2. Japanese translation of the bill title
3. Brief English summary (1-2 sentences explaining what it does)
4. Brief Japanese summary (1-2 sentences)
5. Democracy/rights risk level per the framework in your instructions
6. Specific reason for the risk level (in English, Korean, and Japanese)
7. Which rights are affected (from: religious_freedom, free_speech, free_press, assembly, privacy, due_process, property, education, labor, none)

BILLS:
${billDescriptions}

Respond ONLY with a valid JSON array, no markdown, no explanation:
[{"index":0,"titleEn":"...","titleJa":"...","summaryEn":"...","summaryJa":"...","riskLevel":"neutral","riskReason":"...","riskReasonKo":"...","riskReasonJa":"...","affectedRights":["none"]}]`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";

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
    const parsed = JSON.parse(content);
    // Handle both direct array and wrapped object responses
    analyses = Array.isArray(parsed) ? parsed : (parsed.bills || parsed.results || parsed.data || []);
  } catch {
    console.error("[Bill Analysis] Failed to parse GPT response:", content.slice(0, 300));
    throw new Error("Failed to parse analysis response");
  }

  const results = new Map<string, BillAnalysis>();
  for (const analysis of analyses) {
    const bill = bills[analysis.index];
    if (bill) {
      // Validate risk level
      const validRisks: RiskLevel[] = ["critical", "high", "moderate", "low", "neutral"];
      const riskLevel = validRisks.includes(analysis.riskLevel) ? analysis.riskLevel : "neutral";

      results.set(bill.id, {
        titleEn: analysis.titleEn || bill.title.ko,
        titleJa: analysis.titleJa || bill.title.ko,
        summaryEn: analysis.summaryEn || bill.summary.en,
        summaryJa: analysis.summaryJa || bill.summary.ja,
        riskLevel,
        riskReason: analysis.riskReason || "",
        riskReasonKo: analysis.riskReasonKo || "",
        riskReasonJa: analysis.riskReasonJa || "",
        affectedRights: analysis.affectedRights || ["none"],
      });
    }
  }

  return results;
}

// Fallback when API is not available
function createFallbackAnalysis(bill: Bill): BillAnalysis {
  return {
    titleEn: bill.title.ko,
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
  critical: "\uD83D\uDEA8",
  high: "\u26A0\uFE0F",
  moderate: "\uD83D\uDD36",
  low: "\uD83D\uDD35",
  neutral: "\u26AA",
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
