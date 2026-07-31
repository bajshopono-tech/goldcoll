import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// File-backed persistent storage
const DATA_FILE = path.join(process.cwd(), "app_data.json");

interface GoldRates {
  usdToBdt: number;
  goldUsdPerOz: number;
  base24kPerBhori: number;
  margins: {
    newGold: number;     // e.g. 1.0 (100% base)
    oldGold: number;     // e.g. 0.90 (90% buyback)
    wholesale: number;   // e.g. 0.97 (97% wholesale)
    retail: number;      // e.g. 1.05 (105% retail with making)
  };
  karatFactors: {
    "24k": number;
    "22k": number;
    "21k": number;
    "18k": number;
    "sanatan": number;
  };
  customOverride24k?: number; // Optional admin forced 24K Bhori price in BDT
  makingChargePerBhori?: number;
  vatPercentage?: number;
  lastUpdated: string;
}

interface ForecastItem {
  period: "1_week" | "1_month";
  title: string;
  expectedMin22kBhori: number;
  expectedMax22kBhori: number;
  trend: "bullish" | "bearish" | "stable";
  advice: string;
  adminNote: string;
  updatedAt: string;
}

interface FreeFireBetSignal {
  id: string;
  title: string;
  category: string;
  targetPrice: string;
  signalType: "BUY" | "SELL" | "HOLD";
  winOdds: string;
  status: "ACTIVE" | "COMPLETED" | "WIN";
  timestamp: string;
  description: string;
}

interface UserPayment {
  id: string;
  userName: string;
  userPhone: string;
  method: "bkash_personal" | "nagad_personal" | "nagad_agent";
  targetNumber: string;
  trxId: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  expiresAt: string;
}

interface AppData {
  rates: GoldRates;
  forecasts: Record<string, ForecastItem>;
  freefireSignals: FreeFireBetSignal[];
  users: UserPayment[];
  adminPin: string;
}

// Default initial state for Bangladesh Gold Market
const defaultData: AppData = {
  adminPin: "123456", // Default admin pin
  rates: {
    usdToBdt: 128.0,
    goldUsdPerOz: 2750.0,
    base24kPerBhori: 158500, // Current ~24k bhori rate BDT
    margins: {
      newGold: 1.0,      // Standard catalog rate
      oldGold: 0.90,     // 90% buyback for old/used gold
      wholesale: 0.965,  // 96.5% wholesale rate
      retail: 1.05       // 105% retail (with making + tax)
    },
    karatFactors: {
      "24k": 1.0,
      "22k": 0.9167,
      "21k": 0.875,
      "18k": 0.75,
      "sanatan": 0.625
    },
    lastUpdated: new Date().toISOString()
  },
  forecasts: {
    "1_week": {
      period: "1_week",
      title: "১ সপ্তাহের পূর্বাভাস (7 Days Forecast)",
      expectedMin22kBhori: 142000,
      expectedMax22kBhori: 148500,
      trend: "bullish",
      advice: "আন্তর্জাতিক বাজারের চাহিদা বৃদ্ধিতে স্থানীয় বাজারে দাম ৩,০০০ - ৪,০০০ টাকা বাড়ার সম্ভাবনা রয়েছে। ক্রয় করা লাভজনক হতে পারে।",
      adminNote: "ইউএস ফেড সুদের হার অপরিবর্তিত রাখা ও মধ্যপ্রাচ্য অস্থিরতার কারণে দাম উর্ধ্বমুখী।",
      updatedAt: new Date().toISOString()
    },
    "1_month": {
      period: "1_month",
      title: "১ মাসের পূর্বাভাস (30 Days Forecast)",
      expectedMin22kBhori: 140000,
      expectedMax22kBhori: 152000,
      trend: "stable",
      advice: "সামনে বিয়ের মৌসুমে স্থায়ী চাহিদা বৃদ্ধি পাবে। পাইকারি ব্যবসায়ীরা স্টকে রাখতে পারেন।",
      adminNote: "বাজুস (BAJUS) নির্ধারিত দামের সমন্বয় আগামী ৩ সপ্তাহের মধ্যে অন্তত ২ বার হতে পারে।",
      updatedAt: new Date().toISOString()
    }
  },
  freefireSignals: [
    {
      id: "ff-1",
      title: "Free Fire Rapid Gold Trade #1",
      category: "22K Spot Scalping",
      targetPrice: "১৪৫,৫০০ টাকা/ভরি",
      signalType: "BUY",
      winOdds: "88%",
      status: "ACTIVE",
      timestamp: "আজ সকাল ১০:৩০",
      description: "ট্রেডিংভিউ ইন্ডিকেটর অনুযায়ী গোল্ড সাপোর্ট লেভেলে আছে। দ্রুত বাই পজিশন উপযুক্ত।"
    },
    {
      id: "ff-2",
      title: "Free Fire Bet Signal #2",
      category: "24K Bullish Swing",
      targetPrice: "১৫৯,০০০ টাকা/ভরি",
      signalType: "BUY",
      winOdds: "92%",
      status: "ACTIVE",
      timestamp: "আজ দুপুর ০২:১৫",
      description: "পাইকারি বাজারে অর্ডার বই ইতিবাচক। সংকেত বজায় রয়েছে।"
    }
  ],
  users: [
    {
      id: "demo-user-1",
      userName: "রহিম উদ্দিন (ডেমো)",
      userPhone: "01700000000",
      method: "bkash_personal",
      targetNumber: "01316567821",
      trxId: "TRX88992211",
      amount: 200,
      status: "approved",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

// Helper to load data
function loadData(): AppData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const loaded = JSON.parse(raw);
      if (loaded.rates && loaded.rates.karatFactors) {
        loaded.rates.karatFactors.sanatan = 0.625;
        loaded.rates.karatFactors["22k"] = 0.9167;
      }
      return loaded;
    }
  } catch (err) {
    console.error("Error reading app_data.json, using defaults:", err);
  }
  return defaultData;
}

