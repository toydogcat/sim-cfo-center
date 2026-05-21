import { BusinessEvent, IndustryType } from './types';

export interface RandomEventTemplate {
  id: string;
  description: string;
  amount: number;
  eventType: BusinessEvent['eventType'];
  category: string;
  probability: number;
  industry: IndustryType | 'Both';
}

export const RANDOM_EVENTS: RandomEventTemplate[] = [
  // --- SaaS Events ---
  {
    id: "Server_Outage",
    description: "【重大事故】亞太數據中心骨幹網路大斷線，補償客戶損失與退款",
    amount: 80000,
    eventType: 'Random',
    category: '營業外賠償',
    probability: 0.08,
    industry: 'SaaS'
  },
  {
    id: "Talent_Poaching",
    description: "【外部競爭】外部競品以高薪向本公司研發骨幹挖角，核心團隊需提發激勵獎金",
    amount: 40005,
    eventType: 'Random',
    category: '人才防護獎勵',
    probability: 0.08,
    industry: 'SaaS'
  },
  {
    id: "Sub_Boom",
    description: "【爆紅效應】產品榮獲 Product Hunt 當日推選第一名，企業客戶大湧入一筆巨額預存",
    amount: 120000,
    eventType: 'Random',
    category: '加值訂閱款',
    probability: 0.08,
    industry: 'SaaS'
  },
  {
    id: "Security_Audit",
    description: "【合規升級】因應歐盟 GDPR 與資料安全法規，支付第三方資安審計與滲透測試費用",
    amount: 55000,
    eventType: 'Purchase',
    category: '專業服務支出',
    probability: 0.08,
    industry: 'SaaS'
  },
  {
    id: "Marketing_Viral",
    description: "【社群爆紅】品牌在 Threads 引發熱議，獲取大量免費自然流量與試用轉化",
    amount: 60000,
    eventType: 'Sale',
    category: '平台訂閱收入',
    probability: 0.08,
    industry: 'SaaS'
  },
  {
    id: "Platform_Fee_Hike",
    description: "【平台變動】App Store 與 Google Play 調整抽成比例，導致本月渠道結算成本上升",
    amount: 35000,
    eventType: 'Purchase',
    category: '雲端主機與伺服器',
    probability: 0.08,
    industry: 'SaaS'
  },
  {
    id: "Legal_IP_Issue",
    description: "【專利爭議】遭不明專利流氓指控算法侵權，需支付緊急法律顧問諮詢費進行對抗",
    amount: 70000,
    eventType: 'Random',
    category: '專業服務支出',
    probability: 0.06,
    industry: 'SaaS'
  },
  {
    id: "Small_Churn",
    description: "【客戶流失】因主要競品大幅降價，部分長約客戶決定不再續約，認列當月合約損失",
    amount: 45000,
    eventType: 'Purchase',
    category: '營業外損失',
    probability: 0.06,
    industry: 'SaaS'
  },

  // --- Construction Events ---
  {
    id: "Cost_Spike",
    description: "【成本攀升】國際鋼鐵與砂石原物料巨幅上漲，造成材料採購追加合約差額",
    amount: 150000,
    eventType: 'Purchase',
    category: '營建材料採購',
    probability: 0.08,
    industry: 'Construction'
  },
  {
    id: "Project_Delay",
    description: "【工期落後】因連續梅雨與出土阻礙，工期進度落後遭市府開罰與罰金補償",
    amount: 90000,
    eventType: 'Random',
    category: '罰款支出',
    probability: 0.08,
    industry: 'Construction'
  },
  {
    id: "Safety_Event",
    description: "【工安事件】工地發生重物墜落砸毀停放車輛與受傷，暫時勒令停工整頓並賠償",
    amount: 220000,
    eventType: 'Random',
    category: '意外賠償損失',
    probability: 0.08,
    industry: 'Construction'
  },
  {
    id: "Collection_Receivable",
    description: "【帳款回收】向長期往來業主收回上期拖延之科技園區外牆工程保留款",
    amount: 300000,
    eventType: 'Sale',
    category: '應收帳款請款',
    probability: 0.08,
    industry: 'Construction'
  },
  {
    id: "Bonus_Milestone",
    description: "【進度超前】因夜間施工調度得宜，業主加發提前完工獎勵金",
    amount: 180000,
    eventType: 'Sale',
    category: '工程進度款請撥',
    probability: 0.08,
    industry: 'Construction'
  },
  {
    id: "Equipment_Failure",
    description: "【設備損毀】工地大型塔吊馬達燒毀，需支付緊急維修與租用替代設備費用",
    amount: 110000,
    eventType: 'Purchase',
    category: '生財設備租用',
    probability: 0.08,
    industry: 'Construction'
  },
  {
    id: "Local_Community_Fee",
    description: "【鄰里補償】因施工噪音引發周邊居民抗議，支付里長辦公室睦鄰公關費與噪音補償",
    amount: 50000,
    eventType: 'Random',
    category: '專業服務支出',
    probability: 0.08,
    industry: 'Construction'
  },
  {
    id: "Tax_Audit_Construction",
    description: "【稅務查核】國稅局針對營建專案進項發票進行專案查核，補繳印花稅與手續費",
    amount: 75000,
    eventType: 'Random',
    category: '專業服務支出',
    probability: 0.09,
    industry: 'Construction'
  },

  // --- F&B Events ---
  {
    id: "Health_Inspection_Fine",
    description: "【衛生稽查】衛生局突擊檢查發現廚房排水不符規範，遭裁罰與限期整改費用",
    amount: 30000,
    eventType: 'Random',
    category: '罰款支出',
    probability: 0.08,
    industry: 'F&B'
  },
  {
    id: "Food_Poisoning_Scare",
    description: "【食安危機】疑似食材不潔導致客人在網路社群投訴，支付慰問金與整修停業損失",
    amount: 120000,
    eventType: 'Random',
    category: '意外賠償損失',
    probability: 0.05,
    industry: 'F&B'
  },
  {
    id: "Influencer_Viral",
    description: "【網紅推薦】知名美食影音創作者無酬拍攝推薦，引發排隊熱潮，營收大幅增長",
    amount: 150000,
    eventType: 'Sale',
    category: '餐飲銷售收入',
    probability: 0.07,
    industry: 'F&B'
  },
  {
    id: "Ingredient_Spoilage",
    description: "【損耗加劇】因廚房冰箱壓縮機深夜故障，導致一批高級進口食材報廢損毀",
    amount: 45000,
    eventType: 'Purchase',
    category: '餐飲食材採購',
    probability: 0.09,
    industry: 'F&B'
  },
  {
    id: "Water_Leak_Repair",
    description: "【修繕支出】店鋪天花板突發漏水影響內用區，需支付緊急水電維修與更換裝潢",
    amount: 50000,
    eventType: 'Purchase',
    category: '專業服務支出',
    probability: 0.07,
    industry: 'F&B'
  },
  {
    id: "Delivery_Platform_Boost",
    description: "【平台紅利】外送平台週年慶活動配合加碼，本月外送訂單量大幅突破預期",
    amount: 80000,
    eventType: 'Sale',
    category: '餐飲銷售收入',
    probability: 0.08,
    industry: 'F&B'
  },

  // --- Global Macro & Geopolitical Events (2024-2026 Trends) ---
  {
    id: "Global_Interest_Rate_Hike",
    description: "【全球金融】聯準會為抑制通膨宣布放緩降息，全球借貸成本上升，導致利息支出增加",
    amount: 50000,
    eventType: 'Random',
    category: '專業服務支出',
    probability: 0.05,
    industry: 'Both'
  },
  {
    id: "Middle_East_Energy_Crisis",
    description: "【中東局勢】因紅海航道局勢再度緊張，引發國際原油與天然氣波動，導致運輸與電費成本上升",
    amount: 65000,
    eventType: 'Purchase',
    category: '營業外支出',
    probability: 0.06,
    industry: 'Both'
  },
  {
    id: "AI_Chip_Scarcity",
    description: "【科技戰】地緣政治引發高端 AI 晶片出口禁令，導致伺服器升級成本與 R&D 設備採購價暴漲",
    amount: 120000,
    eventType: 'Purchase',
    category: '雲端主機與伺服器',
    probability: 0.05,
    industry: 'SaaS'
  },
  {
    id: "AI_Productivity_Breakthrough",
    description: "【技術紅利】公司成功導入生成式 AI 輔助開發流程，研發效率大幅提升，帶動新功能提前上線增收",
    amount: 200000,
    eventType: 'Sale',
    category: '平台訂閱收入',
    probability: 0.04,
    industry: 'SaaS'
  },
  {
    id: "Critical_Mineral_Shortage",
    description: "【資源戰爭】電動車與基礎設施對銅、鋰等關鍵礦物需求過大，導致營建機電材料成本劇烈波動",
    amount: 180000,
    eventType: 'Purchase',
    category: '營建材料採購',
    probability: 0.06,
    industry: 'Construction'
  },
  {
    id: "Global_Supply_Chain_Choke",
    description: "【供應鏈斷裂】因極端氣候導致巴拿馬運河限航，進口高級食材與特種建材到貨嚴重延誤",
    amount: 100000,
    eventType: 'Random',
    category: '營業外損失',
    probability: 0.05,
    industry: 'Both'
  },
  {
    id: "Labor_Strike_Social_Unrest",
    description: "【社會動盪】因生活成本危機，多地發生大規模罷工行動，導致工程延誤與臨時雇工成本攀升",
    amount: 150000,
    eventType: 'Payroll',
    category: '薪資支出',
    probability: 0.04,
    industry: 'Construction'
  },
  {
    id: "Import_Food_Inflation",
    description: "【地緣經濟】受貿易壁壘影響，進口原物料、咖啡豆與乳製品價格連鎖反應式上漲",
    amount: 70000,
    eventType: 'Purchase',
    category: '餐飲食材採購',
    probability: 0.07,
    industry: 'F&B'
  },
  {
    id: "Middle_East_AI_Hub_Investment",
    description: "【主權基金】沙烏地阿拉伯與阿聯酋宣佈加碼 AI 基礎設施，公司獲選進入當地加速器並獲得專案預付款",
    amount: 250000,
    eventType: 'Sale',
    category: '平台訂閱收入',
    probability: 0.03,
    industry: 'SaaS'
  },
  {
    id: "AI_Hallucination_Legal_Case",
    description: "【AI 法律風險】公司 LLM 模型產生嚴重事實幻覺，導致企業客戶決策失誤並提出集體訴訟賠償",
    amount: 150000,
    eventType: 'Random',
    category: '營業外賠償',
    probability: 0.04,
    industry: 'SaaS'
  },
  {
    id: "Deepfake_Financial_Fraud",
    description: "【資安災難】財務部遭 Deepfake 語音詐騙，誤將一筆款項匯至境外非法帳戶，認列重大營業外損失",
    amount: 200000,
    eventType: 'Random',
    category: '營業外損失',
    probability: 0.02,
    industry: 'Both'
  },
  {
    id: "US_Manufacturing_Reshoring_Grants",
    description: "【美國製造】美國政府撥款支持產業回流，公司因提供智慧製造方案獲得專項補貼與減稅額度",
    amount: 180000,
    eventType: 'Sale',
    category: '平台訂閱收入',
    probability: 0.04,
    industry: 'SaaS'
  },
  {
    id: "China_Export_Stimulus_Impact",
    description: "【中國內捲】中國為應對國內需求不足加速外銷，導致市場充斥低價競爭設備，衝擊我方專案報價",
    amount: 100000,
    eventType: 'Random',
    category: '營業外損失',
    probability: 0.05,
    industry: 'Construction'
  },
  {
    id: "EU_AI_Act_Compliance",
    description: "【歐洲監管】歐盟正式實施《人工智慧法案》(EU AI Act)，公司需支付高額法律顧問與技術合規審計費",
    amount: 90000,
    eventType: 'Purchase',
    category: '專業服務支出',
    probability: 0.05,
    industry: 'SaaS'
  },
  {
    id: "Global_Tariff_War_2",
    description: "【關稅大戰】美國新任政府宣佈對全球進口機械與鋼鐵加徵 20% 關稅，導致材料與設備進口價齊漲",
    amount: 130000,
    eventType: 'Purchase',
    category: '營建材料採購',
    probability: 0.06,
    industry: 'Construction'
  },
  {
    id: "China_Stimulus_Infrastructure_Boom",
    description: "【中國刺激】北京推出 3 兆元振興方案聚焦基礎設施，帶動全球工程物料價格上漲，採購成本增加",
    amount: 110000,
    eventType: 'Purchase',
    category: '營建材料採購',
    probability: 0.04,
    industry: 'Construction'
  },
  {
    id: "EU_China_Car_Investigation_Spillover",
    description: "【中歐貿易戰】歐盟對中國電動車加徵關稅引發貿易報復，導致我方部分外銷歐洲零組件訂單縮減",
    amount: 80000,
    eventType: 'Random',
    category: '營業外損失',
    probability: 0.04,
    industry: 'SaaS'
  },
  {
    id: "US_Soft_Landing_Consumption_Boost",
    description: "【美國軟著陸】美國景氣展現韌性且通膨趨緩，帶動高端餐飲消費信心回升，現場客單價顯著成長",
    amount: 90000,
    eventType: 'Sale',
    category: '餐飲銷售收入',
    probability: 0.05,
    industry: 'F&B'
  },
  {
    id: "China_Property_Market_Drag",
    description: "【中國房市】中國房地產危機持續拖累亞洲建築材料需求，雖有利於採購價降低，但整體景氣趨於悲觀",
    amount: 40000,
    eventType: 'Sale', // Revenue increase due to lower costs or better terms
    category: '應收帳款請撥',
    probability: 0.04,
    industry: 'Construction'
    },
    {
    id: "Japan_Monetary_Normalization",
    description: "【日本升息】日本銀行結束負利率政策，引發日圓匯率大幅波動，影響進口設備採購成本",
    amount: 60000,
    eventType: 'Purchase',
    category: '專業服務支出',
    probability: 0.05,
    industry: 'Both'
    },
    {
    id: "Korea_Semiconductor_Supercycle",
    description: "【韓國半導體】AI 帶動高頻寬記憶體 (HBM) 需求爆發，相關設備供應鏈訂單激增，認列一筆技術服務收入",
    amount: 220000,
    eventType: 'Sale',
    category: '平台訂閱收入',
    probability: 0.04,
    industry: 'SaaS'
    },
    {
    id: "India_GCC_Expansion",
    description: "【印度崛起】印度躍升全球服務中心 (GCC)，公司於當地設立研發分部獲得專項減稅與低廉人力成本紅利",
    amount: 150000,
    eventType: 'Sale',
    category: '加值訂閱款',
    probability: 0.05,
    industry: 'SaaS'
    },
    {
    id: "Vietnam_Supply_Chain_Boom",
    description: "【越南製造】受供應鏈去風險化帶動，越南廠房擴建需求激增，我方承接之東南亞工業標案提前請款",
    amount: 280000,
    eventType: 'Sale',
    category: '工程進度款請撥',
    probability: 0.05,
    industry: 'Construction'
    },
    {
    id: "Japan_Tourism_Record_High",
    description: "【日旅爆發】赴日旅遊人數創歷史新高，帶動公司於當地投資之餐飲品牌營收大幅超越預期",
    amount: 120000,
    eventType: 'Sale',
    category: '餐飲銷售收入',
    probability: 0.06,
    industry: 'F&B'
    },
    {
    id: "Thailand_Energy_Transition",
    description: "【泰國綠能】泰國宣佈加速從煤炭轉向天然氣與綠能，相關基建工程需追加環保法規合規支出",
    amount: 85000,
    eventType: 'Purchase',
    category: '專業服務支出',
    probability: 0.04,
    industry: 'Construction'
    },
    {
    id: "India_Infrastructure_Push",
    description: "【印度基建】新德里政府加碼國家基礎設施計畫，全球建材需求上升，導致鋼鐵與混凝土價格連鎖波動",
    amount: 140000,
    eventType: 'Purchase',
    category: '營建材料採購',
    probability: 0.05,
    industry: 'Construction'
    },

  // --- MNC (Multisector) Events ---
  {
    id: "FX_Volatility_Loss",
    description: "【匯率劇震】主要貿易貨幣（歐元/日圓）對美金劇烈貶值，認列鉅額匯兌損失",
    amount: 140000,
    eventType: 'Random',
    category: '營業外損失',
    probability: 0.09,
    industry: 'Multisector'
  },
  {
    id: "Global_Minimum_Tax",
    description: "【全球稅改】OECD 全球最低稅負制實施，開曼與維京群島避稅優勢喪失，補繳跨國所得稅",
    amount: 250000,
    eventType: 'Random',
    category: '專業服務支出',
    probability: 0.04,
    industry: 'Multisector'
  },
  {
    id: "International_Trade_Award",
    description: "【國際殊榮】獲頒 ESG 全球年度傑出企業，帶動多國主權基金加碼投資，資金成本大幅降低",
    amount: 300000,
    eventType: 'Sale',
    category: '平台訂閱收入',
    probability: 0.03,
    industry: 'Multisector'
  },
  {
    id: "Global_PR_Crisis",
    description: "【公關災難】某國分公司涉及當地政治敏感議題，引發多國聯合抵制，海外銷售額單月重挫",
    amount: 180000,
    eventType: 'Random',
    category: '營業外損失',
    probability: 0.05,
    industry: 'Multisector'
  },
  {
    id: "Regional_Hq_Grant",
    description: "【總部補貼】因將亞太總部設於新加坡，獲得當地政府研發經費返還與利息補貼",
    amount: 150000,
    eventType: 'Sale',
    category: '加值訂閱款',
    probability: 0.06,
    industry: 'Multisector'
  }
];
