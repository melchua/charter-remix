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

  const currentQuote = quotes.at(-1);
  const currentClose = currentQuote?.close ?? 0; // need a better solution here, keep for now
  const currentOpen = currentQuote?.open ?? 0;
  const change = (((currentClose - currentOpen) / currentOpen) * 100).toFixed(
    2
  );
  const high = currentQuote?.high || 0;
  const low = currentQuote?.low || 0;

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
    <div className="font-mono p-4">
      <h1>BIT-COIN USD</h1>
      <h2>{USDollar.format(currentClose)}</h2>
      <p>{change}%</p>
      <div>
        <div>High</div>
        <div>{USDollar.format(high)}</div>
        <div>Low</div>
        <div>{USDollar.format(low)}</div>
      </div>
      <div>
        <button
          name="period"
          className={"text-cyan-700 hover:text-cyan-400"}
          onClick={() => handleClickPeriod({ period: "24hours" })}
        >
          24H
        </button>
        <button
          name="period"
          className={"text-cyan-700 hover:text-cyan-400"}
          onClick={() => handleClickPeriod({ period: "oneweek" })}
        >
          1W
        </button>
        <button
          name="period"
          className={"text-cyan-700 hover:text-cyan-400"}
          onClick={() => handleClickPeriod({ period: "onemonth" })}
        >
          1M
        </button>
        <button
          name="period"
          className={"text-cyan-700 hover:text-cyan-400"}
          onClick={() => handleClickPeriod({ period: "oneyear" })}
        >
          1Y
        </button>
        <button
          name="period"
          className={"text-cyan-700 hover:text-cyan-400"}
          onClick={() => handleClickPeriod({ period: "fiveyears" })}
        >
          5Y
        </button>
      </div>
      <LineChart data={quotes} />
    </div>
  );
}
