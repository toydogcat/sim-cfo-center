/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Account, BusinessEvent, JournalEntry, JournalLeg } from './types';

// Standard charts of accounts initial values
export const INITIAL_ACCOUNTS: Account[] = [
  { id: "1001", name: "現金及約當現金", type: "Asset", balance: 0 },
  { id: "1002", name: "應收帳款", type: "Asset", balance: 0 },
  { id: "1003", name: "營運與生財設備", type: "Asset", balance: 0 },
  { id: "2001", name: "應付帳款", type: "Liability", balance: 0 },
  { id: "2002", name: "長期銀行借貸", type: "Liability", balance: 0 },
  { id: "2003", name: "股東往來與過橋融資", type: "Liability", balance: 0 },
  { id: "3001", name: "創始資本股本", type: "Equity", balance: 0 },
  { id: "3002", name: "CFO特別股增資", type: "Equity", balance: 0 },
  { id: "4001", name: "主營業務收入", type: "Revenue", balance: 0 },
  { id: "5001", name: "研發及人事薪資支出", type: "Expense", balance: 0 },
  { id: "5002", name: "營建材料等生長成本", type: "Expense", balance: 0 },
  { id: "5003", name: "雲端主機與伺服器費用", type: "Expense", balance: 0 },
  { id: "5004", name: "營業損害與外包維護損失", type: "Expense", balance: 0 }
];

export function applyJournalToAccounts(
  debits: JournalLeg[],
  credits: JournalLeg[],
  accounts: Account[]
): Account[] {
  // Deep clone to ensure immutability
  const updated = accounts.map(acc => ({ ...acc }));

  // Helper helper to modify account balance
  const adjustBalance = (accountId: string, amount: number, direction: 'debit' | 'credit') => {
    const acc = updated.find(a => a.id === accountId);
    if (!acc) return;

    // Normal debit/credit rules:
    // Asset: Debit (+), Credit (-)
    // Liability: Debit (-), Credit (+)
    // Equity: Debit (-), Credit (+)
    // Revenue: Debit (-), Credit (+)
    // Expense: Debit (+), Credit (-)
    
    if (acc.type === 'Asset' || acc.type === 'Expense') {
      if (direction === 'debit') {
        acc.balance += amount;
      } else {
        acc.balance -= amount;
      }
    } else { // Liability, Equity, Revenue
      if (direction === 'credit') {
        acc.balance += amount;
      } else {
        acc.balance -= amount;
      }
    }
  };

  debits.forEach(leg => adjustBalance(leg.accountId, leg.amount, 'debit'));
  credits.forEach(leg => adjustBalance(leg.accountId, leg.amount, 'credit'));

  return updated;
}

