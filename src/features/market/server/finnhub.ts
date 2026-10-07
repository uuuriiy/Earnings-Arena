export type Quote = {
  ticker: string;
  price: number;
  changePct: number;
  asOf: string;
  source: "finnhub" | "mock";
};

export type EarningsEvent = {
  ticker: string;
  date: string;
  hour: string;
};

type FinnhubQuoteResponse = {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
};

function apiKey(): string | undefined {
  return process.env.FINNHUB_API_KEY || undefined;
}

export async function fetchQuote(ticker: string): Promise<Quote> {
  const key = apiKey();
  const symbol = ticker.toUpperCase();

  if (!key) {
    return mockQuote(symbol);
  }

  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) {
    throw new Error(`Finnhub quote failed: ${res.status}`);
  }
  const data = (await res.json()) as FinnhubQuoteResponse;
  if (!data.c || data.c <= 0) {
    throw new Error(`No quote for ${symbol}`);
  }

  return {
    ticker: symbol,
    price: data.c,
    changePct: data.dp ?? 0,
    asOf: new Date((data.t || Date.now() / 1000) * 1000).toISOString(),
    source: "finnhub",
  };
}

export async function fetchUpcomingEarnings(
  ticker: string,
  from: Date,
  to: Date,
): Promise<EarningsEvent[]> {
  const key = apiKey();
  const symbol = ticker.toUpperCase();

  if (!key) {
    return mockEarnings(symbol, from);
  }

  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);
  const url = `https://finnhub.io/api/v1/calendar/earnings?from=${fromStr}&to=${toStr}&symbol=${encodeURIComponent(symbol)}&token=${key}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error(`Finnhub earnings failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    earningsCalendar?: Array<{ symbol: string; date: string; hour: string }>;
  };

  return (data.earningsCalendar ?? [])
    .filter((e) => e.symbol?.toUpperCase() === symbol)
    .map((e) => ({ ticker: symbol, date: e.date, hour: e.hour || "amc" }));
}

export function earningsDateToDateTime(date: string, hour: string): Date {
  const base = new Date(`${date}T00:00:00Z`);
  if (hour === "bmo") {
    base.setUTCHours(13, 30, 0, 0);
  } else {
    base.setUTCHours(21, 0, 0, 0);
  }
  return base;
}

function mockQuote(ticker: string): Quote {
  const seed = [...ticker].reduce((a, c) => a + c.charCodeAt(0), 0);
  const price = 1 + (seed % 350) / 100;
  const changePct = ((seed % 21) - 10) / 2;
  return {
    ticker,
    price: Number(price.toFixed(2)),
    changePct,
    asOf: new Date().toISOString(),
    source: "mock",
  };
}

function mockEarnings(ticker: string, from: Date): EarningsEvent[] {
  const d = new Date(from.getTime() + 5 * 24 * 60 * 60 * 1000);
  return [
    {
      ticker,
      date: d.toISOString().slice(0, 10),
      hour: "amc",
    },
  ];
}

/** In-memory price overrides for local settlement simulation */
const snapshotOverrides = new Map<string, number>();

export function setMockSnapshotPrice(ticker: string, price: number) {
  snapshotOverrides.set(ticker.toUpperCase(), price);
}

export function clearMockSnapshotPrices() {
  snapshotOverrides.clear();
}

export async function snapshotPrice(ticker: string): Promise<number | null> {
  const override = snapshotOverrides.get(ticker.toUpperCase());
  if (override != null) return override;
  try {
    const q = await fetchQuote(ticker);
    return q.price;
  } catch {
    return null;
  }
}
