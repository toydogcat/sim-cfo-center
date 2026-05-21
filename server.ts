/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy GoogleGenAI client builder
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 2. CFO Feedback endpoint using Gemini-3.5-flash
app.post('/api/cfo-feedback', async (req, res) => {
  const {
    industry,
    companyName,
    currentMonth,
    incomeStatement,
    balanceSheet,
    events,
    previousSummary
  } = req.body;

  // Formulate the analysis prompt
  const ledgerDoc = events.map((e: any) => `- [${e.date}] ${e.description} (${e.amount >= 0 ? '+' : ''}${e.amount}元, 類別: ${e.category})`).join('\n');

  const systemInstructions = `你是一位資深的企業財務長 (AI CFO)，性格冷靜、敏銳、講求數據痛點，有時在公司面臨財務危機時會顯得嚴厲而切中要害。
你將分析玩家公司的當月財報與隨機事件。請根據這些數據給出精闢的分析：
1. 診斷現金流與毛利率健康度。
2. 指出潛在危機（例如 SaaS 伺服器超高費用或惡劣的 R&D 流失；營建業材料暴漲或長達數月無工程款進帳導致的乾涸）。
3. 評估 warningStatus ('safe'、'warning' 或 'danger')。若現金餘額可能撐不過去下個月的固定支出，必須列為 'danger'！
4. 提供 2-4 條務實、不打高空的行動建議 (advice)（繁體中文），並提供一個玩家在本回合可以付費/募資採取的「suggestedAction」（可以為 null）。

必須嚴格遵守輸出 JSON 規格。`;

  const userPrompt = `
公司名稱：${companyName}
經營行業：${industry === 'SaaS' ? 'SaaS 軟體服務業' : '營建業 (Construction)'}
當前回合 (第 ${currentMonth} 個月)

【損益表當月數字】
- 主營業務收入：${incomeStatement.revenue} 元
- 研發及人事薪資：${incomeStatement.salaries} 元
- 材料與分包成本：${incomeStatement.materials} 元
- 雲端伺服器費用：${incomeStatement.servers} 元
- 意外與罰款損失：${incomeStatement.losses} 元
- 當月總費用支出：${incomeStatement.totalExpense} 元
- 當月淨利潤 (Net Income)：${incomeStatement.netIncome} 元

【資產負債表當月餘額】
- 現金及約當現金：${balanceSheet.cash} 元
- 應收帳款：${balanceSheet.receivables} 元
- 營運與生財設備：${balanceSheet.equipment} 元
- 總資產：${balanceSheet.totalAssets} 元
- 應付帳款：${balanceSheet.payables} 元
- 長期銀行借貸：${balanceSheet.loans} 元
- 創始資本股本：${balanceSheet.equityCapital} 元
- 累積盈餘 (Retained Earnings)：${balanceSheet.retainedEarnings} 元
- 總權益：${balanceSheet.totalEquity} 元

【本月商業事件明細】
${ledgerDoc}

歷史概況：上個月現金為 ${previousSummary?.cash || '未知'} 元，利潤為 ${previousSummary?.netIncome || '未知'} 元。

請針對此財報現狀，產出 CFO 分析報告。`;

  try {
    const ai = getGeminiClient();

    if (!ai) {
      console.log("No valid GEMINI_API_KEY detected. Utilizing structured human-heuristic mock CFO module.");
      // Render exceptional default feedback logic to keep game flawless even without key!
      const mockReport = generateHeuristicCFOReport(industry, currentMonth, incomeStatement, balanceSheet, events);
      res.json(mockReport);
      return;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstructions,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "對本月財務現狀的 150 字內簡明 CFO 診斷，一針見血。"
            },
            warningStatus: {
              type: Type.STRING,
              description: "必須為 'safe'、'warning' 或 'danger' 之一。"
            },
            advice: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 到 4 條具體的改善建議，使用繁體中文。"
            },
            suggestedAction: {
              type: Type.OBJECT,
              description: "本回合玩家可以付費執行的緊急決策。若無迫切決策則為 null。",
              properties: {
                id: { type: Type.STRING, description: "一個簡短的英文標識符，如 'apply_loan', 'audit_servers', 'buy_futures'" },
                title: { type: Type.STRING, description: "中文名稱，例如 '向商業銀行緊急融資 300k'" },
                cost: { type: Type.NUMBER, description: "執行此決策的現金額度成本，若是融資借券可以是負數或 0" },
                effect: { type: Type.STRING, description: "清楚說明執行後的財務好處，例如 '立即注入 30 萬元現金，並增加 30 萬元貸款負債'" }
              },
              required: ["id", "title", "cost", "effect"]
            }
          },
          required: ["summary", "warningStatus", "advice"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    // Graceful fallback to avoid breaking play flow
    const fallbackReport = generateHeuristicCFOReport(industry, currentMonth, incomeStatement, balanceSheet, events);
    res.json({
      ...fallbackReport,
      summary: `[AI 傳輸延遲 - 發送應急報告] ${fallbackReport.summary}`
    });
  }
});

// Heuristics based local analyzer fallback
function generateHeuristicCFOReport(
  industry: string,
  currentMonth: number,
  income: any,
  balance: any,
  events: any[]
): any {
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
    summary = `【防範流動性崩潰！】這是一個非常危險的信號，公司現金庫存僅剩 ${cash} 元！若下個月面臨必要的剛性支出（薪資、租金），現金流會直接斷裂。我們必須立刻融資。`;
    advice.push(`資金乾枯，必須立刻向銀行借貸或注入新資本，否則公司面臨倒閉危機。`);
    advice.push(`停止所有非必要的資產購置，並全力收回應收帳款 (當前應收餘額 ${balance.receivables} 元)。`);

    suggestedAction = {
      id: "apply_loan",
      title: "商業銀行緊急信用融資 (30 萬元)",
      cost: -300000, // Negative cost means net cash infusion!
      effect: "立刻注入 30 萬元現金至庫存，長期銀行借貸增加 30 萬元（無前期申請手續費）"
    };
  } else if (cash < 300000) {
    status = 'warning';
    summary = `【注意，防禦空間狹窄！】現金水位落入黃色警戒區 (${cash} 元)。雖能維持短暫運營，但無法承擔任何材料價格突變或客戶退款事件的衝擊。`;
    advice.push(`建議維持至少 3 個月的剛性支出作為安全儲備。`);
    if (industry === 'Construction' && balance.payables > 150000) {
      advice.push(`應付帳款未結清數額較高 (${balance.payables} 元)，應酌情展延材料付款期限以穩定現金水位。`);
    }
  } else {
    status = 'safe';
    summary = `【經營狀況平穩】當前現金餘額為 ${cash} 元，尚處於安全穩健水位。本月淨利潤為 ${netIncome} 元。讓我們繼續優化經營效率，擴大規模。`;
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
        effect: "本月發放 3 萬元獎金，從此鎖定人才！未來研發挖角事件概率降低 90%，且薪薪資成長幅度恢復常規。"
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

// 3. Vite Integration Server Config
async function startServer() {
  // Integrate Vite dynamically based on env or production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use('*', (req, res, next) => {
      // Directs fallback for clean Single Page Application routing
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI CFO War Room server booted successfully on port ${PORT}`);
  });
}

startServer();