export function postBusinessEvent(
  event: BusinessEvent,
  accounts: Account[]
): { journalEntry: JournalEntry; updatedAccounts: Account[] } {
  const debits: JournalLeg[] = [];
  const credits: JournalLeg[] = [];

  const addDebit = (accountId: string, amount: number) => {
    const acc = accounts.find(a => a.id === accountId);
    debits.push({
      accountId,
      accountName: acc ? acc.name : "未知科目",
      amount
    });
  };

  const addCredit = (accountId: string, amount: number) => {
    const acc = accounts.find(a => a.id === accountId);
    credits.push({
      accountId,
      accountName: acc ? acc.name : "未知科目",
      amount
    });
  };

  const amount = Math.abs(event.amount);

  switch (event.eventType) {
    case 'Sale':
      if (event.category === 'CFO個人增資') {
        // CFO invests own funds as equity
        addDebit("1001", amount); // Company cash increases
        addCredit("3002", amount); // CFO Equity capital increases
      } else if (event.category === 'CFO過橋資助') {
        // CFO lends bridge funding to the company
        addDebit("1001", amount); // Company cash increases
        addCredit("2003", amount); // Shareholder Loan liability increases
      } else if (event.category === '應收帳款請款') {
        // Collect existing outstanding receivables: Cash up, Receivables down
        addDebit("1001", amount); // Cash up
        addCredit("1002", amount); // Accounts Receivable down
      } else if (event.category === '工程進度款請撥') {
        // Construction project bill: Cash increases, Main Revenue increases
        // Sometimes bill is recorded as Revenue first (and maybe partly into cash and accounts receivable)
        // Let's do 70% cash, 30% accounts receivable to simulate constructions matching profile
        const cashPortion = Math.round(amount * 0.7);
        const receivablePortion = amount - cashPortion;
        addDebit("1001", cashPortion);
        if (receivablePortion > 0) {
          addDebit("1002", receivablePortion);
        }
        addCredit("4001", amount);
      } else {
        // Standard Cash subscription or retail sale: Cash up, Revenue up
        addDebit("1001", amount);
        addCredit("4001", amount);
      }
      break;

    case 'Purchase':
      if (event.category === '償還股東過橋款') {
        // Company pays back CFO's loan: Liability decreases, Cash decreases
        addDebit("2003", amount); // Decrease Shareholder Loan liability
        addCredit("1001", amount); // Decrease Company cash
      } else if (event.category === '重型機具購置') {
        // Capital Expense (equipment): Equipment increases, Cash decreases
        addDebit("1003", amount);
        addCredit("1001", amount);
      } else if (event.category === '營建材料採購') {
        // Material purchase (accrued: cash down or payables up)
        // Let's pay 60% cash and 40% payables
        const cashCost = Math.round(amount * 0.6);
        const payableCost = amount - cashCost;
        addDebit("5002", amount); // Material expense
        addCredit("1001", cashCost); // Cash
        if (payableCost > 0) {
          addCredit("2001", payableCost); // Accounts Payable
        }
      } else if (event.category === '雲端主機與伺服器') {
        // Server host purchase: server expense increases, Cash decreases
        addDebit("5003", amount);
        addCredit("1001", amount);
      } else {
        // General Purchase
        addDebit("5004", amount);
        addCredit("1001", amount);
      }
      break;

    case 'Payroll':
      // Salaries: salary expense increases, Cash decreases
      addDebit("5001", amount);
      addCredit("1001", amount);
      break;

    case 'Tax':
      // Tax: fine/tax expense increases, Cash decreases
      addDebit("5004", amount);
      addCredit("1001", amount);
      break;

    case 'Random':
      // Special random events with positive/negative impacts
      if (event.amount >= 0) {
        // Windfall or compensation: Cash increases, Revenue (or other gain) increases
        addDebit("1001", amount);
        addCredit("4001", amount);
      } else {
        // Disaster, damages or fine penalties: Expense increases, Cash decreases
        addDebit("5004", amount);
        addCredit("1001", amount);
      }
      break;

    default:
      // Fallback
      if (event.amount >= 0) {
        addDebit("1001", amount);
        addCredit("4001", amount);
      } else {
        addDebit("5004", amount);
        addCredit("1001", amount);
      }
  }

  // Enforce double entry check
  const sumDebits = debits.reduce((sum, item) => sum + item.amount, 0);
  const sumCredits = credits.reduce((sum, item) => sum + item.amount, 0);

  if (sumDebits !== sumCredits) {
    throw new Error(
      `會計引擎分錄借貸不平衡！交易編號: ${event.id}, 借方合計: ${sumDebits}, 貸方合計: ${sumCredits}`
    );
  }

  const journalEntry: JournalEntry = {
    eventId: event.id,
    date: event.date,
    debits,
    credits
  };

  const updatedAccounts = applyJournalToAccounts(debits, credits, accounts);

  return {
    journalEntry,
    updatedAccounts
  };
}

export function calculateIncomeStatement(accounts: Account[]) {
  const revenueAcc = accounts.find(a => a.id === "4001");
  const salariesAcc = accounts.find(a => a.id === "5001");
  const materialAcc = accounts.find(a => a.id === "5002");
  const serverAcc = accounts.find(a => a.id === "5003");
  const lossAcc = accounts.find(a => a.id === "5004");

  const revenue = revenueAcc ? revenueAcc.balance : 0;
  const salaries = salariesAcc ? salariesAcc.balance : 0;
  const materials = materialAcc ? materialAcc.balance : 0;
  const servers = serverAcc ? serverAcc.balance : 0;
  const losses = lossAcc ? lossAcc.balance : 0;

  const totalExpense = salaries + materials + servers + losses;
  const netIncome = revenue - totalExpense;

  return {
    revenue,
    salaries,
    materials,
    servers,
    losses,
    totalExpense,
    netIncome
  };
}

export function calculateBalanceSheet(accounts: Account[]) {
  const cash = accounts.find(a => a.id === "1001")?.balance || 0;
  const receivables = accounts.find(a => a.id === "1002")?.balance || 0;
  const equipment = accounts.find(a => a.id === "1003")?.balance || 0;
  const payables = accounts.find(a => a.id === "2001")?.balance || 0;
  const loans = accounts.find(a => a.id === "2002")?.balance || 0;
  const bridgeLoans = accounts.find(a => a.id === "2003")?.balance || 0;
  const equityCapital2 = accounts.find(a => a.id === "3002")?.balance || 0;
  const equityCapital = (accounts.find(a => a.id === "3001")?.balance || 0) + equityCapital2;

  // Let's dynamically calculate Retained Earnings as matches Net Profits from accounts.
  // In dynamic ledger, current period Net Profit is basically sum of revenues minus sum of expenses.
  const inc = calculateIncomeStatement(accounts);
  const retainedEarnings = inc.netIncome;

  const totalAssets = cash + receivables + equipment;
  const totalLiabilities = payables + loans + bridgeLoans;
  const totalEquity = equityCapital + retainedEarnings;

  return {
    cash,
    receivables,
    equipment,
    totalAssets,
    payables,
    loans,
    bridgeLoans,
    cfoEquity: equityCapital2,
    totalLiabilities,
    equityCapital,
    retainedEarnings,
    totalEquity
  };
}
