import { NavLink } from "react-router-dom";

// Navigation Item Component
export default function NavItem({ to, icon, text, isOpen }) {
  return (
    <li>
      <NavLink
        to={to}
        className={`flex items-center hover:bg-gray-800 p-2 rounded-md`}
      >
        {icon && <span className="w-5 h-5 ml-3">{icon}</span>}
        {isOpen && <span className="ml-5">{text}</span>}
      </NavLink>
    </li>
  );
}
