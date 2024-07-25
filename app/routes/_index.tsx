import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import LineChart from "../components/LineChart";
import yahooFinance from "yahoo-finance2";

export const meta: MetaFunction = () => {
  return [
    { title: "Bitcoin Charter" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const getTickerData = async ({
  period,
  today,
}: {
  period: string;
  today: Date;
}) => {
  const ticker = "BTC-USD";
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
    period2: today /* ... */,
  };
  const result = await yahooFinance.chart(ticker, queryOptions);
  return result;
};

export const loader = async ({
  request,
}: LoaderFunctionArgs & { query: string }) => {
  // TODO: FIX AND DRY THIS LATER
  // const today = new Date();
  // const DEFAULTPERIOD = "fiveyears";
  // const result = getTickerData({ period: DEFAULTPERIOD, today });
  // return json(result);
  const today = new Date();
  const ticker = "BTC-USD";
  const queryOptions = {
    period1: new Date(
      today.getFullYear() - 1,
      today.getMonth(),
      today.getDate()
    ),
    period2: today /* ... */,
  };
  const result = await yahooFinance.chart(ticker, queryOptions);
  return json(result);
};

export async function action({ request }: ActionFunctionArgs) {
  const today = new Date();
  const { period } = await request.json();
  const updatedData = await getTickerData({ period, today });
  return json(updatedData);
}
// Format the price above to USD using the locale, style, and currency.
let USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Index() {
  const initialData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const quotes = fetcher.data ? fetcher.data.quotes : initialData.quotes;

  // Change
  // Layout

  console.log("fetcher.data ", fetcher.data);
  console.log("quotes[0].close", quotes[0].close);
  const currentQuote = quotes.at(-1);
  const currentClose = currentQuote?.close ?? 0; // need a better solution here, keep for now
  const change = quotes[0].close
    ? (((currentClose - quotes[0].close) / quotes[0].close) * 100).toFixed(2)
    : null;

  const priceArray = quotes.map((quote) => {
    return Number(quote.close);
  });

  priceArray.sort((a, b) => {
    return a - b;
  });

  const high = priceArray.at(-1);
  const low = priceArray[0];

  const handleClickPeriod = ({ period }: { period: string }) => {
    fetcher.submit(
      { period },
      {
        method: "POST",
        encType: "application/json",
      }
    );
  };

  return (
    <div className="font-mono bg-slate-50 m-8 flex flex-col justify-center p-8 rounded-md">
      <div>
        <h1 className="text-3xl ">Bitcoin Price (BTC)</h1>
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

      <div className="flex gap-2">
        <button
          name="period"
          className={`hover:text-cyan-700`}
          onClick={() => handleClickPeriod({ period: "onemonth" })}
        >
          1M
        </button>
        <button
          name="period"
          className={"hover:text-cyan-700"}
          onClick={() => handleClickPeriod({ period: "oneyear" })}
        >
          1Y
        </button>
        <button
          name="period"
          className={"hover:text-cyan-700"}
          onClick={() => handleClickPeriod({ period: "fiveyears" })}
        >
          5Y
        </button>
      </div>
      <LineChart data={quotes} />
    </div>
  );
}
``;
