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
    if (hasEvent("AI 晶片") || hasEvent("出口禁令")) {
      advice.push(`【供應鏈韌性】高端硬體受地緣政治影響，建議評估本土替代方案或加速雲端架構優化。`);
    }
    if (hasEvent("AI 輔助開發") || hasEvent("技術紅利")) {
      advice.push(`【技術領先】AI 帶來的生產力突破顯著，應考慮將省下的成本投入到新市場開拓。`);
    }
    if (hasEvent("主權基金") || hasEvent("加速器")) {
      advice.push(`【國際化紅利】中東市場資金充裕且需求強勁，應建立本地化團隊以深化長期合作。`);
    }
    if (hasEvent("幻覺") || hasEvent("訴訟")) {
      advice.push(`【模型合規】AI 輸出錯誤已引發法律責任，應立即強化 RAG 架構或導入人工審核機制。`);
    }
    if (hasEvent("美國製造") || hasEvent("產業回流")) {
      advice.push(`【政策紅利】美國製造補貼到位，應考慮加碼北美市場的行銷與售後服務部署。`);
    }
    if (hasEvent("韓國半導體") || hasEvent("HBM")) {
      advice.push(`【供應鏈紅利】AI 硬體需求爆發帶動營收，應將此筆非經常性收益投入到次世代研發儲備。`);
    }
    if (hasEvent("印度崛起") || hasEvent("GCC")) {
      advice.push(`【成本套利】印度研發中心已展現效益，建議擴大當地編制以進一步優化全球營業成本。`);
    }
    if (hasEvent("人工智慧法案") || hasEvent("歐洲監管")) {
      advice.push(`【合規成本】歐盟監管趨嚴，應立即啟動技術審計，確保產品架構符合隱私保護標準。`);
    }
    if (hasEvent("貿易報復") || hasEvent("中歐貿易戰")) {
      advice.push(`【市場避險】歐洲訂單受關稅戰波及，應加速開發東南亞或印度等替代市場。`);
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
    if (hasEvent("關鍵礦物") || hasEvent("資源戰爭")) {
      advice.push(`【資源短缺】特種材料價格受國際局勢影響，應考慮尋找回收建材或替代工法。`);
    }
    if (hasEvent("中國內捲") || hasEvent("低價競爭")) {
      advice.push(`【成本競爭】面對中國低價設備衝擊，我們應強化品牌價值或提供更完善的保固與維護服務。`);
    }
    if (hasEvent("關稅大戰") || hasEvent("加徵關稅")) {
      advice.push(`【進口壓力】美國關稅政策導致成本飆升，應考慮尋找非美系設備或本地化組裝方案。`);
    }
    if (hasEvent("中國刺激") || hasEvent("基礎設施")) {
      advice.push(`【成本通膨】中國基礎設施計畫拉動全球建材價格，應儘早與供應商鎖定下季度單價。`);
    }
    if (hasEvent("印度基建") || hasEvent("新德里")) {
      advice.push(`【南亞需求】印度基建浪潮推升建材成本，應評估開發南亞供應商以優化長線採購鏈。`);
    }
    if (hasEvent("越南製造") || hasEvent("工業標案")) {
      advice.push(`【產能轉移】東南亞廠房擴建需求強勁，應加碼當地工程技術團隊，搶佔去風險化紅利。`);
    }
    if (hasEvent("社會動盪") || hasEvent("罷工")) {
      advice.push(`【人力風險】罷工已造成成本失控，需加強與工會溝通或導入部分自動化施工設備。`);
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
    if (hasEvent("地緣經濟") || hasEvent("進口食材")) {
      advice.push(`【在地供應】進口食材受關稅與通膨衝擊，應加速開發在地供應商以降低匯率風險。`);
    }
    if (hasEvent("美國軟著陸") || hasEvent("消費信心")) {
      advice.push(`【高端商機】美國景氣復甦帶動消費信心，可考慮推出高利潤率的限定版菜單以提升營收。`);
    }
    if (hasEvent("日旅爆發") || hasEvent("旅遊人數")) {
      advice.push(`【觀光紅利】赴日旅遊熱潮顯著提升營收，應考慮針對外籍遊客開發具國際辨識度的品牌。`);
    }
    
    // Efficiency advice
    const margin = income.revenue > 0 ? (income.revenue - income.materials) / income.revenue : 0;
    if (margin < 0.6) {
      advice.push(`【毛利偏低】食材佔比過高 (${((1-margin)*100).toFixed(0)}%)，建議微調菜單價格或尋找更具規模的供應商。`);
    }
    
    if (status === 'safe' && income.revenue > 1000000) {
      advice.push(`【品牌擴張】現金流強勁，可考慮進行店面翻新或開設分店。`);
    }
  } else if (industry === 'Multisector') {
    // MNC Specific
    if (hasEvent("匯率劇震")) {
      advice.push(`【匯率風險】匯兌損失嚴重侵蝕利潤，應加強遠期外匯 (FX Forward) 避險操作。`);
      suggestedAction = suggestedAction || {
        id: "fx_hedging_setup",
        title: "建置跨國集團資金池與避險中心",
        cost: 80000,
        effect: "支付 8 萬元管理費，此後徹底對沖『匯率劇震』之 90% 營業外損失。"
      };
    }
    if (hasEvent("全球稅改") || hasEvent("OECD")) {
      advice.push(`【稅務合規】避稅天堂優勢喪失，應重新審視轉帳計價 (Transfer Pricing) 策略。`);
    }
    if (hasEvent("ESG") || hasEvent("主權基金")) {
      advice.push(`【資本優勢】國際形象提升，應趁低資金成本期，加速收購海外競爭對手。`);
    }
    if (hasEvent("公關災難") || hasEvent("政治敏感")) {
      advice.push(`【地緣風險】政治議題已引發商業抵制，應加強各國公關在地化管理。`);
    }
    
    // Growth advice
    if (status === 'safe') {
      advice.push(`【全球化紅利】目前資金充足，建議評估進入中東或北美等高毛利新興市場。`);
    }
  }

  // --- Global Macro Advice ---
  if (hasEvent("聯準會") || hasEvent("利率")) {
    advice.push(`【金融成本】全球利率上升增加融資負擔，應優先清償高利債務或減少外部借貸。`);
  }
  if (hasEvent("中東局勢") || hasEvent("能源")) {
    advice.push(`【能源成本】地緣政治導致油電價格不穩，應儘快落實節能設備升級以管控長線預算。`);
  }
  if (hasEvent("日本升息") || hasEvent("日圓匯率")) {
    advice.push(`【貨幣風險】日圓匯率隨利率政策波動，應對日本進口設備採購合約進行匯率避險或鎖定。`);
  }
  if (hasEvent("供應鏈斷裂") || hasEvent("運河限航")) {
    advice.push(`【物流備案】全球航道不穩，應提高關鍵庫存安全水位，避免生產或營運中斷。`);
  }
  if (hasEvent("Deepfake") || hasEvent("詐騙")) {
    advice.push(`【內控升級】公司遭遇新型 AI 詐騙，應重新修訂財務撥款 SOP，加入多重生物識別之外的人工覆核。`);
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
