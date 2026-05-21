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

  // 1. Determine Warning Status
  if (cash < 100000) {
    status = 'danger';
  } else if (cash < 300000 || (netIncome < 0 && cash < 500000)) {
    status = 'warning';
  } else {
    status = 'safe';
  }

  // 2. Personality-based Summary Templates
  const safeSummaries = [
    `【營運穩健】當前現金水位充足 (${cash.toLocaleString()} 元)，資產負債結構健康。建議在穩定中尋求擴張機會。`,
    `【經營平穩】本月獲利表現尚可，現金流無虞。這是一個優化內部流程、儲備人才的好時機。`,
    `【結構健康】報表顯示公司具備良好的抗風險能力。維持目前的節奏，我們能應對大多數市場波動。`
  ];

  const warningSummaries = [
    `【警訊浮現】現金水位 (${cash.toLocaleString()} 元) 已逼近黃色警戒線。雖然目前營運尚能維持，但容錯空間正在縮小。`,
    `【防禦收窄】本月支出偏高，導致現金流略顯吃緊。我們需要審視非必要開支，並加速應收帳款回收。`,
    `【流動性隱憂】雖然還有部分存款，但若持續負成長，三個月內我們將面臨嚴峻考驗。`
  ];

  const dangerSummaries = [
    `【生存危機！】現金庫存僅剩 ${cash.toLocaleString()} 元，已進入紅色警戒！若不立即籌集資金或進行戰略收縮，下個月可能面臨斷糧。`,
    `【流動性枯竭】公司的生命線正在乾涸！我們必須立刻停止一切非剛性支出，並尋求外部融資或股東注資。`,
    `【瀕臨破產】這是我看過最糟糕的現金比例。我們需要一場奇蹟，或者是立刻執行緊急借貸計畫。`
  ];

  const summaryPool = status === 'danger' ? dangerSummaries : status === 'warning' ? warningSummaries : safeSummaries;
  summary = summaryPool[Math.floor(Math.random() * summaryPool.length)];

  // 3. Event-specific Analysis & Advice
  const hasEvent = (pattern: string) => events.some(e => e.description.includes(pattern));

  // General Advice
  if (status === 'danger') {
    advice.push(`【核心急務】立即執行銀行融資或過橋貸款，保住公司生命線。`);
    advice.push(`【節流控管】裁撤非核心員額，或暫停所有行銷預算。`);
    suggestedAction = {
      id: "apply_loan",
      title: "商業銀行緊急信用融資 (30 萬元)",
      cost: -300000,
      effect: "立刻注入 30 萬元現金至庫存，長期銀行借貸增加 30 萬元。"
    };
  }

  if (industry === 'SaaS') {
    if (hasEvent("斷線")) {
      advice.push(`【技術債警報】基礎設施穩定性已影響商譽，補償支出拖累本月損益。`);
      suggestedAction = suggestedAction || {
        id: "cloud_audit",
        title: "實施高架構容災多活容錯專案",
        cost: 45000,
        effect: "支付 4.5 萬元升級主機，此後徹底對沖『伺服器大當機』損失。"
      };
    }
    if (hasEvent("挖角")) {
      advice.push(`【人才資產】外部競爭激烈，核心研發流失會導致產品迭代停滯。`);
      suggestedAction = suggestedAction || {
        id: "stop_poaching",
        title: "實施研發與骨幹核心加薪 (5k / 每人月)",
        cost: 30000,
        effect: "本月發放 3 萬元獎金，從此鎖定人才，降低挖角機率。"
      };
    }
    if (hasEvent("GDPR") || hasEvent("資安")) {
      advice.push(`【合規風險】隨著用戶增長，法規合規與資安將成為剛性成本。`);
    }
    if (hasEvent("社群爆紅") || hasEvent("Product Hunt")) {
      advice.push(`【行銷紅利】目前獲客成本 (CAC) 極低，應趁勢加大行銷投放，固化這波流量。`);
    }
    if (hasEvent("流失")) {
      advice.push(`【產品競爭力】客戶流失顯示競品正在蠶食我們的市場，需檢視定價策略。`);
    }
    
    // Growth advice
    if (status === 'safe' && income.revenue > 0) {
      advice.push(`【擴張建議】目前現金充裕，建議適度增加行銷支出以加速用戶增長。`);
    }
  } else if (industry === 'Construction') {
    // Construction Specific
    if (hasEvent("原物料")) {
      advice.push(`【原料預警】通膨導致建材成本失控，需儘快鎖定長期供應合約。`);
      suggestedAction = suggestedAction || {
        id: "hedging_materials",
        title: "與混凝土大廠簽署年度原物料遠期保價合約",
        cost: 60000,
        effect: "支付 6 萬元保證金，簽訂長期定額合約，對沖價格暴漲風險。"
      };
    }
    if (hasEvent("工安")) {
      advice.push(`【營運風險】重大工安事件不僅賠錢，還會導致停工期延長。`);
      suggestedAction = suggestedAction || {
        id: "safety_officer",
        title: "聘任專職持有甲級工安證照執業監工",
        cost: 40000,
        effect: "支付 4 萬元培訓與設備升級，徹底杜絕重大工安賠償。"
      };
    }
    if (hasEvent("工期落後")) {
      advice.push(`【時程壓力】罰金正侵蝕利潤，建議增加雇工人數以趕上進度。`);
    }
    if (hasEvent("帳款回收")) {
      advice.push(`【現金回流】這筆應收帳款回收得非常及時，極大緩解了資金壓力。`);
    }
    if (hasEvent("完工獎勵")) {
      advice.push(`【績效卓越】提前完工證實了團隊調度能力，應給予工程部適度激勵。`);
    }

    // Cash flow management for construction
    if (currentMonth % 3 !== 0 && status === 'warning') {
      advice.push(`【空窗警示】下一次大筆進度款還需等待，請密切注意本月現金消耗速度。`);
    }
  } else if (industry === 'F&B') {
    // F&B Specific
    if (hasEvent("衛生稽查")) {
      advice.push(`【合規警報】衛生缺失會引發停業風險，應加強內場 SOP 與定期清潔巡檢。`);
      suggestedAction = suggestedAction || {
        id: "health_standard_upgrade",
        title: "導入 ISO 22000 國際食安管理認證計畫",
        cost: 35000,
        effect: "支付 3.5 萬元諮詢費，從此徹底免除『衛生稽查罰款』，提升品牌信任。"
      };
    }
    if (hasEvent("食材報廢") || hasEvent("損耗")) {
      advice.push(`【成本流失】食材損耗過高，應檢查冷鏈設備或優化採購與庫存周轉率。`);
    }
    if (hasEvent("網紅") || hasEvent("平台紅利")) {
      advice.push(`【品牌效應】目前流量處於高峰，建議設計『二次消費』回饋方案以固化新客。`);
    }
    if (hasEvent("食安危機")) {
      advice.push(`【公關危機】食安指控是餐飲業的滅頂之災，應立即進行透明化溝通與補償。`);
    }
    
    // Efficiency advice
    const margin = income.revenue > 0 ? (income.revenue - income.materials) / income.revenue : 0;
    if (margin < 0.6) {
      advice.push(`【毛利偏低】食材佔比過高 (${((1-margin)*100).toFixed(0)}%)，建議微調菜單價格或尋找更具規模的供應商。`);
    }
    
    if (status === 'safe' && income.revenue > 1000000) {
      advice.push(`【品牌擴張】現金流強勁，可考慮進行店面翻新或開設分店。`);
    }
  }

  // Fallback advice if nothing specific
  if (advice.length < 2) {
    advice.push(`【內部優化】建議定期檢核部門績效，汰換低貢獻度的資源投入。`);
    advice.push(`【市場洞察】密切注意總體經濟與股市波動，這會間接影響我們的營收預期。`);
  }

  return {
    summary,
    warningStatus: status,
    advice: advice.slice(0, 4), // Return top 4 advice items
    suggestedAction
  };
}
