import type { MetaFunction } from "@remix-run/node";
import LineChart from "../components/LineChart";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="font-sans p-4">
      <h1>BIT-COIN USD</h1>
      <LineChart />
    </div>
  );
}
