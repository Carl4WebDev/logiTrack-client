import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "January", orders: 400, deliveries: 240 },
  { name: "February", orders: 300, deliveries: 200 },
  { name: "March", orders: 350, deliveries: 280 },
  { name: "April", orders: 500, deliveries: 400 },
];

const ReportChart = () => {
  return (
    <div className=" p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Orders & Deliveries Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="orders" fill="#8884d8" />
          <Bar dataKey="deliveries" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReportChart;
