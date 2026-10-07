import {
  EARNINGS_WINDOW_DAYS,
  MAX_STOCK_PRICE,
} from "@/shared/lib/types";
import { fetchQuote, type EarningsEvent } from "@/features/market/server/finnhub";

export type EligiblePin = {
  ticker: string;
  price: number;
  earningsDate: string;
  earningsHour: string;
  suggestedSymbol: string;
  suggestedName: string;
};

const QUOTE_CONCURRENCY = 6;
const MAX_SYMBOLS_TO_QUOTE = 60;
const MAX_RESULTS = 40;

export function suggestCoinFields(ticker: string): {
  suggestedSymbol: string;
  suggestedName: string;
} {
  const t = ticker.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const suggestedSymbol = `${t}MEME`.slice(0, 16);
  const suggestedName = `${t} Arena`.slice(0, 64);
  return { suggestedSymbol, suggestedName };
}

async function fetchBulkEarningsCalendar(
  from: Date,
  to: Date,
): Promise<EarningsEvent[]> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return mockEligibleCalendar(from);

  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);
  const url = `https://finnhub.io/api/v1/calendar/earnings?from=${fromStr}&to=${toStr}&token=${key}`;
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) {
    throw new Error(`Finnhub earnings calendar failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    earningsCalendar?: Array<{ symbol?: string; date?: string; hour?: string }>;
  };

  return (data.earningsCalendar ?? [])
    .filter((e) => e.symbol && e.date)
    .map((e) => ({
      ticker: e.symbol!.toUpperCase(),
      date: e.date!,
      hour: e.hour || "amc",
    }))
    .filter((e) => isLikelyUsCommon(e.ticker));
}

function isLikelyUsCommon(ticker: string): boolean {
  // Skip preferred / foreign listings and overlong symbols
  if (ticker.includes(".") || ticker.includes("-") || ticker.includes("^")) {
    return false;
  }
  return ticker.length >= 1 && ticker.length <= 5;
}

function mockEligibleCalendar(from: Date): EarningsEvent[] {
  const d1 = new Date(from.getTime() + 1 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const d2 = new Date(from.getTime() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return [
    { ticker: "TLRY", date: d1, hour: "bmo" },
    { ticker: "SNDL", date: d2, hour: "amc" },
    { ticker: "CGC", date: d2, hour: "amc" },
    { ticker: "AMC", date: d1, hour: "amc" },
    { ticker: "PLUG", date: d2, hour: "bmo" },
  ];
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R | null>,
): Promise<R[]> {
  const out: R[] = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      const result = await fn(items[idx]!);
      if (result != null) out.push(result);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return out;
}

/** Sub-$5 names with earnings in the next EARNINGS_WINDOW_DAYS. */
export async function listEligiblePins(now = new Date()): Promise<EligiblePin[]> {
  const from = now;
  const to = new Date(now.getTime() + EARNINGS_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const events = await fetchBulkEarningsCalendar(from, to);

  // Earliest earnings per ticker
  const byTicker = new Map<string, EarningsEvent>();
  for (const e of events) {
    const prev = byTicker.get(e.ticker);
    if (!prev || e.date < prev.date) byTicker.set(e.ticker, e);
  }

  const candidates = [...byTicker.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, MAX_SYMBOLS_TO_QUOTE);

  const pins = await mapPool(candidates, QUOTE_CONCURRENCY, async (ev) => {
    try {
      const quote = await fetchQuote(ev.ticker);
      if (!(quote.price > 0 && quote.price < MAX_STOCK_PRICE)) return null;
      const suggest = suggestCoinFields(ev.ticker);
      return {
        ticker: ev.ticker,
        price: quote.price,
        earningsDate: ev.date,
        earningsHour: ev.hour,
        ...suggest,
      } satisfies EligiblePin;
    } catch {
      return null;
    }
  });

  return pins
    .sort((a, b) => a.earningsDate.localeCompare(b.earningsDate) || a.ticker.localeCompare(b.ticker))
    .slice(0, MAX_RESULTS);
}
