import { useEffect } from "react";
import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { json } from "@remix-run/node";
import LineChart from "../components/LineChart";
import yahooFinance from "yahoo-finance2";

export const meta: MetaFunction = () => {
  return [
    { title: "Bitcoin Charter" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({
  request,
}: LoaderFunctionArgs & { query: string }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const today = new Date();

  console.log("query", query); // could use this to get the ticker

  const ticker = "BTC-USD";
  const queryOptions = {
    period1: new Date(
      today.getFullYear() - 5,
      today.getMonth(),
      today.getDate()
    ),
    period2: today /* ... */,
  };
  const result = await yahooFinance.chart(ticker, queryOptions);

  return json(result);
};

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  console.log("whaaa", body);
  const period = body.get("period");
  // return json({ message: `Hello, ${name}` });
  return json({ period });
}
// Format the price above to USD using the locale, style, and currency.
let USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  // console.log("data", data);
  const quotes = data?.quotes;

  const currentQuote = quotes.at(-1);
  const currentClose = currentQuote?.close ?? 0; // need a better solution here, keep for now
  const currentOpen = currentQuote?.open ?? 0;
  const change = (((currentClose - currentOpen) / currentOpen) * 100).toFixed(
    2
  );
  const high = currentQuote?.high || 0;
  const low = currentQuote?.low || 0;

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
        <Form id="whatever" method="post">
          <button
            type="submit"
            name="period"
            className={"text-cyan-700 hover:text-cyan-400"}
            value="yearly"
          >
            1Y
          </button>
          <button
            name="period"
            className={"text-cyan-700 hover:text-cyan-400"}
            value="fiveyear"
          >
            5Y
          </button>
        </Form>
      </div>
      <LineChart data={quotes} />
    </div>
  );
}
