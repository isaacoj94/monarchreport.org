export type BillStatus =
  | "proposed"
  | "committee"
  | "plenary"
  | "passed"
  | "rejected"
  | "withdrawn"
  | "promulgated";

export interface Bill {
  id: string;
  billNumber: string;
  title: {
    ko: string;
    en: string;
    ja: string;
  };
  summary: {
    ko: string;
    en: string;
    ja: string;
  };
  status: BillStatus;
  proposer: string;
  proposedDate: string;
  committee: string;
  lastAction: string;
  votingRecord?: VotingRecord;
  tags: string[];
  sourceUrl?: string;
  // AI analysis fields (populated when ANTHROPIC_API_KEY is set)
  riskLevel?: "critical" | "high" | "moderate" | "low" | "neutral";
  riskReason?: { en: string; ko: string; ja: string };
  affectedRights?: string[];
}

export interface VotingRecord {
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  abstentions: number;
  absent: number;
  date: string;
}

// Raw API response types from Korean Assembly Open API

// Bill list: nzmimeepazxkubdpn
export interface AssemblyBillRaw {
  BILL_ID: string;
  BILL_NO: string;
  BILL_NAME: string;
  PROPOSER: string;
  PROPOSE_DT: string;
  PROC_RESULT: string | null;
  COMMITTEE: string | null;
  COMMITTEE_ID: string | null;
  COMMITTEE_DT: string | null;
  DETAIL_LINK: string;
  AGE: string;
  RST_PROPOSER: string;
  PUBL_PROPOSER: string;
  MEMBER_LIST: string;
  PROC_DT: string | null;
  LAW_PROC_DT: string | null;
  LAW_PROC_RESULT_CD: string | null;
  LAW_PRESENT_DT: string | null;
  LAW_SUBMIT_DT: string | null;
  CMT_PROC_RESULT_CD: string | null;
  CMT_PROC_DT: string | null;
  CMT_PRESENT_DT: string | null;
}

// Vote record: ncocpgfiaoituanbr
export interface AssemblyVoteRaw {
  BILL_ID: string;
  BILL_NO: string;
  BILL_NAME: string;
  PROC_DT: string;
  CURR_COMMITTEE: string;
  CURR_COMMITTEE_ID: string;
  PROC_RESULT_CD: string;
  BILL_KIND_CD: string;
  AGE: string;
  MEMBER_TCNT: number;
  VOTE_TCNT: number;
  YES_TCNT: number;
  NO_TCNT: number;
  BLANK_TCNT: number;
  LINK_URL: string;
}

// Generic API response wrapper
export interface AssemblyApiResponse<T> {
  [serviceName: string]: [
    {
      head: [
        { list_total_count: number },
        { RESULT: { CODE: string; MESSAGE: string } },
      ];
    },
    {
      row: T[];
    },
  ];
}
