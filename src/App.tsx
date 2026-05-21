/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Coins,
  Building2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Activity,
  FileSpreadsheet,
  LayoutDashboard,
  Lightbulb,
  Play,
  ArrowUpRight,
  Sparkles,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Target,
  FileText,
  UserCheck,
  ShieldCheck,
  Info,
  HelpCircle,
  Users,
  UserPlus,
  UserMinus,
  Home,
  ArrowDownRight,
  Utensils
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';

import { Account, BusinessEvent, JournalEntry, IndustryType, CFOReport } from './types';
import { INITIAL_ACCOUNTS, postBusinessEvent, calculateIncomeStatement, calculateBalanceSheet } from './ledgerEngine';
import { generateMonthlyEvents } from './transactionGenerator';
import { generateHeuristicCFOReport } from './heuristicCfo';

export default function App() {
  // Game Setup States
  const [isPlaying, setIsPlaying] = useState(false);
  const [industry, setIndustry] = useState<IndustryType>('SaaS');
  const [companyName, setCompanyName] = useState('');
  const [step, setStep] = useState(1); // Onboarding steps

  // Core Game Loop State
  const [month, setMonth] = useState(1);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [eventsHistory, setEventsHistory] = useState<BusinessEvent[]>([]);
  const [journalEntriesHistory, setJournalEntriesHistory] = useState<JournalEntry[]>([]);
  
  // Tactical action flags (de-escalations)
  const [saasGrowthFactor, setSaasGrowthFactor] = useState(1.0);
  const [salaryMultiplier, setSalaryMultiplier] = useState(1.0);
  const [hasCloudAudit, setHasCloudAudit] = useState(false);
  const [hasMaterialLock, setHasMaterialLock] = useState(false);
  const [hasSafetyOfficer, setHasSafetyOfficer] = useState(false);

  // Dynamic Headcount and Recruiting Control
  const [headcount, setHeadcount] = useState(10); // SaaS starts with 10, Construction with 30 (adjusted in handleStartGame)

  // System indicators for macro economy
  const [marketStatus, setMarketStatus] = useState<'Bull' | 'Stagnant' | 'Bear'>('Stagnant');
  const [stockIndex, setStockIndex] = useState(16500);
  const [btcPrice, setBtcPrice] = useState(64200);

  // CFO Personal Wealth & Ambitions Accumulator
  const [cfoSavings, setCfoSavings] = useState(30000); 
  const [cfoStockUnits, setCfoStockUnits] = useState(0); 
  const [cfoBtcUnits, setCfoBtcUnits] = useState(0); 
  const [ownedProperties, setOwnedProperties] = useState<string[]>([]);
  
  // Dynamic Game Snapshots (for charting)
  const [snapshots, setSnapshots] = useState<{
    month: number;
    cash: number;
    revenue: number;
    expenses: number;
    netIncome: number;
  }[]>([]);

  // Selected Active Tab
  const [activeTab, setActiveTab] = useState<'cfo' | 'ledger' | 'statements' | 'charts' | 'market_life'>('cfo');

  // Interactive transaction expand state
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    if (document.querySelector('script[data-vercount="true"]')) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.vercount.one/js';
    script.crossOrigin = 'anonymous';
    script.dataset.vercount = 'true';
    document.body.appendChild(script);
  }, []);

  // CFO Expert States
  const [cfoReport, setCfoReport] = useState<CFOReport | null>(null);
  const [cfoLoading, setCfoLoading] = useState(false);
  const [cfoError, setCfoError] = useState(false);
  const [selectedAdviceIndex, setSelectedAdviceIndex] = useState<number | null>(null);
  const [executedAdviceIds, setExecutedAdviceIds] = useState<string[]>([]);

  const getDynamicActionFromAdvice = (text: string, index: number) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('薪') || lowerText.includes('挖角') || lowerText.includes('加薪') || lowerText.includes('人才') || lowerText.includes('核心') || lowerText.includes('團隊')) {
      return {
        id: 'stop_poaching',
        title: '核心團隊薪資特別加薪與激勵專案',
        cost: 30000,
        effect: '支付 3 萬元現金調薪，核心人員加薪以阻隔惡意挖角與技術斷代，提升長期運營效能',
        alreadyTaken: salaryMultiplier > 1.0,
        actionId: 'stop_poaching'
      };
    }
    
    if (lowerText.includes('伺服') || lowerText.includes('斷線') || lowerText.includes('當機') || lowerText.includes('備份') || lowerText.includes('架構') || lowerText.includes('雲端') || lowerText.includes('主機')) {
      return {
        id: 'cloud_audit',
        title: '雲端主機災備高可用性多活工程',
        cost: 45000,
        effect: '支付 4.5 萬元升級雲端設備與主機，此後徹底避開未來突發性停機索賠事件！',
        alreadyTaken: hasCloudAudit,
        actionId: 'cloud_audit'
      };
    }
    
    if (lowerText.includes('材料') || lowerText.includes('原物料') || lowerText.includes('上漲') || lowerText.includes('混凝土') || lowerText.includes('水泥') || lowerText.includes('鋼筋') || lowerText.includes('套期') || lowerText.includes('保值') || lowerText.includes('鋼骨')) {
      return {
        id: 'hedging_materials',
        title: '混凝土與鋼鐵原物料年度遠期協議合約',
        cost: 60000,
        effect: '支付 6 萬元保證金！設定定額混凝土進料價格，未來將完全免疫因原物料暴漲帶來的溢價代價',
        alreadyTaken: hasMaterialLock,
        actionId: 'hedging_materials'
      };
    }

    if (lowerText.includes('融資') || lowerText.includes('借款') || lowerText.includes('借貸') || lowerText.includes('資金') || lowerText.includes('貸款') || lowerText.includes('流動性')) {
      const activeLoan = accounts.find(a => a.id === "2002")?.balance || 0;
      return {
        id: 'apply_loan',
        title: '申請開通商業銀行緊急信用流動性融資',
        cost: -300000, // Negative cost is positive cash
        effect: '取得銀行特別核發 30 萬元現金，充實營運準備，同時新增 30 萬元長期貸款負債',
        alreadyTaken: activeLoan >= 600000,
        actionId: 'apply_loan'
      };
    }

    if (lowerText.includes('工安') || lowerText.includes('工地') || lowerText.includes('安全') || lowerText.includes('防範') || lowerText.includes('監督') || lowerText.includes('意外')) {
      return {
        id: 'safety_officer',
        title: '引進全時智慧工地安全管理與認證稽查',
        cost: 40000,
        effect: '支付 4 萬元採購安全防範設施並引進甲級安全稽核專員，徹底阻斷隨機工地事故與勒令停工事件',
        alreadyTaken: hasSafetyOfficer,
        actionId: 'safety_officer'
      };
    }

    // Default Fallback
    return {
      id: `custom_marketing_${index}`,
      title: '啟動全鏈路精準行銷推廣與品牌包裝計畫',
      cost: 20000,
      effect: '支付 2 萬元行銷廣告推行經費，下月起將大幅提升 15% 的客戶增長率與留存，帶動主營業務收入',
      alreadyTaken: false,
      actionId: 'generic_marketing'
    };
  };

  // Latest monthly events generated
  const [currentMonthEvents, setCurrentMonthEvents] = useState<BusinessEvent[]>([]);

  // Start the simulation with initial capital infusion
  const handleStartGame = async () => {
    if (!companyName.trim()) return;

    setIsPlaying(true);
    let initialCapital = 500000; // Default
    if (industry === 'SaaS') initialCapital = 500000;
    else if (industry === 'Construction') initialCapital = 1200000;
    else if (industry === 'F&B') initialCapital = 300000;
    
    // Seed headcount, macro conditions, and personal finance
    let initialHeadcount = 10;
    if (industry === 'SaaS') initialHeadcount = 10;
    else if (industry === 'Construction') initialHeadcount = 30;
    else if (industry === 'F&B') initialHeadcount = 8;
    setHeadcount(initialHeadcount);
    setMarketStatus('Stagnant');
    setStockIndex(16500);
    setBtcPrice(64200);
    setCfoSavings(30000);
    setCfoStockUnits(0);
    setCfoBtcUnits(0);
    setOwnedProperties([]);

    // Create first business event: Initial Capital Infusion
    const initEvent: BusinessEvent = {
      id: `INIT-${Date.now()}`,
      date: '2026-01-01',
      description: `【創始投資】大天使創投資金折合新台幣注入${industry === 'SaaS' ? '50萬' : '120萬'}元作為主權創始資金`,
      amount: initialCapital,
      eventType: 'Sale', // triggers asset up and equity up
      industrySpecific: false,
      category: '創始資本投入'
    };

    // Make a custom Account seed for clean double posting
    const seedAccounts = INITIAL_ACCOUNTS.map(a => {
      if (a.id === "3001") { // Capital Equity
        return { ...a, balance: initialCapital };
      }
      if (a.id === "1001") { // Cash
        return { ...a, balance: initialCapital };
      }
      return { ...a, balance: 0 };
    });

    const mockJournal: JournalEntry = {
      eventId: initEvent.id,
      date: initEvent.date,
      debits: [{ accountId: '1001', accountName: '現金及約當現金', amount: initialCapital }],
      credits: [{ accountId: '3001', accountName: '創始資本股本', amount: initialCapital }]
    };

    setAccounts(seedAccounts);
    setEventsHistory([initEvent]);
    setCurrentMonthEvents([initEvent]);
    setJournalEntriesHistory([mockJournal]);
    setMonth(1);

    const initialSnapshot = {
      month: 1,
      cash: initialCapital,
      revenue: 0,
      expenses: 0,
      netIncome: 0
    };
    setSnapshots([initialSnapshot]);

    // Fetch initial onboarding CFO analysis
    requestCFOAdvice(seedAccounts, [initEvent], 1, industry);
  };

  // Run next monthly cycle
  const handleNextMonth = async () => {
    const nextMonthNum = month + 1;
    
    // A. Cycle Market Sentiment & fluctuate Stock/Bitcoin prices
    const nextStatusRng = Math.random();
    let nextStatus: 'Bull' | 'Stagnant' | 'Bear' = marketStatus;
    if (nextStatusRng < 0.25) {
      nextStatus = 'Bull';
    } else if (nextStatusRng < 0.50) {
      nextStatus = 'Bear';
    } else if (nextStatusRng < 0.85) {
      nextStatus = 'Stagnant';
    }

    let stockChange = 0;
    let btcChange = 0;
    if (nextStatus === 'Bull') {
      stockChange = 0.05 + Math.random() * 0.15; // 5% to 20%
      btcChange = 0.10 + Math.random() * 0.35;   // 10% to 45%
    } else if (nextStatus === 'Bear') {
      stockChange = -0.05 - Math.random() * 0.13; // -5% to -18%
      btcChange = -0.10 - Math.random() * 0.30;   // -10% to -40%
    } else {
      stockChange = -0.03 + Math.random() * 0.06; // -3% to +3%
      btcChange = -0.08 + Math.random() * 0.16;   // -8% to +8%
    }

    const nextStockIndex = Math.round(stockIndex * (1 + stockChange));
    const nextBtcPrice = Math.round(btcPrice * (1 + btcChange));
    setMarketStatus(nextStatus);
    setStockIndex(nextStockIndex);
    setBtcPrice(nextBtcPrice);

    // B. Generate normal events for next month (SaaS or Construction) with headcount & market status
    const { events: rawEvents, randomEventOccurrence } = generateMonthlyEvents(
      industry,
      nextMonthNum,
      saasGrowthFactor,
      salaryMultiplier,
      headcount,
      nextStatus
    );

    // C. Insert CFO Personal Salary into list of company expenditure entries
    const startYear = 2026;
    const totalMonthsVal = nextMonthNum - 1;
    const yearIdx = startYear + Math.floor(totalMonthsVal / 12);
    const monthIdx = (totalMonthsVal % 12) + 1;
    const monthStr = monthIdx < 10 ? `0${monthIdx}` : `${monthIdx}`;
    const cfoDateStr = `${yearIdx}-${monthStr}-05`;

    const cfoSalaryEvent: BusinessEvent = {
      id: `CFO-SAL-${Date.now()}`,
      date: cfoDateStr,
      description: `【營運支出】提發 CFO 技術長與財務主管月度應得保障薪資與津貼 (公司營運扣款)`,
      amount: 15000,
      eventType: 'Payroll',
      industrySpecific: false,
      category: '薪資支出'
    };

    const rawEventsWithCfo = [...rawEvents, cfoSalaryEvent];

    // Increment CFO's personal savings
    setCfoSavings(prev => prev + 15000);

    // 2. Filter / modify events according to player protective shields
    const processedEvents = rawEventsWithCfo.map(evt => {
      // Outage Protection
      if (evt.description.includes("亞太數據中心骨幹網路大斷線") && hasCloudAudit) {
        return {
          ...evt,
          description: "【系統防護成功】雖然本日亞太數據中心發生骨幹大斷線，但因配置『高容災多活架構專案』，系統於 0.2 秒內自動切換備用端，零損失安全渡過！",
          amount: 0 // No loss!
        };
      }
      // Material price surge protection
      if (evt.description.includes("國際鋼鐵與砂石原物料巨幅上漲") && hasMaterialLock) {
        return {
          ...evt,
          description: "【遠期合約保價優勢】國際原物料市場鋼筋混泥土價格瘋狂暴漲，因已簽署年度保價合約，順利避開本月 15 萬元材料溢價！",
          amount: 0 // No price hike loss
        };
      }
      // Safety officer accident protection
      if (evt.description.includes("工安事件") && hasSafetyOfficer) {
        return {
          ...evt,
          description: "【工地安檢稽查奏效】起重吊裝作業時吊繩磨損，幸蒙甲級監工及時喊停並更換鋼纜，排除倒塌危機，本月安全零損失！",
          amount: 0 // No tragedy penalties
        };
      }
      return evt;
    });

    // 3. Post through double-entry ledger engine
    let currentAccountsState = [...accounts];
    const newJournals: JournalEntry[] = [];

    processedEvents.forEach(evt => {
      try {
        const { journalEntry, updatedAccounts } = postBusinessEvent(evt, currentAccountsState);
        currentAccountsState = updatedAccounts;
        newJournals.push(journalEntry);
      } catch (err) {
        console.error("Ledger post failure:", err);
      }
    });

    // 4. Update Game State
    setAccounts(currentAccountsState);
    setEventsHistory(prev => [...prev, ...processedEvents]);
    setCurrentMonthEvents(processedEvents);
    setJournalEntriesHistory(prev => [...prev, ...newJournals]);
    setMonth(nextMonthNum);

    // Save snapshot indicators
    const inc = calculateIncomeStatement(currentAccountsState);
    const bs = calculateBalanceSheet(currentAccountsState);
    const newSnapshot = {
      month: nextMonthNum,
      cash: bs.cash,
      revenue: inc.revenue,
      expenses: inc.totalExpense,
      netIncome: inc.netIncome
    };
    const updatedSnapshots = [...snapshots, newSnapshot];
    setSnapshots(updatedSnapshots);

    // Reset expanded transaction views
    setExpandedEventId(null);
    setSelectedAdviceIndex(null);
    setExecutedAdviceIds([]);

    // Trigger CFO reporting
    requestCFOAdvice(currentAccountsState, processedEvents, nextMonthNum, industry);
  };

  // 1. CFO personal invest as Equity
  const handleCfoInjectEquity = (amount: number) => {
    if (cfoSavings < amount) return;

    const startYear = 2026;
    const totalMonthsVal = month - 1;
    const yearIdx = startYear + Math.floor(totalMonthsVal / 12);
    const monthIdx = (totalMonthsVal % 12) + 1;
    const monthStr = monthIdx < 10 ? `0${monthIdx}` : `${monthIdx}`;
    const dateStr = `${yearIdx}-${monthStr}-15`;

    const injectEvent: BusinessEvent = {
      id: `CFO-INJ-${Date.now()}`,
      date: dateStr,
      description: `【股本投資】CFO 個人出資增資公司股本（加強資本公積型注資 $${amount.toLocaleString()} 元），提升公司流動資金。`,
      amount,
      eventType: 'Sale', // Debt 1001 Credit 3002
      industrySpecific: false,
      category: 'CFO個人增資'
    };

    try {
      const { journalEntry, updatedAccounts } = postBusinessEvent(injectEvent, accounts);
      setAccounts(updatedAccounts);
      setEventsHistory(prev => [...prev, injectEvent]);
      setCurrentMonthEvents(prev => [...prev, injectEvent]);
      setJournalEntriesHistory(prev => [...prev, journalEntry]);
      setCfoSavings(prev => prev - amount);
    } catch (err) {
      console.error(err);
    }
  };

  // 2. CFO personal bridge loan to company
  const handleCfoProvideBridgeLoan = (amount: number) => {
    if (cfoSavings < amount) return;

    const startYear = 2026;
    const totalMonthsVal = month - 1;
    const yearIdx = startYear + Math.floor(totalMonthsVal / 12);
    const monthIdx = (totalMonthsVal % 12) + 1;
    const monthStr = monthIdx < 10 ? `0${monthIdx}` : `${monthIdx}`;
    const dateStr = `${yearIdx}-${monthStr}-15`;

    const loanEvent: BusinessEvent = {
      id: `CFO-LOAN-${Date.now()}`,
      date: dateStr,
      description: `【股東與過橋往來】CFO 提供個人儲蓄向公司融通過橋資金（撥入 $${amount.toLocaleString()} 元），待未來手頭充裕時由公司償還。`,
      amount,
      eventType: 'Sale', // Debt 1001 Credit 2003
      industrySpecific: false,
      category: 'CFO過橋資助'
    };

    try {
      const { journalEntry, updatedAccounts } = postBusinessEvent(loanEvent, accounts);
      setAccounts(updatedAccounts);
      setEventsHistory(prev => [...prev, loanEvent]);
      setCurrentMonthEvents(prev => [...prev, loanEvent]);
      setJournalEntriesHistory(prev => [...prev, journalEntry]);
      setCfoSavings(prev => prev - amount);
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Repay bridge loan to CFO
  const handleCfoRepayBridgeLoan = (amount: number) => {
    const bs = calculateBalanceSheet(accounts);
    const companyCash = bs.cash;
    const outstandingBridgeLoan = bs.bridgeLoans;

    if (companyCash < amount || outstandingBridgeLoan < amount) return;

    const startYear = 2026;
    const totalMonthsVal = month - 1;
    const yearIdx = startYear + Math.floor(totalMonthsVal / 12);
    const monthIdx = (totalMonthsVal % 12) + 1;
    const monthStr = monthIdx < 10 ? `0${monthIdx}` : `${monthIdx}`;
    const dateStr = `${yearIdx}-${monthStr}-15`;

    const repayEvent: BusinessEvent = {
      id: `CFO-REPAY-${Date.now()}`,
      date: dateStr,
      description: `【過橋款清償】公司營運充裕、向股東 (CFO) 償還個人往來過橋借出款（償還 $${amount.toLocaleString()} 元），此項減少公司負債並回存至 CFO 私人儲蓄。`,
      amount,
      eventType: 'Purchase', // Debt 2003 Credit 1001
      industrySpecific: false,
      category: '償還股東過橋款'
    };

    try {
      const { journalEntry, updatedAccounts } = postBusinessEvent(repayEvent, accounts);
      setAccounts(updatedAccounts);
      setEventsHistory(prev => [...prev, repayEvent]);
      setCurrentMonthEvents(prev => [...prev, repayEvent]);
      setJournalEntriesHistory(prev => [...prev, journalEntry]);
      setCfoSavings(prev => prev + amount); // Repay goes back to CFO savings
    } catch (err) {
      console.error(err);
    }
  };

  // Call heuristic CFO engine for Remarks
  const requestCFOAdvice = (
    currentAccounts: Account[],
    monthlyEvts: BusinessEvent[],
    monthNum: number,
    ind: IndustryType
  ) => {
    setCfoLoading(true);
    
    // Simulate a short processing delay for better UX
    setTimeout(() => {
      try {
        const report = generateHeuristicCFOReport(ind, monthNum, currentAccounts, monthlyEvts);
        setCfoReport(report);
      } catch (e) {
        console.error("Failed to generate CFO report:", e);
        setCfoError(true);
      } finally {
        setCfoLoading(false);
      }
    }, 800);
  };

  // Perform dynamic strategic CFO de-escalation actions
  const handleExecuteAction = (actionId: string, cost: number, customTitle?: string, customEffect?: string) => {
    // 1. Verify cost feasibility
    const bs = calculateBalanceSheet(accounts);
    
    // When borrowing a loan, cost is native negative (meaning it infuses cash!)
    const isLoan = actionId === 'apply_loan';
    if (!isLoan && bs.cash < cost) {
      alert("⚠️ 當前庫存現金不足，無法執行此項戰略決策！先籌集資金或等待請款。");
      return;
    }

    const actualTitle = customTitle || cfoReport?.suggestedAction?.title || "未定戰略機制";
    const actualEffect = customEffect || cfoReport?.suggestedAction?.effect || "對沖未知風險";

    // 2. Add custom business event documenting the strategic intervention
    const actionEvent: BusinessEvent = {
      id: `CFO-ACT-${Date.now()}`,
      date: `2026-${month < 10 ? '0' + month : month}-29`,
      description: `【CFO 戰略決策】執行：${actualTitle}。對沖效果：${actualEffect}`,
      amount: isLoan ? -cost : cost, // Negative payment represents expense, loan represents inflow (+300k)
      eventType: isLoan ? 'Sale' : 'Purchase', // Loan behaves like investment capital, purchases like CapEx
      industrySpecific: false,
      category: isLoan ? '應收帳款請款' : '主營業務以外支出'
    };

    // Execute double-entry bookkeeping for active decision
    let updatedAccounts = [...accounts];
    
    if (isLoan) {
      // Debit: Cash 300,000, Credit: Long Term Loan 300,000
      const amountLoan = 300000;
      updatedAccounts = accounts.map(a => {
        if (a.id === "1001") return { ...a, balance: a.balance + amountLoan };
        if (a.id === "2002") return { ...a, balance: a.balance + amountLoan };
        return a;
      });

      const loanJournal: JournalEntry = {
        eventId: actionEvent.id,
        date: actionEvent.date,
        debits: [{ accountId: '1001', accountName: '現金及約當現金', amount: amountLoan }],
        credits: [{ accountId: '2002', accountName: '長期銀行借貸', amount: amountLoan }]
      };
      setJournalEntriesHistory(prev => [...prev, loanJournal]);
    } else {
      // It's a purchase strategy expense
      // Debit: 5004 (Operational loss/Other Expense), Credit: 1001 (Cash)
      updatedAccounts = accounts.map(a => {
        if (a.id === "1001") return { ...a, balance: a.balance - cost };
        if (a.id === "5004") return { ...a, balance: a.balance + cost };
        return a;
      });

      const expenseJournal: JournalEntry = {
        eventId: actionEvent.id,
        date: actionEvent.date,
        debits: [{ accountId: '5004', accountName: '營業損害與外包維護損失', amount: cost }],
        credits: [{ accountId: '1001', accountName: '現金及約當現金', amount: cost }]
      };
      setJournalEntriesHistory(prev => [...prev, expenseJournal]);
    }

    // Set interactive protection states!
    if (actionId === 'stop_poaching') {
      setSalaryMultiplier(1.15); // R&D salary raises, poaching chances eliminated
    } else if (actionId === 'cloud_audit') {
      setHasCloudAudit(true);
    } else if (actionId === 'hedging_materials') {
      setHasMaterialLock(true);
    } else if (actionId === 'safety_officer') {
      setHasSafetyOfficer(true);
    } else if (actionId === 'generic_marketing') {
      setSaasGrowthFactor(prev => prev + 0.15);
    }

    setExecutedAdviceIds(prev => [...prev, actionId]);

    setAccounts(updatedAccounts);
    setEventsHistory(prev => [...prev, actionEvent]);
    setCurrentMonthEvents(prev => [...prev, actionEvent]);

    // Update snapshots accordingly
    const updatedInc = calculateIncomeStatement(updatedAccounts);
    const updatedBs = calculateBalanceSheet(updatedAccounts);
    const latestSnapshotIdx = snapshots.length - 1;
    if (latestSnapshotIdx >= 0) {
      const updatedSnapshots = [...snapshots];
      updatedSnapshots[latestSnapshotIdx] = {
        month: month,
        cash: updatedBs.cash,
        revenue: updatedInc.revenue,
        expenses: updatedInc.totalExpense,
        netIncome: updatedInc.netIncome
      };
      setSnapshots(updatedSnapshots);
    }

    // Mark current decision as processed
    if (cfoReport && cfoReport.suggestedAction) {
      setCfoReport({
        ...cfoReport,
        suggestedAction: {
          ...cfoReport.suggestedAction,
          taken: true
        }
      });
    }
  };

  // Reset core simulation game state
  const handleResetGame = () => {
    setIsPlaying(false);
    setCompanyName('');
    setStep(1);
    setMonth(1);
    setAccounts(INITIAL_ACCOUNTS);
    setEventsHistory([]);
    setJournalEntriesHistory([]);
    setSnapshots([]);
    setCfoReport(null);
    setSaasGrowthFactor(1.0);
    setSalaryMultiplier(1.0);
    setHasCloudAudit(false);
    setHasMaterialLock(false);
    setHasSafetyOfficer(false);
    setHeadcount(10);
    setMarketStatus('Stagnant');
    setStockIndex(16500);
    setBtcPrice(64200);
    setCfoSavings(30000);
    setCfoStockUnits(0);
    setCfoBtcUnits(0);
    setOwnedProperties([]);
    setCurrentMonthEvents([]);
    setSelectedAdviceIndex(null);
    setExecutedAdviceIds([]);
  };

  // Render Income Statement helper values
  const incomeStatement = calculateIncomeStatement(accounts);
  // Render Balance Sheet helper values
  const balanceSheet = calculateBalanceSheet(accounts);

  // Financial safety percentage warning bar
  const warningPercentage = Math.min((balanceSheet.cash / (industry === 'SaaS' ? 500000 : 1200000)) * 100, 100);

  return (
    <div className="min-h-screen bg-[#020617] text-[#94a3b8] font-sans antialiased overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Visual background ambient grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-[#020617]/90 backdrop-blur-xl sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white uppercase flex items-center gap-2">
              CFO 智慧戰情室 <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded font-mono">V1.0 Expert Edition</span>
              <span className="flex items-center gap-2 ml-4 text-[10px] font-mono text-slate-500 lowercase border-l border-slate-800 pl-4">
                <span id="busuanzi_container_site_pv">pv: <b id="busuanzi_value_site_pv">...</b></span>
                <span id="busuanzi_container_site_uv">uv: <b id="busuanzi_value_site_uv">...</b></span>
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Strategic Simulator Command Center</p>
          </div>
        </div>

        {isPlaying && (
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-[10px] font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>
            <button
              onClick={handleResetGame}
              className="text-[10px] font-mono text-slate-500 hover:text-rose-450 border border-slate-800 bg-slate-950 px-2 py-1 rounded uppercase tracking-wider transition-colors cursor-pointer"
            >
              Reset Session
            </button>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {!isPlaying ? (
          <div className="max-w-xl mx-auto my-8 bg-slate-950 border border-slate-800 rounded p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            {step === 1 ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center space-x-1 bg-cyan-950 text-cyan-400 px-2.5 py-0.5 rounded text-[10px] font-mono border border-cyan-800 mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>CFO WAR ROOM SIMULATOR</span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-sans">
                    現代商業財務決策戰情室
                  </h2>
                  <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                    體驗真實複式簿記引擎！擔任臨時 CFO，面對 SaaS 訂閱或營建重資產行業，應對市場巨幅波動，配合專家智慧財務系統進行危機破局。
                  </p>
                </div>

                <div className="divide-y divide-slate-800 bg-slate-950 rounded border border-slate-800 p-4 space-y-3">
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    選擇營運領域 (SELECT SECTOR)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                    {/* SaaS Option */}
                    <div
                      onClick={() => setIndustry('SaaS')}
                      className={`relative p-4 rounded border transition-all duration-150 cursor-pointer flex flex-col justify-between h-40 ${
                        industry === 'SaaS'
                          ? 'border-cyan-500 bg-cyan-950/20 shadow-md'
                          : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold leading-none ${industry === 'SaaS' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-slate-500'}`}>
                            SaaS ACCRUAL
                          </span>
                          <Activity className={`w-4 h-4 ${industry === 'SaaS' ? 'text-cyan-400' : 'text-slate-500'}`} />
                        </div>
                        <h3 className="text-xs font-bold text-white">SaaS 雲端代管平台</h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                          高毛利、穩定訂閱制、每月初自動扣款滾動認列合約主營收入。面臨削價競爭與人才流失危機。
                        </p>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 flex justify-between items-center pt-2 border-t border-slate-800">
                        <span>創始資本: $500,000</span>
                        <span className="text-cyan-400 font-bold">高穩定</span>
                      </div>
                    </div>

                    {/* Construction Option */}
                    <div
                      onClick={() => setIndustry('Construction')}
                      className={`relative p-4 rounded border transition-all duration-150 cursor-pointer flex flex-col justify-between h-40 ${
                        industry === 'Construction'
                          ? 'border-cyan-500 bg-cyan-950/20 shadow-md'
                          : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold leading-none ${industry === 'Construction' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-slate-500'}`}>
                            CONSTRUCTION (HEAVY)
                          </span>
                          <Target className={`w-4 h-4 ${industry === 'Construction' ? 'text-cyan-400' : 'text-slate-500'}`} />
                        </div>
                        <h3 className="text-xs font-bold text-white">工程營建商</h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                          重資本、長週期、高變現波動。採購混凝土材料款極其昂貴，每3個月才按進度收取一筆工程款。
                        </p>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 flex justify-between items-center pt-2 border-t border-slate-800">
                        <span>創始資本: $1,200,000</span>
                        <span className="text-amber-500 font-bold">高槓桿</span>
                      </div>
                    </div>

                    {/* F&B Option */}
                    <div
                      onClick={() => setIndustry('F&B')}
                      className={`relative p-4 rounded border transition-all duration-150 cursor-pointer flex flex-col justify-between h-40 ${
                        industry === 'F&B'
                          ? 'border-cyan-500 bg-cyan-950/20 shadow-md'
                          : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold leading-none ${industry === 'F&B' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-slate-500'}`}>
                            F&B (RESTAURANT)
                          </span>
                          <Utensils className={`w-4 h-4 ${industry === 'F&B' ? 'text-cyan-400' : 'text-slate-500'}`} />
                        </div>
                        <h3 className="text-xs font-bold text-white">精緻連鎖餐飲</h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                          低單價、高頻次交易、現金流周轉極快。面臨租金壓力與嚴格的衛生食安考驗。
                        </p>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 flex justify-between items-center pt-2 border-t border-slate-800">
                        <span>創始資本: $300,000</span>
                        <span className="text-emerald-400 font-bold">高流動</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={() => setStep(2)}
                    className="inline-flex items-center px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg cursor-pointer font-mono"
                  >
                    <span>下一步 (CONTINUE)</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                /* FIRST_ONBOARDING_BLOCK_UNIQUE */
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h2 className="text-md font-bold text-white uppercase tracking-tight">設定企業名稱 (CONFIGURATION)</h2>
                  <p className="text-slate-500 text-[11px]">智慧系統要求所有合規財務主體必須命名以確保複式總帳正確登錄。</p>
                </div>

                <div className="space-y-3 font-mono">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold tracking-wider">
                      企業名稱 (ENTERPRISE UNIQUE ID)
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      placeholder="例如：浩克雲端科技、創世紀營造..."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-[#020617] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-cyan-500 transition font-sans"
                    />
                  </div>

                  <div id="first-block-regulation" className="p-3.5 rounded bg-slate-900/30 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 leading-relaxed font-sans">
                    <p className="font-bold text-slate-300 font-mono uppercase text-[10px] tracking-wider text-cyan-400">🚨 CFO 系統合規聲明 / REGULATION</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>以「月」為會計結帳週期。點擊進度鈕將自動認列每月損益並記入主營業務。</li>
                      <li>系統背後是由一套標準實時<b>複式記帳引擎</b>（Double-entry Bookkeeping）驅動。</li>
                      <li>每月的最新會計餘額表會自動傳送至專家戰情室，評估資產品質。</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    id="back-to-sector-btn"
                    onClick={() => setStep(1)}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition duration-150 cursor-pointer"
                  >
                    Back to Sector
                  </button>

                  <button
                    id="initialize-sim-btn"
                    onClick={handleStartGame}
                    disabled={!companyName.trim()}
                    className={`inline-flex items-center px-4 py-2 rounded text-xs uppercase tracking-wider font-bold transition duration-200 cursor-pointer ${
                      companyName.trim()
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                        : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <span>啟動戰備模擬 (INITIALIZE)</span>
                    <Play className="w-3.5 h-3.5 ml-1 animate-pulse" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

        ) : (
          
          /* Operational Simulation Room Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* Left Hand Sidebar Widget Card */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Profile Card Summary */}
              <div className="bg-slate-950 border border-slate-800 rounded p-4 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/5 to-transparent blur-xl pointer-events-none" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase font-bold">
                        CFO DECISION DESK v1.0
                      </span>
                      <h3 className="text-md font-bold text-white truncate max-w-[180px] font-mono uppercase tracking-tight">
                        {companyName}
                      </h3>
                    </div>
                    <span className="inline-flex px-1.5 py-0.5 text-[9px] font-bold font-mono rounded uppercase bg-cyan-950 border border-cyan-800 text-cyan-400 leading-none">
                      {industry === 'SaaS' ? 'SaaS ACCRUAL' : industry === 'Construction' ? 'CONTRACTOR HEAVY' : 'F&B RETAIL'}
                    </span>
                  </div>

                  {/* Cash metrics tracker */}
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[10px] uppercase text-slate-500 font-bold mb-1 block tracking-widest font-mono">Available Cash</span>
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        ${balanceSheet.cash.toLocaleString()} 元
                      </span>
                    </div>

                    {/* Progress tracking gauge */}
                    <div className="w-full bg-[#020617] rounded h-1.5 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          balanceSheet.cash < 100000 
                            ? 'bg-rose-500 animate-pulse' 
                            : balanceSheet.cash < 300000 
                              ? 'bg-amber-500' 
                              : 'bg-cyan-500'
                        }`}
                        style={{ width: `${warningPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold mb-1.5 block tracking-widest font-mono">Sector Active</span>
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded">
                      <div className="text-cyan-400 font-bold text-[11px] uppercase font-mono">
                        {industry === 'SaaS' ? 'SaaS (LIGHT PLATFORM)' : industry === 'Construction' ? 'CONSTRUCTION (HEAVY)' : 'F&B (RESTAURANT)'}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">Cycle: Project Cycle M{month < 10 ? '0' + month : month} / Accrual Basis</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold mb-1.5 block tracking-widest font-mono">Operational Parameters</span>
                    <ul className="text-[10px] space-y-1 font-mono">
                      <li className="flex justify-between border-b border-slate-900 pb-0.5">
                        <span className="text-slate-500">SaaS Growth Rate</span>
                        <span className="text-white font-mono">{(saasGrowthFactor * 100).toFixed(0)}%</span>
                      </li>
                      <li className="flex justify-between border-b border-slate-900 pb-0.5">
                        <span className="text-slate-500">Poaching Shield</span>
                        <span className={salaryMultiplier > 1.0 ? "text-cyan-400 font-bold" : "text-slate-500"}>{salaryMultiplier > 1.0 ? "Active (1.15x)" : "Inactive"}</span>
                      </li>
                      <li className="flex justify-between border-b border-slate-900 pb-0.5">
                        <span className="text-slate-500">Dual Live Server</span>
                        <span className={hasCloudAudit ? "text-cyan-400 font-bold" : "text-slate-500"}>{hasCloudAudit ? "Protected" : "None"}</span>
                      </li>
                      <li className="flex justify-between border-b border-slate-900 pb-0.5">
                        <span className="text-slate-500">Material Hedge Contract</span>
                        <span className={hasMaterialLock ? "text-cyan-400 font-bold" : "text-slate-500"}>{hasMaterialLock ? "Locked" : "Variable"}</span>
                      </li>
                    </ul>
                  </div>

                  {/* PROMINENT CLIMATE QUOTE */}
                  <div className="border-t border-slate-900 pt-3">
                    <span className="text-[10px] uppercase text-slate-500 font-bold mb-1.5 block tracking-widest font-mono">Global Macro Climate (全球總經與金融指標)</span>
                    <div className="p-2.5 bg-slate-900/30 border border-slate-900 rounded space-y-1.5 text-[10px] font-mono">
                      <div className="flex justify-between items-center pb-1 border-b border-slate-900/40">
                        <span className="text-slate-400">景氣氣候</span>
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] uppercase border ${
                          marketStatus === 'Bull' 
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' 
                            : marketStatus === 'Bear' 
                              ? 'bg-rose-950/40 text-rose-400 border-rose-800' 
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}>
                          {marketStatus === 'Bull' ? '🚀 多頭牛市' : marketStatus === 'Bear' ? '📉 蕭條熊市' : '⚖️ 盤整震盪'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[10px]">
                        <span>大盤股指 ETF</span>
                        <span className="text-slate-200 font-semibold">{stockIndex.toLocaleString()} PTS</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[10px]">
                        <span>比特幣報價 (BTC)</span>
                        <span className="text-amber-500 font-bold">${btcPrice.toLocaleString()} USD</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="bg-blue-950/20 border border-blue-900/45 p-3 rounded mb-3">
                      <div className="text-[9px] text-blue-400 uppercase font-bold mb-0.5 font-mono">Current Round</div>
                      <div className="text-xl text-white font-mono leading-none font-bold">MONTH {month < 10 ? '0' + month : month}</div>
                      <div className="text-[9px] text-blue-500 mt-1 uppercase font-mono tracking-tighter">Q{(Math.floor((month - 1) / 3) % 4) + 1} Fiscal Cycle | {industry.toUpperCase()}</div>
                    </div>

                    <button
                      onClick={handleNextMonth}
                      disabled={cfoLoading}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 px-4 rounded text-xs uppercase tracking-widest transition-colors shadow-lg shadow-cyan-900/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1 font-mono"
                    >
                      {cfoLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>ANALYZING...</span>
                        </>
                      ) : (
                        <>
                          <span>Commit Transactions</span>
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </>
                      )}
                    </button>
                    <p className="text-[9px] text-slate-500 font-mono text-center mt-2 leading-normal">
                      * 點擊提交將自動前進下個月，生成交易憑證並強制過帳計入總帳中。
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Mini Balance Sheet Chart */}
              <div className="bg-slate-950 border border-slate-800 rounded p-4 text-[11px] space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                  <h4 className="font-semibold text-slate-300 uppercase text-[9px] tracking-wider">Accounting Balance Audit</h4>
                  <span className="inline-flex px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-900 text-[9px] font-mono text-cyan-400">
                    BALANCED 借貸相抵
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Total Assets (總資產)</span>
                    <span className="text-white font-mono">${balanceSheet.totalAssets.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 text-slate-500 border-t border-slate-900">
                    <span>Total Liabilities (總負債)</span>
                    <span className="text-white font-mono">${balanceSheet.totalLiabilities.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Shareholder Equity (股東權益)</span>
                    <span className="text-white font-mono">${balanceSheet.totalEquity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 text-cyan-400 border-t border-slate-800 font-bold">
                    <span>Total L & E (負債與權益合計)</span>
                    <span className="font-mono">${(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900/30 rounded border border-slate-900 text-[9px] text-slate-500 leading-relaxed">
                  <Info className="w-3 h-3 inline mr-1 text-cyan-500" />
                  會計引擎恆等式驗證：
                  <span className="text-slate-400">資產 = 負債 + 權益</span> (${balanceSheet.totalAssets} = ${balanceSheet.totalLiabilities} + ${balanceSheet.totalEquity})
                </div>
              </div>

            </div>

            {/* Right Hand Detailed Widgets Area */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Main Sub Tab buttons */}
              <div className="grid grid-cols-5 border border-slate-800 bg-[#020617] rounded overflow-hidden">
                
                <button
                  onClick={() => setActiveTab('cfo')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 text-[10px] font-mono uppercase tracking-wider font-bold border-r border-slate-800 transition-colors cursor-pointer ${
                    activeTab === 'cfo'
                      ? 'bg-slate-900 text-cyan-400 border-b border-b-cyan-500'
                      : 'text-slate-500 bg-[#020617] hover:text-slate-300 hover:bg-slate-900/30'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CFO 專家診斷</span>
                </button>

                <button
                  onClick={() => setActiveTab('ledger')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 text-[10px] font-mono uppercase tracking-wider font-bold border-r border-slate-800 transition-colors cursor-pointer ${
                    activeTab === 'ledger'
                      ? 'bg-slate-900 text-cyan-400 border-b border-b-cyan-500'
                      : 'text-slate-500 bg-[#020617] hover:text-slate-300 hover:bg-slate-900/30'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>LEDGER 明細</span>
                </button>

                <button
                  onClick={() => setActiveTab('statements')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 text-[10px] font-mono uppercase tracking-wider font-bold border-r border-slate-800 transition-colors cursor-pointer ${
                    activeTab === 'statements'
                      ? 'bg-slate-900 text-cyan-400 border-b border-b-cyan-500'
                      : 'text-slate-500 bg-[#020617] hover:text-slate-300 hover:bg-slate-900/30'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>STATEMENTS 報表</span>
                </button>

                <button
                  onClick={() => setActiveTab('charts')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 text-[10px] font-mono uppercase tracking-wider font-bold border-r border-slate-800 transition-colors cursor-pointer ${
                    activeTab === 'charts'
                      ? 'bg-slate-900 text-cyan-400 border-b border-b-cyan-500'
                      : 'text-slate-500 bg-[#020617] hover:text-slate-300 hover:bg-slate-900/30'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>TREND ANALYTICS</span>
                </button>

                <button
                  onClick={() => setActiveTab('market_life')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 text-[10px] font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                    activeTab === 'market_life'
                      ? 'bg-slate-900 text-cyan-400 border-b border-b-cyan-500'
                      : 'text-slate-500 bg-[#020617] hover:text-slate-300 hover:bg-slate-900/30'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>MARKET & CFO LIFE</span>
                </button>

              </div>

              {/* Display Active Tab Contents */}
              <div className="bg-slate-950 border border-slate-800 rounded p-4 min-h-[460px] relative overflow-hidden">
                <AnimatePresence mode="wait">
                  
                  {/* TAB 1: CFO Expert Diagnostic Center */}
                  {activeTab === 'cfo' && (
                    <motion.div
                      key="cfo-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Live flashing ticker header */}
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                        <div className="flex items-center space-x-2 text-slate-300 font-bold">
                          <Sparkles className="w-4 h-4 text-teal-400" />
                          <span>CFO 專家智慧財務決策室</span>
                        </div>

                        {cfoReport && (
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono text-slate-500">當前安全警示級別：</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold font-sans transition-all duration-500 ${
                                cfoReport.warningStatus === 'danger'
                                  ? 'bg-red-500/20 border border-red-500/45 text-red-400 animate-pulse'
                                  : cfoReport.warningStatus === 'warning'
                                    ? 'bg-amber-500/20 border border-amber-500/45 text-amber-400'
                                    : 'bg-emerald-500/20 border border-emerald-500/45 text-emerald-400'
                              }`}
                            >
                              {cfoReport.warningStatus === 'danger'
                                ? '● Danger (流動性告急)'
                                : cfoReport.warningStatus === 'warning'
                                  ? '● Warning (防禦收窄)'
                                  : '● Safe (平穩營運)'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Loading Screen Overlay */}
                      {cfoLoading && (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                          <div className="w-10 h-10 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
                          <div className="text-center space-y-1">
                            <p className="text-sm font-mono text-slate-300">專家系統正在核對總帳分錄與現金流...</p>
                            <p className="text-xs text-slate-500 leading-none">正在計算毛利率與風險因子</p>
                          </div>
                        </div>
                      )}

                      {/* CFO Render screen */}
                      {!cfoLoading && cfoReport && (
                        <div className="space-y-6">
                          
                          {/* Executive diagnosis report card */}
                          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
                            <div className="space-y-2">
                              <span className="text-[10px] font-mono text-slate-500 tracking-wider block uppercase">CFO EXECUTIVE SUMMARY</span>
                              <p className="text-sm text-slate-300 leading-relaxed font-sans">{cfoReport.summary}</p>
                            </div>
                          </div>

                          {/* Tactical Action Bullet List */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block">
                                CFO 專家營運改善建議（請點擊下方方針以執行決策）
                              </span>
                              {selectedAdviceIndex !== null && (
                                <button
                                  onClick={() => setSelectedAdviceIndex(null)}
                                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                                >
                                  [ 清除選取 / RESET SELECTION ]
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 gap-3.5 pt-1">
                              {cfoReport.advice.map((item, idx) => {
                                const isSelected = selectedAdviceIndex === idx;
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => setSelectedAdviceIndex(isSelected ? null : idx)}
                                    className={`flex items-start space-x-3 p-3.5 rounded-lg transition-all duration-150 cursor-pointer border ${
                                      isSelected
                                        ? 'bg-teal-950/40 border-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.25)]'
                                        : 'bg-slate-900/30 border-slate-855 hover:bg-slate-900/60 hover:border-slate-700'
                                    }`}
                                  >
                                    <div className={`p-1.5 rounded mt-0.5 border transition ${
                                      isSelected 
                                        ? 'bg-teal-500 text-slate-950 border-teal-400' 
                                        : 'bg-teal-500/10 text-teal-400 border-teal-500/15'
                                    }`}>
                                      <Lightbulb className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className={`text-xs font-semibold ${isSelected ? 'text-teal-400' : 'text-slate-300'}`}>
                                          策略方針 #{idx + 1}
                                        </span>
                                        {isSelected ? (
                                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500 text-slate-950 font-bold uppercase tracking-wider font-mono leading-none">
                                            已選定 / ACTIVE
                                          </span>
                                        ) : (
                                          <span className="text-[9px] text-slate-500 font-mono">
                                            點擊選取 / SELECTABLE
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-400 leading-relaxed font-sans">{item}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Selected Advice Strategy Plan Details card */}
                          {selectedAdviceIndex !== null && cfoReport.advice[selectedAdviceIndex] && (() => {
                            const dynAction = getDynamicActionFromAdvice(cfoReport.advice[selectedAdviceIndex], selectedAdviceIndex);
                            const isTaken = dynAction.alreadyTaken || executedAdviceIds.includes(dynAction.actionId);
                            
                            return (
                              <div className="p-5 rounded-xl bg-gradient-to-r from-teal-950/30 to-slate-900/40 border border-teal-500/30 space-y-4 shadow-xl">
                                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                                  <div className="space-y-1">
                                    <span className="inline-flex px-1.5 py-0.5 rounded bg-teal-500/10 text-[9px] font-mono text-teal-400 border border-teal-500/20 uppercase tracking-widest leading-none font-bold">
                                      策略方針 #{selectedAdviceIndex + 1} 執行計畫
                                    </span>
                                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
                                      <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                                      {dynAction.title}
                                    </h4>
                                  </div>

                                  <div className="text-right font-mono">
                                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Estimated Outgoings</span>
                                    <span className={`text-xs font-bold ${dynAction.cost <= 0 ? 'text-emerald-400' : 'text-teal-400'}`}>
                                      {dynAction.cost <= 0 
                                        ? `融資撥款: +$${Math.abs(dynAction.cost).toLocaleString()} 元` 
                                        : `執行成本: $${dynAction.cost.toLocaleString()} 元`}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                                    <b className="text-slate-300">方針指導與防護效果：</b>{dynAction.effect}
                                  </p>
                                </div>

                                <div className="flex justify-end items-center pt-1">
                                  {isTaken ? (
                                    <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-teal-950/20 text-teal-400 border border-teal-800/40 text-[11px] font-bold">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                      <span>本回合已核定執行此方針 (Journal Entered)</span>
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleExecuteAction(dynAction.actionId, dynAction.cost, dynAction.title, dynAction.effect)}
                                      className="px-4 py-2 text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 rounded-lg transition duration-150 shadow-md cursor-pointer flex items-center space-x-1"
                                    >
                                      <ArrowUpRight className="w-3.5 h-3.5" />
                                      <span>核定執行此項方針決策</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* SUGGESTED DECISION COMPONENT (Tactic action card) */}
                          {cfoReport.suggestedAction && (
                            <div className="p-5 rounded-xl bg-gradient-to-r from-teal-950/20 to-indigo-950/20 border border-teal-500/20 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <span className="inline-flex px-1.5 py-0.5 rounded bg-teal-500/10 text-[9px] font-mono text-teal-400 border border-teal-500/20">
                                    當月緊急 CFO 戰略推薦
                                  </span>
                                  <h4 className="text-sm font-bold text-slate-200">
                                    {cfoReport.suggestedAction.title}
                                  </h4>
                                </div>

                                <span className="font-mono text-xs font-bold text-teal-400">
                                  執行成本: ${Math.abs(cfoReport.suggestedAction.cost).toLocaleString()} 元
                                </span>
                              </div>

                              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                                <b>決策預期效果：</b>{cfoReport.suggestedAction.effect}
                              </p>

                              <div className="flex justify-end items-center">
                                {cfoReport.suggestedAction.taken ? (
                                  <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 text-teal-400 border border-slate-800 text-xs font-bold">
                                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                                    <span>本回合決策已執行過帳</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleExecuteAction(cfoReport?.suggestedAction?.id || '', cfoReport?.suggestedAction?.cost || 0)}
                                    className="px-4 py-2 text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 rounded-lg transition duration-150 shadow-md cursor-pointer flex items-center space-x-1"
                                  >
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    <span>確核執行決策</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      )}

                      {/* Display first turn onboarding placeholder */}
                      {!cfoLoading && !cfoReport && (
                        <div className="py-20 text-center space-y-4 font-mono text-slate-500">
                          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                          <p className="text-xs">
                            尚無模擬財報，請先前進下個月獲取最初的商業交易！
                          </p>
                        </div>
                      )}

                      {/* Error fallback advice */}
                      {cfoError && (
                        <div className="p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 text-xs flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>專家診斷系統暫時無法處理當前財報數據。</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 2: Ledgers / Transactions Feed */}
                  {activeTab === 'ledger' && (
                    <motion.div
                      key="ledger-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                        <div className="flex items-center space-x-2 text-slate-300 font-bold">
                          <FileText className="w-4 h-4 text-teal-400" />
                          <span>商業事件原始交易憑證與分錄紀錄 (Ledger Book)</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          累積合計：{eventsHistory.length} 筆憑證
                        </span>
                      </div>

                      {/* Events history ledger map stream */}
                      {eventsHistory.length === 0 ? (
                        <p className="py-20 text-center text-slate-600">本期尚未發生任何商業事件交易</p>
                      ) : (
                        <div className="space-y-2.5">
                          {[...eventsHistory].reverse().map((evt) => {
                            const isExpanded = expandedEventId === evt.id;
                            const journal = journalEntriesHistory.find(j => j.eventId === evt.id);

                            return (
                              <div
                                key={evt.id}
                                className="border border-slate-900 hover:border-slate-800 rounded-xl bg-slate-900/20 overflow-hidden transition"
                              >
                                {/* Quick header line */}
                                <div
                                  onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                                  className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 cursor-pointer hover:bg-slate-900/40"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-slate-500 text-[10px]">{evt.date}</span>
                                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold leading-none ${
                                        evt.eventType === 'Sale'
                                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30'
                                          : evt.eventType === 'Payroll'
                                            ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
                                            : evt.eventType === 'Purchase'
                                              ? 'bg-purple-950/40 text-purple-400 border border-purple-900/30'
                                              : 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/30'
                                      }`}>
                                        {evt.category}
                                      </span>
                                    </div>
                                    <h4 className="text-xs font-semibold text-slate-200 tracking-tight font-sans">
                                      {evt.description}
                                    </h4>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <span className={`font-bold ${evt.amount >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                                      {evt.amount >= 0 ? '+' : '-'}${Math.abs(evt.amount).toLocaleString()} 元
                                    </span>
                                    <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                  </div>
                                </div>

                                {/* GAAP Underlying Double Entry mapping expanded details */}
                                {isExpanded && journal && (
                                  <div className="bg-slate-950/80 border-t border-slate-900 p-4 space-y-3 font-mono">
                                    <div className="flex justify-between items-center text-[10px] text-slate-500 tracking-wider">
                                      <span>會計傳票編號: {journal.eventId}</span>
                                      <span>會計認列標準: 權責發生制 (GAAP / IFRS)</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Debits Leg */}
                                      <div className="space-y-1 rounded border border-slate-800/40 p-2.5 bg-slate-900/10">
                                        <div className="flex justify-between font-bold text-teal-400 text-[10px] border-b border-teal-500/20 pb-1 mb-1">
                                          <span>借方 (Debit)</span>
                                          <span>金額</span>
                                        </div>
                                        {journal.debits.map((d, i) => (
                                          <div key={i} className="flex justify-between text-slate-300 text-[11px]">
                                            <span>[{d.accountId}] {d.accountName}</span>
                                            <span>${d.amount.toLocaleString()}</span>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Credits Leg */}
                                      <div className="space-y-1 rounded border border-slate-800/40 p-2.5 bg-slate-900/10">
                                        <div className="flex justify-between font-bold text-rose-400 text-[10px] border-b border-rose-500/20 pb-1 mb-1">
                                          <span>貸方 (Credit)</span>
                                          <span>金額</span>
                                        </div>
                                        {journal.credits.map((c, i) => (
                                          <div key={i} className="flex justify-between text-slate-300 text-[11px]">
                                            <span>[{c.accountId}] {c.accountName}</span>
                                            <span>${c.amount.toLocaleString()}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="text-[9px] text-slate-500 text-right leading-none">
                                      借貸平衡稽核：等式平衡驗證：
                                      分錄借貸差額 ${(journal.debits.reduce((s,i)=>s+i.amount,0) - journal.credits.reduce((s,i)=>s+i.amount,0))} 元
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 3: Financial Statements (三大表) */}
                  {activeTab === 'statements' && (
                    <motion.div
                      key="statements-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                        <div className="flex items-center space-x-2 text-slate-300 font-bold">
                          <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                          <span>隨月份動態認列結帳三大財務報表 (GAAP Statements)</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          決策回合：Month {month}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* 1. INCOME STATEMENT */}
                        <div className="space-y-4 rounded-xl border border-slate-900 p-4 bg-slate-900/10">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <h3 className="font-bold text-slate-200">損益表 (Income Statement)</h3>
                            <span className="text-[10px] text-slate-500">當期累計數</span>
                          </div>

                          <div className="space-y-2.5">
                            <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded text-slate-400">
                              <span className="font-sans font-medium text-slate-300">主營業務收入 (Sales Revenue)</span>
                              <span className="text-emerald-400 font-bold">${incomeStatement.revenue.toLocaleString()}</span>
                            </div>

                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider pl-1 pt-1">
                              營業成本與費用：
                            </p>

                            <div className="pl-2 space-y-1.5 border-l border-slate-800">
                              <div className="flex justify-between items-center text-slate-400">
                                <span>研發及行政人事薪資</span>
                                <span className="text-slate-300">${incomeStatement.salaries.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-400">
                                <span>營建材料及施工成本</span>
                                <span className="text-slate-300">${incomeStatement.materials.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-400">
                                <span>雲端主機委託與維運費</span>
                                <span className="text-slate-300">${incomeStatement.servers.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-400">
                                <span>工安與意外賠償損失</span>
                                <span className="text-slate-300">${incomeStatement.losses.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-slate-400">
                              <span>營業及外包總費用 (Total Expenses)</span>
                              <span className="text-slate-200 font-bold">${incomeStatement.totalExpense.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center p-2 rounded bg-indigo-950/40 border border-indigo-900/30 text-[11px] font-bold text-indigo-300">
                              <span className="font-sans">當期淨利潤 (Net Income)</span>
                              <span>${incomeStatement.netIncome.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* 2. BALANCE SHEET COMPONENT */}
                        <div className="space-y-4 rounded-xl border border-slate-900 p-4 bg-slate-900/10">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <h3 className="font-bold text-slate-200">資產負債表 (Balance Sheet)</h3>
                            <span className="text-[10px] text-slate-500">期末餘額數</span>
                          </div>

                          <div className="space-y-3">
                            {/* Asset Division */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[10px] text-teal-400 font-bold uppercase tracking-wider border-b border-teal-900/30 pb-0.5">
                                <span>資產類別 (Assets)</span>
                                <span>餘額</span>
                              </div>
                              <div className="flex justify-between text-slate-400 pl-1">
                                <span>現金及約當現金</span>
                                <span className="text-slate-200">${balanceSheet.cash.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-slate-400 pl-1">
                                <span>應收帳款 (Receivables)</span>
                                <span className="text-slate-200">${balanceSheet.receivables.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-slate-400 pl-1">
                                <span>營運生財設備 (Fixed Assets)</span>
                                <span className="text-slate-200">${balanceSheet.equipment.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-slate-300 pl-1 font-bold pt-1 border-t border-slate-800/30">
                                <span>資產合計 (Total Assets)</span>
                                <span>${balanceSheet.totalAssets.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Liability and Equity Division */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between text-[10px] text-rose-400 font-bold uppercase tracking-wider border-b border-rose-900/30 pb-0.5">
                                <span>負債與權益 (Liabilities & Equity)</span>
                                <span>餘額</span>
                              </div>
                              <div className="flex justify-between text-slate-400 pl-1">
                                <span>應付帳款 (Payables)</span>
                                <span className="text-slate-200">${balanceSheet.payables.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-slate-400 pl-1">
                                <span>長期銀行借貸 (Loans)</span>
                                <span className="text-slate-200">${balanceSheet.loans.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-slate-400 pl-1">
                                <span>創始資本股本</span>
                                <span className="text-slate-200">${balanceSheet.equityCapital.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-slate-400 pl-1">
                                <span>累積盈餘 (Retained Earnings)</span>
                                <span className="text-slate-200">${balanceSheet.retainedEarnings.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-slate-300 pl-1 font-bold pt-1 border-t border-slate-800/30">
                                <span>負債與權益合計</span>
                                <span>${(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toLocaleString()}</span>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: Visualizing charts */}
                  {activeTab === 'charts' && (
                    <motion.div
                      key="charts-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                        <div className="flex items-center space-x-2 text-slate-300 font-bold">
                          <Activity className="w-4 h-4 text-teal-400" />
                          <span>現金流及收益變遷圖表 (Analytical Visuals)</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          累積記錄回合：{snapshots.length} 個月
                        </span>
                      </div>

                      {snapshots.length < 2 ? (
                        <div className="py-24 text-center space-y-4 font-mono text-slate-500">
                          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                          <p className="text-xs">
                            圖表至少需要 2 個月的歷史數據才能渲染趨勢！請多前進幾個回合。
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono text-xs">
                          
                          {/* Cash Flow Area Chart */}
                          <div className="space-y-2 p-4 bg-slate-950/40 rounded-xl border border-slate-900">
                            <span className="font-semibold text-slate-300">現金水位變遷軌跡 (以NTD計)</span>
                            <div className="h-64 pt-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={snapshots}>
                                  <defs>
                                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#2c3e50" opacity={0.1} />
                                  <XAxis dataKey="month" stroke="#475569" tickFormatter={(val) => `M${val}`} />
                                  <YAxis stroke="#475569" width={60} tickFormatter={(val) => `$${val/1000}k`} />
                                  <Tooltip
                                    contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "8px" }}
                                    formatter={(value: any) => [`$${value.toLocaleString()} 元`, "現金庫存"]}
                                    labelFormatter={(val) => `第 ${val} 回合`}
                                  />
                                  <Area type="monotone" dataKey="cash" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorCash)" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Revenue vs Expenses Bar chart */}
                          <div className="space-y-2 p-4 bg-slate-950/40 rounded-xl border border-slate-900">
                            <span className="font-semibold text-slate-300">每月利潤損益變動對比</span>
                            <div className="h-64 pt-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={snapshots}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#2c3e50" opacity={0.1} />
                                  <XAxis dataKey="month" stroke="#475569" tickFormatter={(val) => `M${val}`} />
                                  <YAxis stroke="#475569" width={60} tickFormatter={(val) => `$${val/1000}k`} />
                                  <Tooltip
                                    contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "8px" }}
                                    labelFormatter={(val) => `第 ${val} 回合`}
                                    formatter={(value: any) => [`$${value.toLocaleString()} 元`]}
                                  />
                                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="認列營收" />
                                  <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} name="認列費用" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 5: Market Sentiment and CFO Life */}
                  {activeTab === 'market_life' && (
                    <motion.div
                      key="market-life-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div className="flex items-center space-x-2 text-slate-300 font-bold">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span>景氣調度與 CFO 個人生涯自留地</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          Personal savings accounts & headcount
                        </span>
                      </div>

                      {/* Top Row: Headcount and Market */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* 1. Headcount Control Card */}
                        <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-300 flex items-center gap-1.5 font-mono">
                              <Users className="w-4 h-4 text-cyan-400" />
                              公司人員編制與招聘 (HR)
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              下回合支出/產銷影響
                            </span>
                          </div>

                          <div className="bg-[#020617] p-3 rounded border border-slate-900 flex items-center justify-between font-mono">
                            <div>
                              <div className="text-[9px] text-slate-500 uppercase">當前員額編制</div>
                              <div className="text-xl font-bold text-white tracking-widest">{headcount} <span className="text-xs text-slate-400 font-normal">人</span></div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] text-slate-500 uppercase">月度薪資預期</div>
                              <div className="text-sm font-bold text-rose-400">
                                ${(headcount * (industry === 'SaaS' ? 18000 : 4000)).toLocaleString()} 元
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-[11px] text-slate-400 font-sans leading-relaxed">
                            <p className="flex justify-between">
                              <span>員工人均基本薪資 / 雇工日工資：</span>
                              <span className="text-slate-300 font-mono">{industry === 'SaaS' ? '$18,000 元/月' : '$4,000 元/月'}</span>
                            </p>
                            <p className="flex justify-between">
                              <span>當前員工產能效益因子：</span>
                              <span className="text-cyan-400 font-bold font-mono">
                                {industry === 'SaaS' 
                                  ? `${((0.6 + 0.4 * (headcount / 10)) * 100).toFixed(0)}%`
                                  : `${((0.5 + 0.5 * (headcount / 30)) * 100).toFixed(0)}%`}
                              </span>
                            </p>
                            <div className="text-[10px] text-slate-500 leading-normal pt-1 p-2 bg-slate-900/50 rounded border border-slate-800/40">
                              💡 <b>產銷法則：</b>{industry === 'SaaS' 
                                ? "增加員工可提升訂閱收入的產能因子。如低於 10 人產能將折損，高於 10 人將有超額研發與行銷紅利。"
                                : "充足工班人力可以加快工程進度、拉升請款額度。如低於 30 人工程將落後，高於 30 人有高額完工速度溢價。"}
                            </div>
                          </div>

                          {/* Hiring button actions */}
                          <div className="flex gap-2">
                            <div className="flex-1 flex flex-col gap-1.5">
                              <span className="text-[9px] font-mono text-slate-500 uppercase text-center">擴編招攬 (Hire)</span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => setHeadcount(prev => prev + 1)}
                                  className="flex-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 font-bold py-1.5 px-2 rounded font-mono text-[10px] cursor-pointer text-center flex items-center justify-center gap-1 border border-cyan-800/40"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  招募 +1
                                </button>
                                <button
                                  onClick={() => setHeadcount(prev => prev + 5)}
                                  className="flex-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 font-bold py-1.5 px-2 rounded font-mono text-[10px] cursor-pointer text-center flex items-center justify-center gap-1 border border-cyan-800/40"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  招募 +5
                                </button>
                              </div>
                            </div>

                            <div className="flex-1 flex flex-col gap-1.5">
                              <span className="text-[9px] font-mono text-slate-500 uppercase text-center">預算縮編 (Lay Off)</span>
                              <div className="flex gap-1.5">
                                <button
                                  disabled={headcount <= 1}
                                  onClick={() => setHeadcount(prev => Math.max(1, prev - 1))}
                                  className="flex-grow flex-1 bg-rose-950 hover:bg-rose-900 text-rose-400 font-bold py-1.5 px-2 rounded font-mono text-[10px] cursor-pointer text-center flex items-center justify-center gap-1 border border-rose-800/40 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <UserMinus className="w-3 h-3" />
                                  裁撤 -1
                                </button>
                                <button
                                  disabled={headcount <= 5}
                                  onClick={() => setHeadcount(prev => Math.max(1, prev - 5))}
                                  className="flex-grow flex-1 bg-rose-950 hover:bg-rose-900 text-rose-400 font-bold py-1.5 px-2 rounded font-mono text-[10px] cursor-pointer text-center flex items-center justify-center gap-1 border border-rose-800/40 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <UserMinus className="w-3 h-3" />
                                  裁撤 -5
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Market Sentiment indicator Card */}
                        <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-300 flex items-center gap-1.5 font-mono">
                              <TrendingUp className="w-4 h-4 text-emerald-400" />
                              總體宏觀金融市場行情
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              按月震盪變動
                            </span>
                          </div>

                          {/* Dynamic sentiment header */}
                          <div className={`p-3.5 rounded-lg border flex items-center justify-between ${
                            marketStatus === 'Bull' 
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                              : marketStatus === 'Bear' 
                                ? 'bg-rose-950/20 border-rose-500/30 text-rose-400' 
                                : 'bg-slate-900/50 border-slate-800 text-slate-300'
                          }`}>
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase font-mono tracking-wider opacity-60">
                                全球總經氣候
                              </span>
                              <h4 className="text-sm font-bold font-mono">
                                {marketStatus === 'Bull' && "🚀 牛市繁榮 (Bull Market)"}
                                {marketStatus === 'Bear' && "📉 熊市崩盤 (Bear Market)"}
                                {marketStatus === 'Stagnant' && "⚖️ 平穩過渡 (Stagnant Cycle)"}
                              </h4>
                            </div>
                            <span className="text-xs font-bold px-2 py-1 rounded bg-black/40 border border-current font-mono">
                              {marketStatus === 'Bull' && "+25% 營收加成"}
                              {marketStatus === 'Bear' && "-25% 產量折損"}
                              {marketStatus === 'Stagnant' && "100% 穩定營運"}
                            </span>
                          </div>

                          {/* Stock and Speculation rates */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-[#020617] border border-slate-900 rounded font-mono">
                              <span className="text-[9px] text-slate-500 block uppercase">股市大盤 ETF 指數</span>
                              <span className="text-[13px] font-bold text-slate-200">
                                {stockIndex.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">PTS</span>
                              </span>
                              <span className={`text-[10px] block mt-1 ${
                                marketStatus === 'Bull' ? 'text-emerald-400' : marketStatus === 'Bear' ? 'text-rose-400' : 'text-slate-500'
                              }`}>
                                {marketStatus === 'Bull' ? '📈 股市多頭主升' : marketStatus === 'Bear' ? '📉 熊市流動性枯竭' : '⚖️ 橫盤窄幅震盪'}
                              </span>
                            </div>

                            <div className="p-3 bg-[#020617] border border-slate-900 rounded font-mono">
                              <span className="text-[9px] text-slate-500 block uppercase">比特幣 (BTC) 報價</span>
                              <span className="text-[13px] font-bold text-amber-500">
                                ${btcPrice.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">USD</span>
                              </span>
                              <span className={`text-[10px] block mt-1 ${
                                marketStatus === 'Bull' ? 'text-emerald-400' : marketStatus === 'Bear' ? 'text-rose-400' : 'text-slate-500'
                              }`}>
                                {marketStatus === 'Bull' ? '🚀 虛擬資產狂潮' : marketStatus === 'Bear' ? '💔 幣圈極度恐慌' : '⌛ 籌碼盤整階段'}
                              </span>
                            </div>
                          </div>

                          {/* Historical trend guidance snippet */}
                          <p className="text-[10px] text-slate-500 leading-relaxed bg-[#020617] p-2 rounded border border-slate-900 font-sans">
                            📝 <b>宏觀秘笈：</b>市場行情會在每月「提交回合」時隨機演變，並大幅影響公司的銷售認列額度！同時，這是您私人投資大盤與比特幣的最佳時機，低買高賣即可暴富！
                          </p>

                        </div>

                      </div>

                      {/* Bottom Section: CFO Personal Life */}
                      <div className="p-5 bg-gradient-to-br from-slate-900/40 via-[#030712] to-slate-950 border border-slate-800 rounded-2xl space-y-5 shadow-2xl">
                        
                        {/* Title Block */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-3 gap-2">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
                              <Home className="w-4 h-4 text-amber-400" />
                              CFO 個人的私人理財、置產與生涯成就板塊
                            </h4>
                            <p className="text-[10px] text-slate-500 max-w-xl leading-normal">
                              您的私人財務帳戶！<b>每月提存薪資津貼：$15,000 元</b> (已借記公司薪資支出，不佔用公司權益，直接匯至個人儲蓄)。用這筆錢投資理財、融通己方公司、買房置產、攀登人生巔峰！
                            </p>
                          </div>

                          <div className="bg-amber-950/20 border border-amber-900/45 px-3 py-2 rounded-lg font-mono text-right">
                            <span className="text-[9px] text-amber-400 uppercase tracking-widest block font-bold">CFO 可用現金餘額</span>
                            <span className="text-lg font-bold text-amber-400">${cfoSavings.toLocaleString()} <span className="text-xs font-normal">元 NTD</span></span>
                          </div>
                        </div>

                        {/* CFO Personal Ledger Mini-Sheet */}
                        {(() => {
                          let ownedPropertiesValue = 0;
                          if (ownedProperties.includes('daan_penthouse')) ownedPropertiesValue += 800000;
                          if (ownedProperties.includes('banqiao_suite')) ownedPropertiesValue += 350000;
                          if (ownedProperties.includes('yms_cabin')) ownedPropertiesValue += 120000;
                          
                          const stockValue = Math.round(cfoStockUnits * stockIndex);
                          const btcValue = Math.round(cfoBtcUnits * btcPrice * 30);
                          const companyEquityValue = balanceSheet.cfoEquity || 0;
                          const companyBridgeLoanValue = balanceSheet.bridgeLoans || 0;
                          const cfoTotalNetWorth = cfoSavings + stockValue + btcValue + ownedPropertiesValue + companyEquityValue + companyBridgeLoanValue;
                          
                          return (
                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 font-mono text-[11px]">
                              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                                <span className="text-[10px] uppercase text-cyan-400 font-bold block tracking-wider flex items-center gap-1.5">
                                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                                  CFO 個人資產負債簡表 (CFO PERSONAL LEDGER)
                                </span>
                                <span className="text-[9px] text-slate-500">主權公司與個人私產雙向對齊</span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800/60 leading-relaxed">
                                <div className="space-y-1 pb-2 md:pb-0">
                                  <span className="text-[9px] uppercase text-slate-400 font-bold block tracking-widest mb-1">流動與投資資產 (Private Assets)</span>
                                  <div className="flex justify-between text-slate-500">
                                    <span>● 私人可用現金 (Savings)</span>
                                    <span className="text-emerald-400 font-bold">${cfoSavings.toLocaleString()} NTD</span>
                                  </div>
                                  <div className="flex justify-between text-slate-500">
                                    <span>● 大盤 ETF 權益市值</span>
                                    <span className="text-slate-300">${stockValue.toLocaleString()} NTD</span>
                                  </div>
                                  <div className="flex justify-between text-slate-500">
                                    <span>● BTC 投機庫存價值</span>
                                    <span className="text-slate-300">${btcValue.toLocaleString()} NTD</span>
                                  </div>
                                  <div className="flex justify-between text-slate-500">
                                    <span>● 置產豪華豪宅估值</span>
                                    <span className="text-slate-300">${ownedPropertiesValue.toLocaleString()} NTD</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-1 pt-2 md:pt-0 md:pl-4">
                                  <span className="text-[9px] uppercase text-slate-400 font-bold block tracking-widest mb-1 text-cyan-400">公司股權與往來債權 (Corporate Claims)</span>
                                  <div className="flex justify-between text-slate-500 border-b border-slate-900 pb-0.5">
                                    <span>● 特別股權投資 (Equity Injected)</span>
                                    <span className="text-cyan-400 font-bold">${companyEquityValue.toLocaleString()} NTD</span>
                                  </div>
                                  <div className="flex justify-between text-slate-500 border-b border-slate-900 pb-0.5">
                                    <span>● 借出過橋款 (Bridge Loan Receivable)</span>
                                    <span className="text-amber-500 font-bold">${companyBridgeLoanValue.toLocaleString()} NTD</span>
                                  </div>
                                  <div className="pt-2 flex justify-between border-t border-slate-800 text-white font-bold text-xs">
                                    <span>★ CFO 個人總身價淨資產 (Net Worth)</span>
                                    <span className="text-amber-400 font-black">${cfoTotalNetWorth.toLocaleString()} 元</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Middle Action: Personal Investments & Assets Portfolio */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Left Invest Pane */}
                          <div className="p-4 bg-[#020617] border border-slate-900/80 rounded-xl space-y-3.5">
                            <span className="font-bold text-xs text-slate-300 font-mono block">📊 個人私產與標的投資理財</span>
                            
                            <div className="grid grid-cols-2 gap-4">
                              
                              {/* Stock ETF investing */}
                              <div className="bg-slate-950 p-2.5 rounded border border-slate-900 space-y-2">
                                <div className="text-[10px] font-mono text-slate-400 font-semibold border-b border-slate-900 pb-1 flex justify-between">
                                  <span>大盤股指 ETF</span>
                                  <span className="text-xs text-teal-400 font-bold">STOCK</span>
                                </div>
                                <div className="font-mono text-[11px] text-slate-400 space-y-0.5 leading-tight">
                                  <div>持有股數：<span className="text-white font-bold">{cfoStockUnits.toFixed(2)}</span> 股</div>
                                  <div>換算市值：<span className="text-white font-bold">${Math.round(cfoStockUnits * stockIndex).toLocaleString()}</span> 元</div>
                                </div>

                                <div className="space-y-1 pt-1">
                                  <button
                                    disabled={cfoSavings < 5000}
                                    onClick={() => {
                                      setCfoStockUnits(prev => prev + (5000 / stockIndex));
                                      setCfoSavings(prev => prev - 5000);
                                    }}
                                    className="w-full text-left text-[9px] font-mono bg-slate-900 text-slate-300 hover:bg-slate-800 p-1 rounded border border-slate-800 disabled:opacity-30 cursor-pointer"
                                  >
                                    ➕ 買入金額: $5,000 元
                                  </button>
                                  <button
                                    disabled={cfoSavings < 15000}
                                    onClick={() => {
                                      setCfoStockUnits(prev => prev + (15000 / stockIndex));
                                      setCfoSavings(prev => prev - 15000);
                                    }}
                                    className="w-full text-left text-[9px] font-mono bg-slate-900 text-slate-300 hover:bg-slate-800 p-1 rounded border border-slate-800 disabled:opacity-30 cursor-pointer"
                                  >
                                    ➕ 買入金額: $15,000 元
                                  </button>
                                  <button
                                    disabled={cfoStockUnits <= 0}
                                    onClick={() => {
                                      const proceeds = Math.round(cfoStockUnits * stockIndex);
                                      setCfoSavings(prev => prev + proceeds);
                                      setCfoStockUnits(0);
                                    }}
                                    className="w-full text-center text-[9px] font-mono bg-teal-950 font-bold text-teal-400 hover:bg-teal-905 p-1 rounded border border-teal-800/40 cursor-pointer"
                                  >
                                    💸 全部贖回/變現 (Sell All)
                                  </button>
                                </div>
                              </div>

                              {/* Bitcoin Speculating */}
                              <div className="bg-slate-950 p-2.5 rounded border border-slate-900 space-y-2">
                                <div className="text-[10px] font-mono text-slate-400 font-semibold border-b border-slate-900 pb-1 flex justify-between">
                                  <span>比特幣投機標的</span>
                                  <span className="text-xs text-amber-500 font-bold">BTC</span>
                                </div>
                                <div className="font-mono text-[11px] text-slate-400 space-y-0.5 leading-tight">
                                  <div>持有顆數：<span className="text-white font-bold">{cfoBtcUnits.toFixed(4)}</span> BTC</div>
                                  <div>換算市值：<span className="text-white font-bold">${Math.round(cfoBtcUnits * btcPrice * 30).toLocaleString()}</span> 元</div>
                                </div>

                                <div className="space-y-1 pt-1">
                                  <button
                                    disabled={cfoSavings < 500} // wait, BTC supports small fractional buy! But we want $5000
                                    onClick={() => {
                                      setCfoBtcUnits(prev => prev + ((5000 / 30) / btcPrice));
                                      setCfoSavings(prev => prev - 5000);
                                    }}
                                    className="w-full text-left text-[9px] font-mono bg-slate-900 text-slate-300 hover:bg-slate-800 p-1 rounded border border-slate-800 disabled:opacity-30 cursor-pointer"
                                  >
                                    ➕ 買入金額: $5,000 元
                                  </button>
                                  <button
                                    disabled={cfoSavings < 15000}
                                    onClick={() => {
                                      setCfoBtcUnits(prev => prev + ((15000 / 30) / btcPrice));
                                      setCfoSavings(prev => prev - 15000);
                                    }}
                                    className="w-full text-left text-[9px] font-mono bg-slate-900 text-slate-300 hover:bg-slate-800 p-1 rounded border border-slate-800 disabled:opacity-30 cursor-pointer"
                                  >
                                    ➕ 買入金額: $15,000 元
                                  </button>
                                  <button
                                    disabled={cfoBtcUnits <= 0}
                                    onClick={() => {
                                      const proceeds = Math.round(cfoBtcUnits * btcPrice * 30);
                                      setCfoSavings(prev => prev + proceeds);
                                      setCfoBtcUnits(0);
                                    }}
                                    className="w-full text-center text-[9px] font-mono bg-amber-955 font-bold text-amber-405 hover:bg-amber-900 p-1 rounded border border-amber-800/40 cursor-pointer"
                                  >
                                    💸 全部套現/出售 (Sell All)
                                  </button>
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Right Property Store Pane */}
                          <div className="p-4 bg-[#020617] border border-slate-900/80 rounded-xl space-y-3.5">
                            <span className="font-bold text-xs text-slate-300 font-mono block">🏡 CFO 奢豪地產成就購置</span>
                            
                            <div className="space-y-2.5">
                              {/* House 1 */}
                              {[
                                {
                                  key: 'daan_penthouse',
                                  name: '🏰 奢華大安空中帝寶頂層豪宅',
                                  price: 800000,
                                  desc: '俯瞰整個台北盆地的指標大直頂層行政公寓，配置個人無邊際恆溫泳池。'
                                },
                                {
                                  key: 'banqiao_suite',
                                  name: '🏬 新北板橋新站捷運景觀豪住宅',
                                  price: 350000,
                                  desc: '交通樞紐極其便利、全時保全控管的高科技高資產雅痞精緻極簡套房。'
                                },
                                {
                                  key: 'yms_cabin',
                                  name: '🏡 陽明山私人森林溫泉莊園木屋',
                                  price: 120000,
                                  desc: '頂級硫磺溫泉與翠綠竹林環繞，是您在財務決策高壓下洗滌心靈的避難所。'
                                }
                              ].map((house) => {
                                const isOwned = ownedProperties.includes(house.key);
                                return (
                                  <div key={house.key} className="p-2.5 rounded-lg bg-slate-950 border border-slate-900 flex items-center justify-between gap-3">
                                    <div className="space-y-1 max-w-[210px]">
                                      <div className="text-[11px] font-bold text-white leading-tight">{house.name}</div>
                                      <p className="text-[9px] text-slate-500 leading-normal">{house.desc}</p>
                                      <span className="inline-block text-[10px] font-mono text-amber-500 font-bold leading-none">全款售價：${house.price.toLocaleString()} 元</span>
                                    </div>

                                    <div>
                                      {isOwned ? (
                                        <span className="inline-flex px-2 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold font-mono">
                                          已購置 🏢
                                        </span>
                                      ) : (
                                        <button
                                          disabled={cfoSavings < house.price}
                                          onClick={() => {
                                            setCfoSavings(prev => prev - house.price);
                                            setOwnedProperties(prev => [...prev, house.key]);
                                          }}
                                          className="px-2.5 py-1.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 font-sans transition disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                                        >
                                          全款購置
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        {/* Corporate Capital Support Desk Panel */}
                        {(() => {
                          const companyBridgeLoanValue = balanceSheet.bridgeLoans || 0;
                          return (
                            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                                <span className="font-bold text-xs text-slate-300 font-mono block flex items-center gap-1.5">
                                  <Home className="w-3.5 h-3.5 text-cyan-400" />
                                  🏢 與己方公司資本協同與過橋調度 (CFO CORPORATE FINANCE SUPPORT)
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">企業注資 & 股東往來免息周轉</span>
                              </div>
                              
                              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                                身為公司最高財務主管（CFO）與核心大股東，當公司面臨<b>現金流斷裂或防禦流動安全邊際告急</b>時，您可以選擇隨時將個人的私人儲蓄折合投入公司（增資或貸款）以渡過難關！未來當公司營運充裕、手頭現金流充沛時，能安全贖回收回過橋款。
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                
                                {/* Option 1: 股本增資 */}
                                <div className="bg-[#020617] p-3 rounded border border-slate-900/80 flex flex-col justify-between space-y-2.5 font-mono text-[11px]">
                                  <div>
                                    <div className="text-[11px] font-bold text-cyan-400 border-b border-slate-900 pb-1 mb-1.5 flex justify-between">
                                      <span>辦理特別股本增資</span>
                                      <span>EQUITY</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 leading-normal font-sans">
                                      私人資金永久注入公司！這會<b>提升</b>公司現金並計入公司特別股股本（貸：CFO特別股增資 3002），增強公司資產負債表實力，不計負債。
                                    </p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <button
                                      disabled={cfoSavings < 10000}
                                      onClick={() => handleCfoInjectEquity(10000)}
                                      className="w-full text-center text-[9px] bg-cyan-950 text-cyan-400 hover:bg-cyan-900 font-bold py-1.5 px-2 rounded border border-cyan-850 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-mono"
                                    >
                                      ➕ 增資撥入 $10,000 元
                                    </button>
                                    <button
                                      disabled={cfoSavings < 50000}
                                      onClick={() => handleCfoInjectEquity(50000)}
                                      className="w-full text-center text-[9px] bg-cyan-950 text-cyan-400 hover:bg-cyan-900 font-bold py-1.5 px-2 rounded border border-cyan-850 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-mono"
                                    >
                                      ➕ 增資撥入 $50,000 元
                                    </button>
                                  </div>
                                </div>

                                {/* Option 2: 撥付過橋免息融資 */}
                                <div className="bg-[#020617] p-3 rounded border border-slate-900/80 flex flex-col justify-between space-y-2.5 font-mono text-[11px]">
                                  <div>
                                    <div className="text-[11px] font-bold text-amber-500 border-b border-slate-900 pb-1 mb-1.5 flex justify-between">
                                      <span>撥付個人過橋借款</span>
                                      <span>LIABILITY</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 leading-normal font-sans">
                                      以借款名義短期借給公司周轉！<b>增加</b>公司流動現金，並記入公司對CFO的負債項目（貸：股東往來與過橋融資 2003）。未來可贖回收回。
                                    </p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <button
                                      disabled={cfoSavings < 10000}
                                      onClick={() => handleCfoProvideBridgeLoan(10000)}
                                      className="w-full text-center text-[9px] bg-amber-955 text-amber-300 hover:bg-amber-900/80 font-bold py-1.5 px-2 rounded border border-amber-900/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-mono"
                                    >
                                      ➕ 撥付借出 $10,000 元
                                    </button>
                                    <button
                                      disabled={cfoSavings < 30000}
                                      onClick={() => handleCfoProvideBridgeLoan(30000)}
                                      className="w-full text-center text-[9px] bg-amber-955 text-amber-300 hover:bg-amber-900/80 font-bold py-1.5 px-2 rounded border border-amber-900/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-mono"
                                    >
                                      ➕ 撥付借出 $30,000 元
                                    </button>
                                  </div>
                                </div>

                                {/* Option 3: 回收過橋款 */}
                                <div className="bg-[#020617] p-3 rounded border border-slate-900/80 flex flex-col justify-between space-y-2.5 font-mono text-[11px]">
                                  <div>
                                    <div className="text-[11px] font-bold text-emerald-400 border-b border-slate-900 pb-1 mb-1.5 flex justify-between">
                                      <span>贖回收回過橋往來</span>
                                      <span>RECLAIM</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 leading-normal font-sans">
                                      當公司有多餘現鈔時，償還您的借貸！減少公司負債並等額匯回您的私人儲蓄。目前借給公司的未償額：<span className="text-white font-bold">${companyBridgeLoanValue.toLocaleString()} 元</span>。
                                    </p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <button
                                      disabled={balanceSheet.cash < 10000 || companyBridgeLoanValue < 10000}
                                      onClick={() => handleCfoRepayBridgeLoan(10000)}
                                      className="w-full text-center text-[9px] bg-emerald-950 text-emerald-400 hover:bg-emerald-900 font-bold py-1.5 px-2 rounded border border-emerald-900/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-mono"
                                    >
                                      💸 贖回收回 $10,000 元
                                    </button>
                                    <button
                                      disabled={balanceSheet.cash < 30000 || companyBridgeLoanValue < 30000}
                                      onClick={() => handleCfoRepayBridgeLoan(30000)}
                                      className="w-full text-center text-[9px] bg-emerald-950 text-emerald-400 hover:bg-emerald-900 font-bold py-1.5 px-2 rounded border border-emerald-900/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-mono"
                                    >
                                      💸 贖回收回 $30,000 元
                                    </button>
                                  </div>
                                </div>

                              </div>
                            </div>
                          );
                        })()}

                        {/* Owned Property Showroom Badge Banner */}
                        {ownedProperties.length > 0 && (
                          <div className="pt-2 border-t border-slate-900 space-y-2">
                            <span className="text-[9px] font-mono uppercase text-slate-500 tracking-widest block font-bold">🏆 CFO 置產與成功勳章 Showroom</span>
                            <div className="flex flex-wrap gap-2">
                              {ownedProperties.map(prop => (
                                <div key={prop} className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/25 rounded-full text-[10px] font-bold font-mono shadow">
                                  {prop === 'daan_penthouse' && <span>🏰 大安區空中帝王領主</span>}
                                  {prop === 'banqiao_suite' && <span>🏬 板橋站前首席雅痞青年</span>}
                                  {prop === 'yms_cabin' && <span>🏡 陽明山悠然溫泉山莊主人</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
