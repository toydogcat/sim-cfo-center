/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface Account {
  id: string;          // e.g. "1001"
  name: string;        // e.g. "現金", "應收帳款", "材料成本"
  type: AccountType;
  balance: number;     // Current balance
}

export type BusinessEventType = 'Sale' | 'Purchase' | 'Payroll' | 'Tax' | 'Random';

export interface BusinessEvent {
  id: string;
  date: string;
  description: string;
  amount: number;
  eventType: BusinessEventType;
  industrySpecific: boolean;
  category: string; // e.g., "定期訂閱", "雲端伺服器", "材料採購"
}

export interface JournalLeg {
  accountId: string;
  accountName: string;
  amount: number;
}

export interface JournalEntry {
  eventId: string;
  date: string;
  debits: JournalLeg[];  // 借方 list
  credits: JournalLeg[]; // 貸方 list
}

export type IndustryType = 'SaaS' | 'Construction' | 'F&B' | 'Multisector';

export interface GameState {
  month: number;
  companyName: string;
  industry: IndustryType;
  accounts: Account[];
  eventsHistory: BusinessEvent[];
  journalEntriesHistory: JournalEntry[];
  monthlySnapshots: {
    month: number;
    cash: number;
    revenue: number;
    expenses: number;
    netIncome: number;
  }[];
  activeCFOReport: CFOReport | null;
  cfoLoading: boolean;
  actionCredits: number;
  hasCFOError: boolean;
}

export interface CFOReport {
  summary: string;
  warningStatus: 'safe' | 'warning' | 'danger';
  advice: string[];
  suggestedAction: {
    id: string;
    title: string;
    cost: number;
    effect: string;
    taken: boolean;
  } | null;
}