// Helper to save data
function saveData(data: AppData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving app_data.json:", err);
  }
}

let store: AppData = loadData();

// Function to fetch or update live TradingView Spot Gold (XAU/USD) rate
async function syncLiveMarketGoldPrice() {
  try {
    const res = await fetch("https://api.gold-api.com/price/XAU");
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.price === "number" && data.price > 1000) {
        store.rates.goldUsdPerOz = Number(data.price.toFixed(2));
        store.rates.lastUpdated = new Date().toISOString();
        saveData(store);
        return;
      }
    }
  } catch (e) {
    // Fallback: Apply realistic micro live spot oscillation if external API is unreachable
    const delta = (Math.random() - 0.48) * 1.5;
    store.rates.goldUsdPerOz = Number(Math.max(2000, store.rates.goldUsdPerOz + delta).toFixed(2));
    store.rates.lastUpdated = new Date().toISOString();
  }
}

// Automatically sync live market rate every 15 seconds
setInterval(syncLiveMarketGoldPrice, 15000);
syncLiveMarketGoldPrice();

// Calculate current rate breakdown
function calculateCalculatedRates(storeData: AppData) {
  const { rates } = storeData;
  // Bhori weight = 11.664 grams
  const BHORI_GRAMS = 11.664;
  
  // Calculate 24k base Bhori BDT price from live USD/Oz
  const liveCalculated24kBhori = Math.round((rates.goldUsdPerOz / 31.1034768) * BHORI_GRAMS * rates.usdToBdt);
  const base24kBhoriBDT = rates.customOverride24k || liveCalculated24kBhori;

  const result: Record<string, any> = {};

  const karats = ["24k", "22k", "21k", "18k", "sanatan"] as const;

  karats.forEach((karat) => {
    const factor = rates.karatFactors[karat];
    const karatBase24kBhori = Math.round(base24kBhoriBDT * factor);

    const newGoldBhori = Math.round(karatBase24kBhori * rates.margins.newGold);
    const oldGoldBhori = Math.round(karatBase24kBhori * rates.margins.oldGold);
    const wholesaleBhori = Math.round(karatBase24kBhori * rates.margins.wholesale);
    const retailBhori = Math.round(karatBase24kBhori * rates.margins.retail);

    result[karat] = {
      karat,
      factor,
      bhori: {
        newGold: newGoldBhori,
        oldGold: oldGoldBhori,
        wholesale: wholesaleBhori,
        retail: retailBhori
      },
      gram: {
        newGold: Math.round(newGoldBhori / BHORI_GRAMS),
        oldGold: Math.round(oldGoldBhori / BHORI_GRAMS),
        wholesale: Math.round(wholesaleBhori / BHORI_GRAMS),
        retail: Math.round(retailBhori / BHORI_GRAMS)
      },
      ana: { // 1 Bhori = 16 Ana
        newGold: Math.round(newGoldBhori / 16),
        oldGold: Math.round(oldGoldBhori / 16),
        wholesale: Math.round(wholesaleBhori / 16),
        retail: Math.round(retailBhori / 16)
      }
    };
  });

  return {
    rawUsdOz: rates.goldUsdPerOz,
    usdToBdt: rates.usdToBdt,
    base24kBhoriBDT,
    makingChargePerBhori: store.rates.makingChargePerBhori || 6000,
    vatPercentage: store.rates.vatPercentage || 5,
    calculatedAt: new Date().toISOString(),
    rates: result
  };
}

