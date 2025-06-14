import { useState, useEffect } from "react";
import NavItem from "../Sidebar/NavItem";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logiTrack from "../../assets/images/logiTrack-bg.jpg";

import { NavLink } from "react-router-dom";

import {
  Menu,
  X,
  Home,
  Truck,
  BarChart2,
  TruckIcon,
  Package,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  User2Icon,
  Warehouse,
  Users2Icon,
  Folder,
  IdCard,
  UserCheck,
  LocateIcon,
  ArrowBigRightDash,
  Clock,
  Camera,
  History,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth(); // Get user and logout function from AuthContext
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to login page
  };

  // State for mobile menu and dropdowns
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [logisticsOpen, setLogisticsOpen] = useState(false);

  // Detect screen size change
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="bg-gray-950 text-white p-6 flex justify-between items-center fixed w-full z-30 top-0">
      {/* Left Side: Logo */}
      <div>
        <NavLink
          to={"/dashboard"}
          className="font-bold flex ml-2 items-center justify-between"
        >
          <img
            src={logiTrack}
            width={"50px"}
            height={"50px"}
            className="rounded-full"
            alt="LogiTrack Logo"
          />
          <h1 className="ml-2 text-2xl">Logistics System</h1>
        </NavLink>
      </div>

      {/* Greeting and Logout Button (Visible when user is logged in and not on mobile) */}
      {user && !isMobile && (
        <div className="flex items-center gap-4">
          {/* Greeting */}
          <span className="text-lg">Hi, {user?.fullName || "User"}!</span>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      )}

      {/* Mobile Menu Button (Visible only on mobile) */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 focus:outline-none"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Mobile Sidebar (Visible only on mobile when menu is open) */}
      {isMobile && menuOpen && (
        <div className="absolute top-24 left-0 w-64 bg-gray-900 h-screen p-4 text-white">
          {/* Greeting and Logout Button inside Mobile Sidebar */}
          {user && (
            <div className="flex  items-center gap-4 mb-4">
              {/* Greeting */}
              <span className="text-lg">Hi, {user?.fullName || "User"}!</span>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded"
              >
                Logout
              </button>
            </div>
          )}

          <nav className="mt-4">
            <h1 className="text-2xl">Categories</h1>
            <hr />
            <ul className="space-y-2">
              {/* Dashboard Link (Visible to all roles) */}
              <NavItem
                to="/dashboard"
                icon={<Home />}
                text="Dashboard"
                isOpen={true}
              />

              {/* Logistic Management Dropdown (Visible to admin and coordinator) */}
              {(user?.role === "admin" || user?.role === "coordinator") && (
                <li>
                  <div
                    className={`flex items-center justify-between hover:bg-gray-800 p-2 rounded-md`}
                    onClick={() => setLogisticsOpen(!logisticsOpen)}
                  >
                    <div className="flex items-center">
                      <Warehouse className="w-5 h-5 ml-3" />
                      <span className="ml-2">Logistic Management</span>
                    </div>
                    {logisticsOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>

                  {/* Logistic Management Submenu */}
                  {logisticsOpen && (
                    <ul className="ml-2 space-y-1">
                      {/* Summary (Visible to admin and coordinator) */}
                      {(user?.role === "admin" ||
                        user?.role === "coordinator") && (
                        <NavItem
                          to="/summary"
                          icon={<Folder className="w-4 h-4" />}
                          text="Summary"
                          isOpen={true}
                        />
                      )}

                      {/* Shipments (Visible to admin and coordinator) */}
                      {(user?.role === "admin" ||
                        user?.role === "coordinator") && (
                        <NavItem
                          to="/shipments"
                          icon={<Package className="w-4 h-4" />}
                          text="Shipments"
                          isOpen={true}
                        />
                      )}

                      {/* Customers (Visible only to admin) */}
                      {user?.role === "admin" && (
                        <NavItem
                          to="/customers"
                          icon={<UserCheck className="w-4 h-4" />}
                          text="Customers"
                          isOpen={true}
                        />
                      )}

                      {user?.role === "admin" && (
                        <NavItem
                          to="/dispatch-output"
                          icon={<ArrowBigRightDash className="w-4 h-4" />}
                          text="Dispatch Output"
                          isOpen={true}
                        />
                      )}
                      {user?.role === "admin" && (
                        <NavItem
                          to="/delivery-forwards"
                          icon={<Clock className="w-4 h-4" />}
                          text="Delivery Forwards"
                          isOpen={true}
                        />
                      )}
                      {user?.role === "admin" && (
                        <NavItem
                          to="/item-snapshot"
                          icon={<Camera className="w-4 h-4" />}
                          text="Item Snapshot"
                          isOpen={true}
                        />
                      )}
                      {user?.role === "admin" && (
                        <NavItem
                          to="/item-activity-logs"
                          icon={<History className="w-4 h-4" />}
                          text="Item Activity Logs"
                          isOpen={true}
                        />
                      )}
                      {/* Vehicle (Visible only to admin) */}
                      {user?.role === "admin" && (
                        <NavItem
                          to="/vehicle"
                          icon={<TruckIcon className="w-4 h-4" />}
                          text="Vehicle"
                          isOpen={true}
                        />
                      )}
                      {user?.role === "admin" && (
                        <NavItem
                          to="/routes"
                          icon={<LocateIcon className="w-4 h-4" />}
                          text="Routes"
                          isOpen={true}
                        />
                      )}

                      {/* Report (Visible only to admin) */}
                      {user?.role === "admin" && (
                        <NavItem
                          to="/report"
                          icon={<ClipboardList className="w-4 h-4" />}
                          text="Report"
                          isOpen={true}
                        />
                      )}
                    </ul>
                  )}
                </li>
              )}

              {/* User Management Dropdown (Visible only to admin) */}
              {user?.role === "admin" && (
                <li>
                  <div
                    className={`flex items-center justify-between hover:bg-gray-800 p-2 rounded-md`}
                    onClick={() => setUserOpen(!userOpen)}
                  >
                    <div className="flex items-center">
                      <User2Icon className="w-5 h-5 ml-3" />
                      <span className="ml-2">User Management</span>
                    </div>
                    {userOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>

                  {/* User Management Submenu */}
                  {userOpen && (
                    <ul className="space-y-1 ml-2">
                      <NavItem
                        to="/employee"
                        icon={<Users2Icon className="w-4 h-4" />}
                        text="Employee"
                        isOpen={true}
                      />
                      <NavItem
                        to="/driver"
                        icon={<IdCard className="w-4 h-4" />}
                        text="Driver"
                        isOpen={true}
                      />
                    </ul>
                  )}
                </li>
              )}

              {/* Driver Page (Visible only to driver) */}
              {user?.role === "driver" && (
                <NavItem
                  to="/driver"
                  icon={<IdCard />}
                  text="Driver Page"
                  isOpen={true}
                />
              )}
            </ul>
          </nav>
        </div>
      )}
    </nav>
  );
}
