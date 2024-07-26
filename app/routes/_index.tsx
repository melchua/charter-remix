import { useEffect, useRef, useState } from "react";
import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import LineChart from "../components/LineChart";
import yahooFinance from "yahoo-finance2";
import { USDollar } from "../utils/quoteUtils";

export const meta: MetaFunction = () => {
  return [
    { title: "Charter Remix" },
    { name: "description", content: "Charts stock symbols" },
  ];
};

const DEFAULT_TICKER = "BTC-USD";
const DEFAULT_PERIOD = "oneyear";

const getTickerData = async ({
  period = DEFAULT_PERIOD,
  ticker = DEFAULT_TICKER,
  today,
}: {
  period?: string;
  today: Date;
  ticker: string;
}) => {
  const periodToDate = {
    "24hours": () => {
      return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 1
      );
    },
    oneweek: () => {
      return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 7
      );
    },
    onemonth: () => {
      return new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate()
      );
    },
    oneyear: () => {
      return new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate()
      );
    },
    fiveyears: () => {
      return new Date(
        today.getFullYear() - 5,
        today.getMonth(),
        today.getDate()
      );
    },
  };

  const queryOptions = {
    period1: periodToDate[period as keyof typeof periodToDate](),
    period2: today,
  };

  const result = await yahooFinance.chart(ticker, queryOptions);
  return result;
};

export const loader = async ({
  request,
}: LoaderFunctionArgs & { query: string }) => {
  const today = new Date();
  const ticker = DEFAULT_TICKER;
  const queryOptions = {
    period1: new Date(
      today.getFullYear() - 1,
      today.getMonth(),
      today.getDate()
    ),
    period2: today,
  };
  const result = await yahooFinance.chart(ticker, queryOptions);
  return json(result);
};

export async function action({ request }: ActionFunctionArgs) {
  const today = new Date();
  const formData = await request.formData();
  const ticker = formData.get("ticker");
  const period = formData.get("period");
  try {
    const updatedData = await getTickerData({
      ticker,
      period,
      today,
    });
    return json(updatedData);
  } catch {
    console.log("error");
    // Suppressing errors for this demo
    return null;
  }
}

export default function Index() {
  const initialData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const quotesRaw = fetcher.data ? fetcher.data.quotes : initialData.quotes;

  // We get bad data from the Yahoo scraper sometimes, with null prices
  // for this demo we'll clear those bad dates out
  const quotes = quotesRaw.filter((q) => {
    return q.close !== null;
  });

  const currentQuote = quotes.at(-1);
  const currentClose = currentQuote?.close ?? 0; // need a better solution here, keep for now
  const change = quotes[0].close
    ? (((currentClose - quotes[0].close) / quotes[0].close) * 100).toFixed(2)
    : null;
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD);

  useEffect(() => {
    if (fetcher.state === "submitting") {
      formRef.current?.reset();
      // taskInputRef.current
    }
  }, [fetcher.state]);

  const symbol = fetcher.data
    ? fetcher.data?.meta.symbol
    : initialData.meta.symbol;
  const priceArray = quotes.map((quote) => {
    return Number(quote.close);
  });

  priceArray.sort((a, b) => {
    return a - b;
  });

  const high = priceArray.at(-1);
  const low = priceArray[1];

  return (
    <div className="font-sans bg-slate-50 m-8 flex flex-col justify-center p-8 rounded-md">
      <fetcher.Form method="POST" ref={formRef} className="pb-4">
        <input type="hidden" name="period" value={DEFAULT_PERIOD} />
        <input
          type="text"
          id="ticker"
          name="ticker"
          placeholder="Search for symbols"
          className="bg-slate-200 w-30 mr-3 ml-0 p-1 pl-2 rounded-md"
        />
        <button
          type="submit"
          name="formName"
          value="tickerUpdateForm"
          className="hover:bg-sky-100 hover:rounded-lg hover:scale-125"
        >
          🔎
        </button>
      </fetcher.Form>
      <div>
        <h1 className="text-3xl ">{symbol}</h1>
        <span className="text-2xl pt-1 pr-2">
          {USDollar.format(currentClose)}
        </span>
        <span className={`${change >= 0 ? "text-green-500" : "text-red-500"}`}>
          {change}%
        </span>
      </div>
      <div className="flex justify-end gap-4 mr-7">
        <div className="p-1">
          <header className="text-sm">High</header>
          <div className="text-xs">{USDollar.format(high)}</div>
        </div>
        <div className="p-1">
          <header className="text-sm">Low</header>
          <div className="text-xs">{USDollar.format(low)}</div>
        </div>
      </div>
      <fetcher.Form method="POST">
        <div className="flex gap-2">
          <input type="hidden" name="formName" value={"periodUpdateForm"} />
          <input type="hidden" name="ticker" value={symbol} />
          <button
            type="submit"
            name="period"
            value="onemonth"
            className={`{hover:text-cyan-700}`}
            onClick={() => {
              setSelectedPeriod("onemonth");
            }}
          >
            1M
          </button>

          <button
            name="period"
            value="oneyear"
            className={"hover:text-cyan-700"}
            onClick={() => {
              setSelectedPeriod("oneyear");
            }}
          >
            1Y
          </button>
          <button
            name="period"
            value="fiveyears"
            className={"hover:text-cyan-700"}
            onClick={() => {
              setSelectedPeriod("fiveyears");
            }}
          >
            5Y
          </button>
        </div>
      </fetcher.Form>

      <LineChart data={quotes} />
    </div>
  );
}