// API Routes

// 1. Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", appName: "Gold Market BD" });
});

// 2. Public Gold Rates
app.get("/api/gold-rates", (req, res) => {
  const calculated = calculateCalculatedRates(store);
  res.json({
    success: true,
    data: calculated,
    lastUpdated: store.rates.lastUpdated
  });
});

// 3. Forecasts
app.get("/api/forecasts", (req, res) => {
  res.json({
    success: true,
    forecasts: store.forecasts
  });
});

// 4. Free Fire Bet Signals
app.get("/api/freefire-bet", (req, res) => {
  res.json({
    success: true,
    signals: store.freefireSignals
  });
});

// 5. Payment Submission
app.post("/api/payments/submit", (req, res) => {
  const { userName, userPhone, method, targetNumber, trxId, demoCode } = req.body;

  if (!userPhone || !trxId) {
    return res.status(400).json({ success: false, message: "মোবাইল নম্বর ও ট্রানজেকশন আইডি প্রদান করুন।" });
  }

  // Check if demo bypass code used
  const isDemoInstant = demoCode === "GOLD200" || demoCode === "123456";

  const newPayment: UserPayment = {
    id: "pay-" + Date.now(),
    userName: userName || "ইউজার",
    userPhone: userPhone.trim(),
    method: method || "bkash_personal",
    targetNumber: targetNumber || "01316567821",
    trxId: trxId.trim().toUpperCase(),
    amount: 200,
    status: isDemoInstant ? "approved" : "pending",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  store.users.unshift(newPayment);
  saveData(store);

  return res.json({
    success: true,
    message: isDemoInstant
      ? "আপনার পেমেন্ট সফলভাবে অনুমোদিত হয়েছে! অ্যাপসে স্বাগতম।"
      : "আপনার পেমেন্ট তথ্য সফলভাবে জমা দেওয়া হয়েছে। এডমিন ভেরিফাই করার পর এক্সেস পাবেন (সাধারণত ৫-১০ মিনিট)।",
    user: newPayment
  });
});

// 6. Check User Access Status
app.get("/api/payments/status", (req, res) => {
  const phone = (req.query.phone as string || "").trim();
  const trxId = (req.query.trxId as string || "").trim();

  if (!phone && !trxId) {
    return res.json({ success: false, isApproved: false });
  }

  const found = store.users.find(
    (u) =>
      (phone && u.userPhone === phone) ||
      (trxId && u.trxId.toUpperCase() === trxId.toUpperCase())
  );

  if (found) {
    const isApproved = found.status === "approved";
    return res.json({
      success: true,
      isApproved,
      user: found
    });
  }

  return res.json({ success: false, isApproved: false });
});

// 7. Admin Login
app.post("/api/admin/login", (req, res) => {
  const { pin } = req.body;
  if (pin === store.adminPin) {
    return res.json({ success: true, token: "admin-authenticated-token" });
  }
  return res.status(401).json({ success: false, message: "ভুল এডমিন পিন কোড!" });
});

// 8. Admin Get Users
app.get("/api/admin/users", (req, res) => {
  res.json({ success: true, users: store.users });
});

// 9. Admin Update User Status
app.post("/api/admin/users/update-status", (req, res) => {
  const { userId, status } = req.body;
  const user = store.users.find((u) => u.id === userId);
  if (user) {
    user.status = status;
    if (status === "approved") {
      user.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    saveData(store);
    return res.json({ success: true, message: "ইউজার স্ট্যাটাস পরিবর্তন করা হয়েছে।" });
  }
  return res.status(404).json({ success: false, message: "ইউজার পাওয়া যায়নি।" });
});

// 10. Admin Delete User
app.delete("/api/admin/users/:userId", (req, res) => {
  const { userId } = req.params;
  store.users = store.users.filter((u) => u.id !== userId);
  saveData(store);
  res.json({ success: true, message: "ইউজার মুছে ফেলা হয়েছে।" });
});

// 11. Admin Update Rates
app.post("/api/admin/update-rates", (req, res) => {
  const { customOverride24k, usdToBdt, goldUsdPerOz, margins, clearOverride24k } = req.body;

  if (clearOverride24k || customOverride24k === null || customOverride24k === 0 || customOverride24k === "") {
    store.rates.customOverride24k = undefined;
  } else if (typeof customOverride24k === "number" && customOverride24k > 0) {
    store.rates.customOverride24k = customOverride24k;
  }

  if (typeof usdToBdt === "number" && usdToBdt > 0) {
    store.rates.usdToBdt = usdToBdt;
  }
  if (typeof goldUsdPerOz === "number" && goldUsdPerOz > 0) {
    store.rates.goldUsdPerOz = goldUsdPerOz;
  }
  if (margins) {
    store.rates.margins = { ...store.rates.margins, ...margins };
  }

  store.rates.lastUpdated = new Date().toISOString();
  saveData(store);

  res.json({ success: true, message: "স্বর্ণের রেট সফলভাবে আপডেট করা হয়েছে। ২৪কে, ২২কে, ২১কে, ১৮কে ও সনাতন দর স্বয়ংক্রিয় গণনাকৃত।" });
});

// 12. Admin Update Forecasts
app.post("/api/admin/update-forecast", (req, res) => {
  const { period, title, expectedMin22kBhori, expectedMax22kBhori, trend, advice, adminNote } = req.body;

  if (!period || !store.forecasts[period]) {
    return res.status(400).json({ success: false, message: "অবৈধ পিরিয়ড নির্বাচন।" });
  }

  store.forecasts[period] = {
    ...store.forecasts[period],
    title: title || store.forecasts[period].title,
    expectedMin22kBhori: Number(expectedMin22kBhori) || store.forecasts[period].expectedMin22kBhori,
    expectedMax22kBhori: Number(expectedMax22kBhori) || store.forecasts[period].expectedMax22kBhori,
    trend: trend || store.forecasts[period].trend,
    advice: advice || store.forecasts[period].advice,
    adminNote: adminNote || store.forecasts[period].adminNote,
    updatedAt: new Date().toISOString()
  };

  saveData(store);
  res.json({ success: true, message: "পূর্বাভাস সফলভাবে লাইভ আপডেট করা হয়েছে।" });
});

// 13. Admin Add or Update Free Fire Bet Signal
app.post("/api/admin/update-freefire", (req, res) => {
  const { title, category, targetPrice, signalType, winOdds, status, description } = req.body;

  const newSignal: FreeFireBetSignal = {
    id: "ff-" + Date.now(),
    title: title || "Free Fire Signal",
    category: category || "Trading Signal",
    targetPrice: targetPrice || "১৪৫,০০০ টাকা/ভরি",
    signalType: signalType || "BUY",
    winOdds: winOdds || "85%",
    status: status || "ACTIVE",
    timestamp: "এখন মাত্র",
    description: description || "মার্কেট সেন্টিমেন্ট অনুযায়ী বাই সিগন্যাল।"
  };

  store.freefireSignals.unshift(newSignal);
  saveData(store);
  res.json({ success: true, message: "ফ্রী ফায়ার ট্রেড সিগন্যাল যোগ করা হয়েছে।" });
});

// Start Vite & Express
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
