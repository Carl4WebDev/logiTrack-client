import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import ReportPage from "./pages/ReportPage";
import ShipmentsPage from "./pages/ShipmentsPage";
import SummaryPage from "./pages/SummaryPage";
import CustomersPage from "./pages/CustomersPage";
import VehiclePage from "./pages/VehiclePage";
import EmployeePage from "./pages/EmployeePage";
import DriverPage from "./pages/DriverPage";
import AuthPage from "./pages/Authpage";
import RoutesPage from "./pages/RoutesPage";
import ProtectedRoute from "../src/components/ProctectedRoute/ProtectedRoute";
import { AuthProvider } from "../src/contexts/AuthContext";
import { CustomersProvider } from "../src/contexts/CustomersProvider";
import { SummaryProvider } from "../src/contexts/SummaryProvider";
import { ShipmentsProvider } from "../src/contexts/ShipmentsProvider";
import { DispatchOutputProvider } from "./contexts/DispatchOutputProvider";
import { DeliveryForwardProvider } from "./contexts/DeliveryForwardProvider ";
import { ItemSnapshotProvider } from "./contexts/ItemSnapshotProvider";
import { ItemActivityLogProvider } from "./contexts/ItemActivityLogProvider";
import Accounts from "./pages/Accounts";
import DispatchOutputPage from "./pages/DispatchOutputPage";
import DeliveryForwardPage from "./pages/DeliveryForwardPage";
import ItemSnapshotPage from "./pages/ItemSnapshotPage";
import ItemActivityLogPage from "./pages/ItemActivityLogPage";

// Layout for authenticated routes
const MainLayout = () => {
  return (
    <div className="w-full h-screen">
      <Header />
      <div className="grid grid-cols-12">
        <div className="hidden md:block md:col-span-2 z-50">
          <Sidebar />
        </div>
        <div className="col-span-12 md:col-span-10">
          <main className="h-full mt-24 flex justify-start m-2 z-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<Navigate to="/auth" replace />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Available to all authenticated users */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Admin-only routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/report" element={<ReportPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/vehicle" element={<VehiclePage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/employee" element={<EmployeePage />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/dispatch-output" element={<DispatchOutputPage />} />
            <Route
              path="/delivery-forwards"
              element={<DeliveryForwardPage />}
            />
            <Route path="/item-snapshot" element={<ItemSnapshotPage />} />
            <Route
              path="/item-activity-logs"
              element={<ItemActivityLogPage />}
            />
          </Route>

          {/* Admin & Coordinator routes */}
          <Route
            element={<ProtectedRoute allowedRoles={["admin", "coordinator"]} />}
          >
            <Route path="/shipments" element={<ShipmentsPage />} />
            <Route path="/summary" element={<SummaryPage />} />
          </Route>

          {/* Admin & Driver routes */}
          <Route
            element={<ProtectedRoute allowedRoles={["admin", "driver"]} />}
          >
            <Route path="/driver" element={<DriverPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <AuthProvider>
        <CustomersProvider>
          <ShipmentsProvider>
            <SummaryProvider>
              <DispatchOutputProvider>
                <DeliveryForwardProvider>
                  <ItemSnapshotProvider>
                    <ItemActivityLogProvider>
                      <App />
                    </ItemActivityLogProvider>
                  </ItemSnapshotProvider>
                </DeliveryForwardProvider>
              </DispatchOutputProvider>
            </SummaryProvider>
          </ShipmentsProvider>
        </CustomersProvider>
      </AuthProvider>
    </Router>
  );
}
