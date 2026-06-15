import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// ── Session ID (persisted across refreshes) ──────────────────────────────────
function getSessionId(): string {
  let id = localStorage.getItem('carboniq_session');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('carboniq_session', id);
  }
  return id;
}

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach session ID to every request
api.interceptors.request.use((config) => {
  config.headers['X-Session-Id'] = getSessionId();
  return config;
});

// Normalise error messages
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 429) {
      return Promise.reject(new Error('Whoa there! You are typing too fast. Please wait a moment before trying again.'));
    }
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      return Promise.reject(new Error('The server is taking too long to respond. Please try again.'));
    }
    if (!err.response && err.request) {
      return Promise.reject(new Error('Network error. Please check your connection and ensure the server is running.'));
    }

    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// ── Type definitions ──────────────────────────────────────────────────────────

export interface SMSParseResult {
  raw: string;
  merchant: string;
  category: string;
  amount: number;
  carbonScore: number;
  breakdown: Record<string, number>;
  swap: { description: string; moneySaved: number; carbonSaved: number; unit: string };
  parsedBy: 'regex' | 'groq' | 'mock';
  confidence: number;
}

export interface DailySwap {
  id: string;
  category: string;
  emoji: string;
  triggerBehavior: string;
  suggestion: string;
  description: string;
  carbonSavedKg: number;
  moneySavedINR: number;
  neighborCount: number;
  totalScore: number;
  generatedAt: string;
}

export interface MohallaStats {
  pincode: string;
  city: string;
  area: string;
  state: string;
  gridFactor: number;
  renewablePct: number;
  userFootprintKg: number;
  areaAverageKg: number;
  percentile: number;
  message: string;
  topSwaps: string[];
  topSwapAdoptionPcts: number[];
  householdsInArea: number;
  leaderboard: Array<{ rank: number; label: string; dailyCO2Kg: number; topSwap: string }>;
  collectiveImpact: { ifAllSwapped: number; unit: string };
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unit: string;
  priceINR: number;
  carbonKg: number;
  category: string;
  flag: 'low' | 'moderate' | 'high' | 'unknown';
  note?: string;
}

export interface ReceiptResult {
  storeName: string;
  items: ReceiptItem[];
  totalCarbon: number;
  highestImpactItem: string;
  swap: { fromItem: string; toItem: string; moneySavedINR: number; carbonSavedKg: number };
}

export interface WalletState {
  sessionId: string;
  totalCO2SavedKg: number;
  totalMoneySavedINR: number;
  swapsCompleted: number;
  swapHistory: Array<{
    swapId: string; label: string;
    carbonSavedKg: number; moneySavedINR: number; completedAt: string;
  }>;
  milestone: {
    current: { threshold: number; name: string; reward: string; badge: string } | null;
    next: { threshold: number; name: string; reward: string; badge: string; amountToGo: number } | null;
  };
}

export interface BillAnalysis {
  units: number;
  billingDays: number;
  state: string;
  gridFactor: number;
  totalCO2Kg: number;
  dailyUnits: number;
  dailyCO2Kg: number;
  breakdown: Array<{ appliance: string; percentage: number; estimatedUnits: number; kgCO2: number }>;
  topAction: string;
  heatingPct: number;
  coolingPct: number;
  equivalents: { treeDays: number; kmsNotDriven: number };
}

export interface TravelAnalysis {
  mode: string;
  route: string;
  distanceKm: number;
  carbonKg: number;
  swap: {
    description: string;
    carbonSavedKg: number;
    moneySavedINR: number;
  };
}

// ── API functions ─────────────────────────────────────────────────────────────

/** Parse a raw SMS message */
export async function parseSMS(sms: string): Promise<SMSParseResult> {
  const { data } = await api.post<{ success: true; data: SMSParseResult }>('/sms/parse', { sms });
  return data.data;
}

/** Get sample SMS messages */
export async function getSMSSamples(): Promise<string[]> {
  const { data } = await api.get<{ success: true; data: string[] }>('/sms/samples');
  return data.data;
}

/** Get today's One Swap card */
export async function getDailySwap(category?: string): Promise<DailySwap> {
  const { data } = await api.get<{ success: true; data: DailySwap }>(
    '/swap/daily',
    { params: category ? { category } : {} }
  );
  return data.data;
}

/** Get Mohalla neighbourhood stats */
export async function getMohallaStats(pincode: string, userCO2?: number): Promise<MohallaStats> {
  const { data } = await api.get<{ success: true; data: MohallaStats }>(
    `/mohalla/${pincode}`,
    { params: userCO2 ? { userCO2 } : {} }
  );
  return data.data;
}

/** Upload a receipt image for carbon analysis */
export async function analyzeReceipt(file: File): Promise<ReceiptResult> {
  const form = new FormData();
  form.append('receipt', file);
  const { data } = await api.post<{ success: true; data: ReceiptResult }>(
    '/receipt/analyze',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.data;
}

/** Send a message to Carbon Copilot */
export async function chatWithCopilot(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: { state?: string; city?: string }
): Promise<string> {
  const { data } = await api.post<{ success: true; data: { reply: string } }>(
    '/copilot/chat',
    { messages, context }
  );
  return data.data.reply;
}

/** Get suggested Copilot conversation starters */
export async function getCopilotStarters(): Promise<string[]> {
  const { data } = await api.get<{ success: true; data: string[] }>('/copilot/starters');
  return data.data;
}

/** Get current wallet state */
export async function getWallet(): Promise<WalletState> {
  const { data } = await api.get<{ success: true; data: WalletState }>('/wallet');
  return data.data;
}

/** Record a completed swap in the wallet */
export async function recordSwapAction(payload: {
  carbonSavedKg: number;
  moneySavedINR: number;
  swapId: string;
  label?: string;
}): Promise<WalletState> {
  const { data } = await api.post<{ success: true; data: WalletState }>('/wallet/action', payload);
  return data.data;
}

/** Analyse an electricity bill by text inputs */
export async function analyzeBill(params: {
  units: number;
  state: string;
  billingDays: number;
  amount?: number;
}): Promise<BillAnalysis> {
  const res = await api.post<{ data: BillAnalysis }>('/bill', params);
  return res.data.data;
}

export async function analyzeTravel(itinerary: string): Promise<TravelAnalysis> {
  const res = await api.post<{ data: TravelAnalysis }>('/travel', { itinerary });
  return res.data.data;
}

export default api;
