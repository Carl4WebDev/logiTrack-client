import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useShipmentsContext } from "../contexts/ShipmentsProvider";
import { useCustomersContext } from "../contexts/CustomersProvider";
import { useSummaryContext } from "../contexts/SummaryProvider";
import { useDispatchOutputContext } from "../contexts/DispatchOutputProvider";
import { useDeliveryForwardContext } from "../contexts/DeliveryForwardProvider ";
import { useItemSnapshotContext } from "../contexts/ItemSnapshotProvider";
import { useItemActivityLogContext } from "../contexts/ItemActivityLogProvider";

const ReportChart = ({ data }) => {
  return (
    <div className="p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Operations Overview</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#8884d8" name="Total Items" />
          <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
          <Bar dataKey="incomplete" fill="#ffc658" name="Incomplete" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const DashboardPage = () => {
  const { shipmentsData } = useShipmentsContext();
  const { customersData } = useCustomersContext();
  const { summaryData } = useSummaryContext();
  const { dispatchOutputData } = useDispatchOutputContext();
  const { deliveryForwardData } = useDeliveryForwardContext();
  const { itemSnapshotsData } = useItemSnapshotContext();
  const { itemActivityLogData } = useItemActivityLogContext();

  // Prepare comprehensive chart data including all contexts
  const chartData = [
    {
      name: "Customers",
      total: customersData?.length || 0,
      incomplete:
        customersData?.filter((s) => s.status === "incomplete").length || 0,
      completed:
        customersData?.filter((c) => c.status === "completed").length || 0,
    },
    {
      name: "Shipments",
      total: shipmentsData?.length || 0,
      completed:
        shipmentsData?.filter((s) => s.status === "completed").length || 0,
      incomplete:
        shipmentsData?.filter((s) => s.status === "incomplete").length || 0,
    },
    {
      name: "Dispatches",
      total: dispatchOutputData?.length || 0,
      incomplete:
        dispatchOutputData?.filter((d) => d.status === "incomplete").length ||
        0,
      completed:
        dispatchOutputData?.filter((d) => d.status === "completed").length || 0,
    },
    {
      name: "Deliveries",
      total: deliveryForwardData?.length || 0,
      incomplete:
        deliveryForwardData?.filter((d) => d.status === "incomplete").length ||
        0,
      completed:
        deliveryForwardData?.filter((d) => d.status === "completed").length ||
        0,
    },
    {
      name: "Inventory",
      total: itemSnapshotsData?.length || 0,
      incomplete:
        itemSnapshotsData?.filter((d) => d.status === "incomplete").length || 0,
      completed:
        itemSnapshotsData?.filter((d) => d.status === "completed").length || 0,
    },
    {
      name: "Activities",
      total: itemActivityLogData?.length || 0,
      incomplete:
        itemActivityLogData?.filter((d) => d.status === "incomplete").length ||
        0,
      completed:
        itemActivityLogData?.filter((d) => d.status === "completed").length ||
        0,
    },
    {
      name: "Summary",
      // Using summary data if available
      total: summaryData?.length || 0,
      incomplete:
        summaryData?.filter((d) => d.status === "incomplete").length || 0,
      completed:
        summaryData?.filter((d) => d.status === "completed").length || 0,
    },
  ];

  // Calculate metrics for dashboard cards - now aligned with chart data
  const totalCustomers = customersData?.length || 0;
  const incompleteShipments =
    shipmentsData?.filter((s) => s.status === "incomplete").length || 0;
  const completedShipments =
    shipmentsData?.filter((s) => s.status === "completed").length || 0;
  const incompleteDispatches =
    dispatchOutputData?.filter((d) => d.status === "incomplete").length || 0;
  const completedDispatches =
    dispatchOutputData?.filter((d) => d.status === "completed").length || 0;
  const incompleteDeliveries =
    deliveryForwardData?.filter((d) => d.status === "incomplete").length || 0;
  const completedDeliveries =
    deliveryForwardData?.filter((d) => d.status === "completed").length || 0;
  const incompleteInventory =
    itemSnapshotsData?.filter((d) => d.status === "incomplete").length || 0;
  const completedInventory =
    itemSnapshotsData?.filter((d) => d.status === "completed").length || 0;
  const incompleteActivities =
    itemActivityLogData?.filter((d) => d.status === "incomplete").length || 0;
  const completedActivities =
    itemActivityLogData?.filter((d) => d.status === "completed").length || 0;
  const incompleteSummary =
    summaryData?.filter((d) => d.status === "incomplete").length || 0;
  const completedSummary =
    summaryData?.filter((d) => d.status === "completed").length || 0;

  // Add these to your existing metrics calculations
  const totalShipments = shipmentsData?.length || 0;
  const totalDispatches = dispatchOutputData?.length || 0;
  const totalDeliveries = deliveryForwardData?.length || 0;
  const totalInventory = itemSnapshotsData?.length || 0;
  const totalActivities = itemActivityLogData?.length || 0;
  const incompleteCustomers =
    customersData?.filter((c) => c.status === "incomplete").length || 0;
  // Recent activities (unchanged as it's a different metric)
  const recentActivities = itemActivityLogData?.slice(0, 5).length || 0;

  return (
    <div className="flex flex-col min-w-full align-middle text-white">
      <div className="w-full">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-white">
            <div className="rounded-2xl shadow-white p-6">
              <h3 className="text-lg font-semibold">Total Customers</h3>
              <p className="text-3xl font-bold">{totalCustomers}</p>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-green-400">
                  Active: {totalCustomers - incompleteCustomers}
                </span>
                <span className="text-yellow-400">
                  Incomplete: {incompleteCustomers}
                </span>
              </div>
            </div>

            <div className="rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold">Shipments</h3>
              <p className="text-3xl font-bold">{totalShipments}</p>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-green-400">
                  Completed: {completedShipments}
                </span>
                <span className="text-yellow-400">
                  Incomplete: {incompleteShipments}
                </span>
              </div>
            </div>

            <div className="rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold">Dispatches</h3>
              <p className="text-3xl font-bold">{totalDispatches}</p>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-green-400">
                  Completed: {completedDispatches}
                </span>
                <span className="text-yellow-400">
                  Incomplete: {incompleteDispatches}
                </span>
              </div>
            </div>

            <div className="rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold">Deliveries</h3>
              <p className="text-3xl font-bold">{totalDeliveries}</p>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-green-400">
                  Completed: {completedDeliveries}
                </span>
                <span className="text-yellow-400">
                  Incomplete: {incompleteDeliveries}
                </span>
              </div>
            </div>

            <div className="rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold">Inventory</h3>
              <p className="text-3xl font-bold">{totalInventory}</p>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-green-400">
                  Complete: {completedInventory}
                </span>
                <span className="text-yellow-400">
                  Incomplete: {incompleteInventory}
                </span>
              </div>
            </div>

            <div className="rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold">Activities</h3>
              <p className="text-3xl font-bold">{totalActivities}</p>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-green-400">
                  Completed: {completedActivities}
                </span>
                <span className="text-yellow-400">
                  Incomplete: {incompleteActivities}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
      <ReportChart data={chartData} />
    </div>
  );
};

export default DashboardPage;
