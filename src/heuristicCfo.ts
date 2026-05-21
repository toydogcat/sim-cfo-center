import { Account, BusinessEvent, CFOReport, IndustryType } from './types';
import { calculateIncomeStatement, calculateBalanceSheet } from './ledgerEngine';

export function generateHeuristicCFOReport(
  industry: IndustryType,
  currentMonth: number,
  accounts: Account[],
  events: BusinessEvent[]
): CFOReport {
  const income = calculateIncomeStatement(accounts);
  const balance = calculateBalanceSheet(accounts);
  const cash = balance.cash;
  const netIncome = income.netIncome;
  
  let status: 'safe' | 'warning' | 'danger' = 'safe';
  let summary = "";
  const advice: string[] = [];
  let suggestedAction: any = null;

  const isPoaching = events.some(e => e.description.includes("挖角"));
  const isOutage = events.some(e => e.description.includes("斷線") || e.description.includes("當機"));
  const isCostSpike = events.some(e => e.description.includes("原物料") || e.description.includes("材料上漲"));
  const isDelay = events.some(e => e.description.includes("延誤") || e.description.includes("工期"));
  const isAccident = events.some(e => e.description.includes("工安"));

  // Check Danger logic
  if (cash < 100000) {
    status = 'danger';
    summary = `【防範流動性崩潰！】這是一個非常危險的信號，公司現金庫存僅剩 ${cash.toLocaleString()} 元！若下個月面臨必要的剛性支出（薪資、租金），現金流會直接斷裂。我們必須立刻融資。`;
    advice.push(`資金乾枯，必須立刻向銀行借貸或注入新資本，否則公司面臨倒閉危機。`);
    advice.push(`停止所有非必要的資產購置，並全力收回應收帳款 (當前應收餘額 ${balance.receivables.toLocaleString()} 元)。`);

    suggestedAction = {
      id: "apply_loan",
      title: "商業銀行緊急信用融資 (30 萬元)",
      cost: -300000,
      effect: "立刻注入 30 萬元現金至庫存，長期銀行借貸增加 30 萬元（無前期申請手續費）"
    };
  } else if (cash < 300000) {
    status = 'warning';
    summary = `【注意，防禦空間狹窄！】現金水位落入黃色警戒區 (${cash.toLocaleString()} 元)。雖能維持短暫運營，但無法承擔任何材料價格突變或客戶退款事件的衝擊。`;
    advice.push(`建議維持至少 3 個月的剛性支出作為安全儲備。`);
    if (industry === 'Construction' && balance.payables > 150000) {
      advice.push(`應付帳款未結清數額較高 (${balance.payables.toLocaleString()} 元)，應酌情展延材料付款期限以穩定現金水位。`);
    }
  } else {
    status = 'safe';
    summary = `【經營狀況平穩】當前現金餘額為 ${cash.toLocaleString()} 元，尚處於安全穩健水位。本月淨利潤為 ${netIncome.toLocaleString()} 元。讓我們繼續優化經營效率，擴大規模。`;
    advice.push(`目前的資產流動率十分健康，可以考慮將部分現金轉化為中長期設備或加碼雲端架構研發。`);
    advice.push(`定期維護供應鏈關係，對沖行業景氣劇變引起的供需斷層。`);
  }

  // Handle Event specific recommendations
  if (industry === 'SaaS') {
    if (isPoaching) {
      advice.push(`【人才警報】對手高薪挖角頻頻！強烈建議實施薪資激勵措施，否則研發放緩將引發客戶流失。`);
      suggestedAction = {
        id: "stop_poaching",
        title: "實施研發與骨幹核心加薪 (5k / 每人月)",
        cost: 30000,
        effect: "本月發放 3 萬元獎金，從此鎖定人才！未來研發挖角事件概率降低 90%，且薪資成長幅度恢復常規。"
      };
    } else if (isOutage) {
      advice.push(`【架構檢討】雲端伺服器停機事故蒙受重大索賠！需要對雲端容量與多可用區 (Multi-AZ) 備份進行技術重組與監控。`);
      suggestedAction = {
        id: "cloud_audit",
        title: "實施高架構容災多活容錯專案",
        cost: 45000,
        effect: "一次性支付 4.5 萬元升級主機，此後徹底對沖『伺服器大當機』之隨機退賠，運維損失率降低 100%。"
      };
    }
  } else if (industry === 'Construction') {
    if (isCostSpike) {
      advice.push(`【鋼骨水泥原料預警】原物料暴漲對營建商毛利是致命打擊。建議立刻執行套期保值或遠期材料鎖定合約。`);
      suggestedAction = {
        id: "hedging_materials",
        title: "與混凝土大廠簽署年度鋼筋原物料遠期保價合約",
        cost: 60000,
        effect: "支付 6 萬元保證金，簽訂長期定額合約！此後完全對沖『原物料成本價格暴漲』，材料採購免受價格飆升衝擊。"
      };
    } else if (isAccident) {
      advice.push(`【工安重創】工安意外不僅引發賠償，隨之而來的停工整頓會嚴重拖慢請款。必須聘請專職工地安全督導。`);
      suggestedAction = {
        id: "safety_officer",
        title: "聘任專職持有甲級工安證照執業監工",
        cost: 40000,
        effect: "支付 4 萬元培訓與安全設備升级，徹底杜絕『工地重大工安事故』隨機大額賠償損失。"
      };
    }
  }

  return {
    summary,
    warningStatus: status,
    advice,
    suggestedAction
  };
}
