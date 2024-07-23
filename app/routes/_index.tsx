import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import LineChart from "../components/LineChart";
import yahooFinance from "yahoo-finance2";

export const meta: MetaFunction = () => {
  return [
    { title: "Bitcoin Charter" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async () => {
  const query = "BTC-USD";
  const queryOptions = { period1: "2021-05-08" /* ... */ };
  const result = await yahooFinance.chart(query, queryOptions);

  return json(result);
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  console.log("data", data);
  const quotes = data?.quotes;
  return (
    <div className="font-mono p-4">
      <h1>BIT-COIN USD</h1>
      <LineChart data={quotes} />
    </div>
  );
}
