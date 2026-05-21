/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BusinessEvent, IndustryType } from './types';
import { RANDOM_EVENTS, RandomEventTemplate } from './eventConfig';

function createDateStr(month: number, day: number): string {
  const startYear = 2026;
  const totalMonths = month - 1;
  const yearIdx = startYear + Math.floor(totalMonths / 12);
  const monthIdx = (totalMonths % 12) + 1;
  const monthStr = monthIdx < 10 ? `0${monthIdx}` : `${monthIdx}`;
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  return `${yearIdx}-${monthStr}-${dayStr}`;
}

let eventCounter = 1000;
function uniqueId(prefix: string): string {
  eventCounter++;
  return `${prefix}-${eventCounter}`;
}

export function generateMonthlyEvents(
  industry: IndustryType,
  currentMonth: number,
  saasGrowthFactor: number,
  salaryMultiplier: number,
  headcount: number,
  marketStatus: 'Bull' | 'Stagnant' | 'Bear'
): { events: BusinessEvent[]; randomEventOccurrence: string | null } {
  const events: BusinessEvent[] = [];
  let randomEventOccurrence: string | null = null;

  const marketRevMultiplier = marketStatus === 'Bull' ? 1.25 : marketStatus === 'Bear' ? 0.75 : 1.0;

  if (industry === 'SaaS') {
    // 1. Regular Salaries
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

    // 2. Cloud server invoice
    const serverFee = 25000 + (headcount > 15 ? (headcount - 15) * 2000 : 0);
    events.push({
      id: uniqueId('SAAS_SRV'),
      date: createDateStr(currentMonth, 10),
      description: "AWS & GCP 大中型主機及高防護 CDN 託管費 (隨規模動態調整)",
      amount: serverFee,
      eventType: 'Purchase',
      industrySpecific: true,
      category: '雲端主機與伺服器'
    });

    // 3. Subscription Revenue
    const pct = 1 + 0.03 + (Math.random() * 0.05);
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
    } else if (industry === 'Construction') {
    // CONSTRUCTION
    const baseMaterial = 300000 + (headcount > 30 ? (headcount - 30) * 5000 : 0);    events.push({
      id: uniqueId('CONS_PUR'),
      date: createDateStr(currentMonth, 8),
      description: "向預拌混凝土與鋼筋經銷商採購土建工程物料 (隨人力規模擴大)",
      amount: baseMaterial,
      eventType: 'Purchase',
      industrySpecific: true,
      category: '營建材料採購'
    });

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

    const eqpFee = 40000 + (headcount > 40 ? 20000 : 0);
    events.push({
      id: uniqueId('CONS_EQP'),
      date: createDateStr(currentMonth, 20),
      description: "租賃高壓吊車及重型挖掘設備費用 (隨工期規模調整)",
      amount: eqpFee,
      eventType: 'Purchase',
      industrySpecific: true,
      category: '生財設備租用'
    });

    const isMilestoneCleared = (currentMonth % 3 === 0) || (Math.random() < 0.25 && currentMonth > 1);
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
  } else if (industry === 'F&B') {
    // F&B (餐飲業)
    // 1. Rent on 1st
    const rentFee = 80000;
    events.push({
      id: uniqueId('FB_RENT'),
      date: createDateStr(currentMonth, 1),
      description: "商業地段店面月租金與物業管理費",
      amount: rentFee,
      eventType: 'Purchase',
      industrySpecific: true,
      category: '營業外支出'
    });

    // 2. Ingredients on 10th
    const ingredientCost = Math.round(120000 * (1 + (Math.random() * 0.2 - 0.1))); // Variable cost
    events.push({
      id: uniqueId('FB_ING'),
      date: createDateStr(currentMonth, 10),
      description: "本月生鮮食材、乾貨及調味料採購款",
      amount: ingredientCost,
      eventType: 'Purchase',
      industrySpecific: true,
      category: '餐飲食材採購'
    });

    // 3. Salaries on 15th
    const fbSalary = Math.round(headcount * 6000 * salaryMultiplier); // Lower base than SaaS
    events.push({
      id: uniqueId('FB_PAY'),
      date: createDateStr(currentMonth, 15),
      description: `外場服務員與內場廚師薪資發放 (編制人員: ${headcount} 人)`,
      amount: fbSalary,
      eventType: 'Payroll',
      industrySpecific: false,
      category: '薪資支出'
    });

    // 4. Revenue on 28th (Daily collection summed)
    const fbMarketMultiplier = marketStatus === 'Bull' ? 1.30 : marketStatus === 'Bear' ? 0.70 : 1.0;
    const manpowerFactor = 0.7 + 0.3 * (headcount / 15);
    const baseFBRevenue = Math.round(450000 * manpowerFactor * fbMarketMultiplier);
    
    events.push({
      id: uniqueId('FB_REV'),
      date: createDateStr(currentMonth, 28),
      description: `本月餐廳現場內用與外送總營業額認列 (服務戰力: ${(manpowerFactor * 100).toFixed(0)}%，景氣係數: ${marketStatus === 'Bull' ? '消費熱絡 🚀 (1.3x)' : marketStatus === 'Bear' ? '景氣蕭條 📉 (0.7x)' : '持平 ⚖️ (1.0x)'})`,
      amount: baseFBRevenue,
      eventType: 'Sale',
      industrySpecific: true,
      category: '餐飲銷售收入'
    });
  }

  // --- Unified Config-Driven Random Events ---
  const industryEvents = RANDOM_EVENTS.filter(e => e.industry === industry || e.industry === 'Both');
  
  // Try to trigger one random event based on probability
  const rolledEvents = industryEvents.filter(e => Math.random() < e.probability);
  
  if (rolledEvents.length > 0) {
    // If multiple rolled, pick one (or could pick all, but for gameplay balance we pick one)
    const selected = rolledEvents[Math.floor(Math.random() * rolledEvents.length)];
    
    randomEventOccurrence = selected.id;
    events.push({
      id: uniqueId(`${industry.toUpperCase()}_EVT`),
      date: createDateStr(currentMonth, 14 + Math.floor(Math.random() * 10)), // random day between 14-24
      description: selected.description,
      amount: selected.amount,
      eventType: selected.eventType,
      industrySpecific: true,
      category: selected.category
    });
  }

  return {
    events,
    randomEventOccurrence
  };
}
