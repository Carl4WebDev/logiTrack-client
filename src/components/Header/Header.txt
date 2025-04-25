import React, { useState } from "react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md fixed top-0 z-50 w-full" >
      <div className="container flex justify-between items-center">
        <div className="text-2xl font-bold">LogiTrack</div>

        <nav className="hidden md:flex space-x-6 items-center">
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="hover:text-red-400 flex items-center gap-1"
            >
              Services
              <span>{isDropdownOpen ? "▲" : "▼"}</span>
            </button>
            {isDropdownOpen && (
              <ul className="absolute bg-gray-700 p-2 rounded shadow-lg mt-2 w-40">
                <li className="py-1 hover:bg-gray-600 px-2 rounded">
                  <a href="#">Order Management</a>
                </li>
                <li className="py-1 hover:bg-gray-600 px-2 rounded">
                  <a href="#">Fleet Tracking</a>
                </li>
                <li className="py-1 hover:bg-gray-600 px-2 rounded">
                  <a href="#">Analytics</a>
                </li>
              </ul>
            )}
          </div>
          <a href="#" className="hover:text-red-400">About</a>
          <a href="#" className="hover:text-red-400">Contact</a>
        </nav>

        <div className="hidden md:flex gap-4">
          <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md">Login</button>
          <button className="border border-red-500 hover:bg-red-500 px-4 py-2 rounded-md">Sign Up</button>
        </div>

        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-700 p-4 space-y-3">
          <div>
            <button
              onClick={toggleDropdown}
              className="w-full text-left hover:text-red-400 flex justify-between"
            >
              Services
              <span>{isDropdownOpen ? "▲" : "▼"}</span>
            </button>
            {isDropdownOpen && (
              <ul className="mt-2 space-y-2 pl-4">
                <li className="hover:text-red-400">
                  <a href="#">Order Management</a>
                </li>
                <li className="hover:text-red-400">
                  <a href="#">Fleet Tracking</a>
                </li>
                <li className="hover:text-red-400">
                  <a href="#">Analytics</a>
                </li>
              </ul>
            )}
          </div>
          <a href="#" className="block hover:text-red-400">About</a>
          <a href="#" className="block hover:text-red-400">Contact</a>
          <div className="space-y-2">
            <button className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-md">Login</button>
            <button className="w-full border border-red-500 hover:bg-red-500 py-2 rounded-md">Sign Up</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
