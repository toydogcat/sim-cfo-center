/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BusinessEvent, IndustryType } from './types';

function createDateStr(month: number, day: number): string {
  // Assuming simulation starts in 2026. Month 1 is Jan 2026, Month 12 is Dec 2026 etc.
  const startYear = 2026;
  const totalMonths = month - 1;
  const yearIdx = startYear + Math.floor(totalMonths / 12);
  const monthIdx = (totalMonths % 12) + 1;
  const monthStr = monthIdx < 10 ? `0${monthIdx}` : `${monthIdx}`;
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  return `${yearIdx}-${monthStr}-${dayStr}`;
}

// Generate unique sequential event IDs
let eventCounter = 1000;
function uniqueId(prefix: string): string {
  eventCounter++;
  return `${prefix}-${eventCounter}`;
}

export function generateMonthlyEvents(
  industry: IndustryType,
  currentMonth: number,
  saasGrowthFactor: number, // Starts at 1.0, increases with subscription blooms
  salaryMultiplier: number, // Multiplier based on poaching and union decisions
  headcount: number,
  marketStatus: 'Bull' | 'Stagnant' | 'Bear'
): { events: BusinessEvent[]; randomEventOccurrence: string | null } {
  const events: BusinessEvent[] = [];
  let randomEventOccurrence: string | null = null;

  // Market multipliers
  const marketRevMultiplier = marketStatus === 'Bull' ? 1.25 : marketStatus === 'Bear' ? 0.75 : 1.0;

  if (industry === 'SaaS') {
    // 1. Regular Salaries on 5th
    const RD_salary = Math.round(headcount * 18000 * salaryMultiplier);
    events.push({
      id: uniqueId('SAAS_PAY'),
      date: createDateStr(currentMonth, 5),
      description: `研發、行銷團隊與行政人員薪資發放 (編制人員: ${headcount} 人)`,
      amount: RD_salary,
      eventType: 'Payroll',
      industrySpecific: false,
      category: '薪資支出'
    });

    // 2. Continuous Cloud server invoice on 10th
    const serverFee = 25000;
    events.push({
      id: uniqueId('SAAS_SRV'),
      date: createDateStr(currentMonth, 10),
      description: "AWS & GCP 大中型主機及高防護 CDN 託管費",
      amount: serverFee,
      eventType: 'Purchase',
      industrySpecific: true,
      category: '雲端主機與伺服器'
    });

    // 3. Subscription Revenue (SaaS Subscriptions) on 28th
    // Base is 150000. It increases by 3-8% compound growth + growthFactor
    const pct = 1 + 0.03 + (Math.random() * 0.05); // 3-8% monthly trend
    const manpowerFactor = 0.6 + 0.4 * (headcount / 10);
    const baseRevenue = Math.round(150000 * Math.pow(pct, currentMonth - 1) * saasGrowthFactor * manpowerFactor * marketRevMultiplier);
    
    events.push({
      id: uniqueId('SAAS_REV'),
      date: createDateStr(currentMonth, 28),
      description: `全球企業客戶訂閱雲端平台套件收入 (第 ${currentMonth} 回合，產能因子: ${(manpowerFactor * 100).toFixed(0)}%，景氣係數: ${marketStatus === 'Bull' ? '繁榮多頭 🚀 (1.25x)' : marketStatus === 'Bear' ? '熊市衰退 📉 (0.75x)' : '持平 ⚖️ (1.0x)'})`,
      amount: baseRevenue,
      eventType: 'Sale',
      industrySpecific: true,
      category: '平台訂閱收入'
    });

    // 4. Random Events (occurrence probability: 45%)
    const rng = Math.random();
    if (rng < 0.45) {
      if (rng < 0.15) {
        // Red Code Event: Server blackout damages
        randomEventOccurrence = "Server_Outage";
        events.push({
          id: uniqueId('SAAS_EVT'),
          date: createDateStr(currentMonth, 18),
          description: "【重大事故】亞太數據中心骨幹網路大斷線，補償客戶損失與退款",
          amount: 80000,
          eventType: 'Random',
          industrySpecific: true,
          category: '營業外賠償'
        });
      } else if (rng < 0.30) {
        // Talent crisis: competitor poaching
        randomEventOccurrence = "Talent_Poaching";
        events.push({
          id: uniqueId('SAAS_EVT'),
          date: createDateStr(currentMonth, 15),
          description: "【外部競爭】外部競品以高薪向本公司研發骨幹挖角，核心團隊需提發激勵獎金",
          amount: 40005,
          eventType: 'Random',
          industrySpecific: true,
          category: '人才防護獎勵'
        });
      } else {
        // Subscription Boom!
        randomEventOccurrence = "Sub_Boom";
        events.push({
          id: uniqueId('SAAS_EVT'),
          date: createDateStr(currentMonth, 25),
          description: "【爆紅效應】產品榮獲 Product Hunt 當日推選第一名，企業客戶大湧入一筆巨額預存",
          amount: 120000,
          eventType: 'Random',
          industrySpecific: true,
          category: '加值訂閱款'
        });
      }
    }
  } else {
    // CONSTRUCTION (營建業)
    // 1. Regular materials purchase on 8th (fixed high expense)
    const baseMaterial = 300000;
    events.push({
      id: uniqueId('CONS_PUR'),
      date: createDateStr(currentMonth, 8),
      description: "向預拌混凝土與鋼筋經銷商採購土建工程物料",
      amount: baseMaterial,
      eventType: 'Purchase',
      industrySpecific: true,
      category: '營建材料採購'
    });

    // 2. Subcontractor payroll on 15th (salaries)
    const subSalary = Math.round(headcount * 4000);
    events.push({
      id: uniqueId('CONS_PAY'),
      date: createDateStr(currentMonth, 15),
      description: `工地區段分包工班進度款與外包工資發放 (派駐雇工: ${headcount} 人)`,
      amount: subSalary,
      eventType: 'Payroll',
      industrySpecific: false,
      category: '薪資支出'
    });

    // 3. Equipment lease on 20th
    const eqpFee = 40000;
    events.push({
      id: uniqueId('CONS_EQP'),
      date: createDateStr(currentMonth, 20),
      description: "租賃高壓吊車及重型挖掘設備費用",
      amount: eqpFee,
      eventType: 'Purchase',
      industrySpecific: true,
      category: '生財設備租用'
    });

    // 4. Milestone invoice payment loop (billed every 3rd month or based on probability)
    // Every 3rd month is a solid milestone.
    // e.g., month = 3, 6, 9 etc, or a 20% random speed chance in other months
    const isMilestoneCleared = (currentMonth % 3 === 0) || (Math.random() < 0.20 && currentMonth > 1);
    if (isMilestoneCleared) {
      const constMarketMultiplier = marketStatus === 'Bull' ? 1.20 : marketStatus === 'Bear' ? 0.80 : 1.0;
      const manpowerFactor = 0.5 + 0.5 * (headcount / 30);
      const projPayout = Math.round(1200000 * manpowerFactor * constMarketMultiplier);
      events.push({
        id: uniqueId('CONS_REV'),
        date: createDateStr(currentMonth, 27),
        description: `【進度請款】台北科技大樓主結構體封頂及驗收，業主核准進度款匯入 (工程戰力: ${(manpowerFactor * 100).toFixed(0)}%，景氣係數: ${marketStatus === 'Bull' ? '多頭擴張 📈 (1.2x)' : marketStatus === 'Bear' ? '緊縮退潮 📉 (0.8x)' : '持平 ⚖️ (1.0x)'})`,
        amount: projPayout,
        eventType: 'Sale',
        industrySpecific: true,
        category: '工程進度款請撥'
      });
    }

    // 5. Random Events (chance: 50%)
    const rng = Math.random();
    if (rng < 0.50) {
      if (rng < 0.15) {
        // Steel/Cement cost spike
        randomEventOccurrence = "Cost_Spike";
        events.push({
          id: uniqueId('CONS_EVT'),
          date: createDateStr(currentMonth, 12),
          description: "【成本攀升】國際鋼鐵與砂石原物料巨幅上漲，造成材料採購追加合約差額",
          amount: 150000,
          eventType: 'Purchase',
          industrySpecific: true,
          category: '營建材料採購'
        });
      } else if (rng < 0.30) {
        // Site delay fine/penalty
        randomEventOccurrence = "Project_Delay";
        events.push({
          id: uniqueId('CONS_EVT'),
          date: createDateStr(currentMonth, 17),
          description: "【工期落後】因連續梅雨與出土阻礙，工期進度落後遭市府開罰與罰金補償",
          amount: 90000,
          eventType: 'Random',
          industrySpecific: true,
          category: '罰款支出'
        });
      } else if (rng < 0.45) {
        // Workplace Safety Disaster! High losses
        randomEventOccurrence = "Safety_Event";
        events.push({
          id: uniqueId('CONS_EVT'),
          date: createDateStr(currentMonth, 14),
          description: "【工安事件】工地發生重物墜落砸毀停放車輛與受傷，暫時勒令停工整頓並賠償",
          amount: 220000,
          eventType: 'Random',
          industrySpecific: true,
          category: '意外賠償損失'
        });
      } else if (rng < 0.50) {
        // Overdue Receivables Paid: A nice lump sum cash infusion from accounts receivable!
        randomEventOccurrence = "Collection_Receivable";
        events.push({
          id: uniqueId('CONS_EVT'),
          date: createDateStr(currentMonth, 22),
          description: "【帳款回收】向長期往來業主收回上期拖延之科技園區外牆工程保留款",
          amount: 300000,
          eventType: 'Sale', // mapped to Sale category '應收帳款請款' (Cash up, Receivables down)
          industrySpecific: true,
          category: '應收帳款請款'
        });
      }
    }
  }

  return {
    events,
    randomEventOccurrence
  };
}
