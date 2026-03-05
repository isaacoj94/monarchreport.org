import type {
  Bill,
  BillStatus,
  VotingRecord,
  AssemblyBillRaw,
  AssemblyVoteRaw,
} from "./types";

const BASE_URL = "https://open.assembly.go.kr/portal/openapi";
const BILL_LIST_SERVICE = "nzmimeepazxkubdpn";
const VOTE_SERVICE = "ncocpgfiaoituanbr";

// The Assembly API requires a User-Agent header
const HEADERS = {
  "User-Agent": "MonarchReport/1.0 (monarchreport.org)",
  Accept: "application/json",
};

function getApiKey(): string {
  return process.env.ASSEMBLY_API_KEY || "";
}

// Parse the wrapped API response format
function parseApiResponse<T>(
  json: Record<string, unknown>,
  serviceName: string
): { totalCount: number; rows: T[] } {
  const service = json[serviceName] as Array<Record<string, unknown>> | undefined;
  if (!service || service.length < 2) {
    return { totalCount: 0, rows: [] };
  }

  const head = service[0].head as Array<Record<string, unknown>>;
  const totalCount = (head[0] as { list_total_count: number }).list_total_count;
  const result = (head[1] as { RESULT: { CODE: string } }).RESULT;

  if (result.CODE !== "INFO-000") {
    console.error(`[Assembly API] Error: ${result.CODE}`);
    return { totalCount: 0, rows: [] };
  }

  const rows = (service[1] as { row: T[] }).row || [];
  return { totalCount, rows };
}

// Determine bill status from raw API fields
function determineBillStatus(raw: AssemblyBillRaw): BillStatus {
  const procResult = raw.PROC_RESULT?.toLowerCase() || "";
  const cmtResult = raw.CMT_PROC_RESULT_CD || "";
  const lawResult = raw.LAW_PROC_RESULT_CD || "";

  // Check for final outcomes first
  if (procResult.includes("가결") || procResult.includes("의결") || lawResult.includes("공포")) {
    return "passed";
  }
  if (procResult.includes("부결") || procResult.includes("폐기")) {
    return "rejected";
  }
  if (procResult.includes("철회")) {
    return "withdrawn";
  }
  if (raw.LAW_PRESENT_DT) {
    return "promulgated";
  }

  // Check processing stages
  if (raw.PROC_DT && !raw.PROC_RESULT) {
    return "plenary";
  }
  if (cmtResult || raw.CMT_PROC_DT || raw.COMMITTEE_DT) {
    return "committee";
  }
  if (raw.COMMITTEE) {
    return "committee";
  }

  return "proposed";
}

// Determine the last action text
function getLastAction(raw: AssemblyBillRaw): string {
  if (raw.PROC_RESULT) return raw.PROC_RESULT;
  if (raw.CMT_PROC_RESULT_CD) return `위원회: ${raw.CMT_PROC_RESULT_CD}`;
  if (raw.COMMITTEE) return `소관위: ${raw.COMMITTEE}`;
  return "접수";
}

// Transform raw API bill to our Bill type
function transformBill(raw: AssemblyBillRaw): Bill {
  const status = determineBillStatus(raw);

  return {
    id: raw.BILL_ID,
    billNumber: raw.BILL_NO,
    title: {
      ko: raw.BILL_NAME,
      en: raw.BILL_NAME, // Korean name used as fallback; real translation added later
      ja: raw.BILL_NAME,
    },
    summary: {
      ko: `${raw.PROPOSER} 제안 | ${raw.COMMITTEE || "위원회 미배정"}`,
      en: `Proposed by ${raw.RST_PROPOSER} et al. | ${raw.COMMITTEE || "Committee not assigned"}`,
      ja: `${raw.RST_PROPOSER}他 提出 | ${raw.COMMITTEE || "委員会未配定"}`,
    },
    status,
    proposer: raw.RST_PROPOSER || raw.PROPOSER,
    proposedDate: raw.PROPOSE_DT,
    committee: raw.COMMITTEE || "미배정",
    lastAction: getLastAction(raw),
    tags: [],
    sourceUrl: raw.DETAIL_LINK,
  };
}

// Fetch bills from the Assembly API
export async function fetchBills(params: {
  age?: number;
  page?: number;
  size?: number;
}): Promise<{ bills: Bill[]; totalCount: number }> {
  const { age = 22, page = 1, size = 20 } = params;
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn("[Assembly API] No API key set");
    return { bills: [], totalCount: 0 };
  }

  const url = `${BASE_URL}/${BILL_LIST_SERVICE}?KEY=${apiKey}&Type=json&AGE=${age}&pIndex=${page}&pSize=${size}`;

  try {
    const response = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });

    if (!response.ok) {
      console.error(`[Assembly API] HTTP ${response.status}`);
      return { bills: [], totalCount: 0 };
    }

    const json = await response.json();
    const { totalCount, rows } = parseApiResponse<AssemblyBillRaw>(json, BILL_LIST_SERVICE);

    const bills = rows.map(transformBill);
    return { bills, totalCount };
  } catch (error) {
    console.error("[Assembly API] Fetch error:", error);
    return { bills: [], totalCount: 0 };
  }
}

// Fetch voting records for bills that have been voted on
export async function fetchVotingRecords(params: {
  age?: number;
  page?: number;
  size?: number;
}): Promise<Map<string, VotingRecord>> {
  const { age = 22, page = 1, size = 50 } = params;
  const apiKey = getApiKey();

  if (!apiKey) return new Map();

  const url = `${BASE_URL}/${VOTE_SERVICE}?KEY=${apiKey}&Type=json&AGE=${age}&pIndex=${page}&pSize=${size}`;

  try {
    const response = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });

    if (!response.ok) return new Map();

    const json = await response.json();
    const { rows } = parseApiResponse<AssemblyVoteRaw>(json, VOTE_SERVICE);

    const records = new Map<string, VotingRecord>();
    for (const raw of rows) {
      records.set(raw.BILL_ID, {
        totalVotes: raw.VOTE_TCNT,
        yesVotes: raw.YES_TCNT,
        noVotes: raw.NO_TCNT,
        abstentions: raw.BLANK_TCNT,
        absent: raw.MEMBER_TCNT - raw.VOTE_TCNT,
        date: raw.PROC_DT,
      });
    }

    return records;
  } catch (error) {
    console.error("[Assembly API] Vote fetch error:", error);
    return new Map();
  }
}

// Fetch bills with voting records merged in
export async function fetchBillsWithVotes(params: {
  age?: number;
  page?: number;
  size?: number;
}): Promise<{ bills: Bill[]; totalCount: number }> {
  const [billResult, voteRecords] = await Promise.all([
    fetchBills(params),
    fetchVotingRecords({ age: params.age }),
  ]);

  // Merge voting records into bills
  const billsWithVotes = billResult.bills.map((bill) => {
    const voteRecord = voteRecords.get(bill.id);
    if (voteRecord) {
      return {
        ...bill,
        votingRecord: voteRecord,
        status: "passed" as BillStatus, // Bills with votes have been through plenary
      };
    }
    return bill;
  });

  return { bills: billsWithVotes, totalCount: billResult.totalCount };
}
