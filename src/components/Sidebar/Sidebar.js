import { useState, useEffect } from "react";
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
import NavItem from "./NavItem";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [logisticsOpen, setLogisticsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [userOpen, setUserOpen] = useState(false);
  const { user } = useAuth(); // Get the current user's role

  // Detect screen size change
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hide sidebar on mobile
  if (isMobile) return null;

  return (
    <div className="flex mt-20">
      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "w-64" : "w-16"
        } bg-gray-950  h-auto text-white transition-all duration-300 ease-in-out fixed p-2 `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 h-16 flex-shrink-0 ">
          <h1 className={`text-2xl font-bold ${!isOpen && "hidden"}`}>
            Categories
          </h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 focus:outline-none"
          >
            {isOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 overflow-y-auto flex-1">
          <ul className="space-y-2">
            {/* Dashboard */}
            <NavItem
              to="/dashboard"
              icon={<Home />}
              text="Dashboard"
              isOpen={isOpen}
            />

            {/* Logistic Management Dropdown */}
            {(user?.role === "admin" || user?.role === "coordinator") && (
              <li>
                <div
                  className={`flex items-center justify-between hover:bg-gray-800 p-2 rounded-md`}
                  onClick={() => setLogisticsOpen(!logisticsOpen)}
                >
                  <div className="flex items-center">
                    <Warehouse className="w-5 h-5 ml-3" />
                    {isOpen && (
                      <span className="ml-2">Logistic Management</span>
                    )}
                  </div>
                  {isOpen &&
                    (logisticsOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    ))}
                </div>

                {logisticsOpen && (
                  <ul className="ml-2 space-y-1">
                    {(user?.role === "admin" ||
                      user?.role === "coordinator") && (
                      <NavItem
                        to="/summary"
                        icon={<Folder className="w-4 h-4" />}
                        text="Summary"
                        isOpen={isOpen}
                      />
                    )}
                    {(user?.role === "admin" ||
                      user?.role === "coordinator") && (
                      <NavItem
                        to="/shipments"
                        icon={<Package className="w-4 h-4" />}
                        text="Shipments"
                        isOpen={isOpen}
                      />
                    )}
                    {user?.role === "admin" && (
                      <NavItem
                        to="/customers"
                        icon={<UserCheck className="w-4 h-4" />}
                        text="Customers"
                        isOpen={isOpen}
                      />
                    )}
                    {user?.role === "admin" && (
                      <NavItem
                        to="/dispatch-output"
                        icon={<ArrowBigRightDash className="w-4 h-4" />}
                        text="Dispatch Output"
                        isOpen={isOpen}
                      />
                    )}
                    {user?.role === "admin" && (
                      <NavItem
                        to="/delivery-forwards"
                        icon={<Clock className="w-4 h-4" />}
                        text="Delivery Forwards"
                        isOpen={isOpen}
                      />
                    )}
                    {user?.role === "admin" && (
                      <NavItem
                        to="/item-snapshot"
                        icon={<Camera className="w-4 h-4" />}
                        text="Item Snapshot"
                        isOpen={isOpen}
                      />
                    )}
                    {user?.role === "admin" && (
                      <NavItem
                        to="/item-activity-logs"
                        icon={<History className="w-4 h-4" />}
                        text="Item Activity Logs"
                        isOpen={isOpen}
                      />
                    )}
                    {user?.role === "admin" && (
                      <NavItem
                        to="/vehicle"
                        icon={<TruckIcon className="w-4 h-4" />}
                        text="Vehicle"
                        isOpen={isOpen}
                      />
                    )}
                    {user?.role === "admin" && (
                      <NavItem
                        to="/routes"
                        icon={<LocateIcon className="w-4 h-4" />}
                        text="Routes"
                        isOpen={isOpen}
                      />
                    )}
                    {user?.role === "admin" && (
                      <NavItem
                        to="/report"
                        icon={<ClipboardList className="w-4 h-4" />}
                        text="Report"
                        isOpen={isOpen}
                      />
                    )}
                  </ul>
                )}
              </li>
            )}

            {/* User Management Dropdown */}
            {user?.role === "admin" && (
              <li>
                <div
                  className={`flex items-center justify-between hover:bg-gray-800 p-2 rounded-md`}
                  onClick={() => setUserOpen(!userOpen)}
                >
                  <div className="flex items-center">
                    <User2Icon className="w-5 h-5 ml-3" />
                    {isOpen && <span className="ml-2">User Management</span>}
                  </div>
                  {isOpen &&
                    (userOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    ))}
                </div>

                {userOpen && (
                  <ul className="space-y-1 ml-2">
                    <NavItem
                      to="/accounts"
                      icon={<Users2Icon className="w-4 h-4" />}
                      text="Accounts"
                      isOpen={isOpen}
                    />
                    <NavItem
                      to="/driver"
                      icon={<IdCard className="w-4 h-4" />}
                      text="Driver"
                      isOpen={isOpen}
                    />
                  </ul>
                )}
              </li>
            )}

            {/* Driver Page */}
            {user?.role === "driver" && (
              <NavItem
                to="/driver"
                icon={<IdCard />}
                text="Driver Page"
                isOpen={isOpen}
              />
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
}
