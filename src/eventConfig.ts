import { BusinessEvent } from './types';

export interface RandomEventTemplate {
  id: string;
  description: string;
  amount: number;
  eventType: BusinessEvent['eventType'];
  category: string;
  probability: number;
  industry: 'SaaS' | 'Construction' | 'Both';
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
  }
];
