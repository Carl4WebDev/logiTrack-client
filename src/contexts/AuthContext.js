import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [role, setRole] = useState(() => {
    const storedRole = localStorage.getItem("role");
    return storedRole ? JSON.parse(storedRole) : null;
  });

  const [usersData, setUsersData] = useState([]);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/users"); // Your API endpoint
        const data = await response.json();
        setUsersData(data);
      } catch (err) {
        console.error("Failed to load shipments:", err);
      }
    };

    fetchShipments();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", JSON.stringify(user.role));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.user);
      setRole(data.user.role);
      return data.user;
    } catch (err) {
      console.error("Login error:", err);
      throw new Error(err.message || "Invalid email or password");
    }
  };

  const register = async (newUser) => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      setUsersData((prevUsers) => [...prevUsers, data.user]); // Add this line
      setUser(data.user);
      setRole(data.user.role);
      return data.user;
    } catch (err) {
      console.error("Registration error:", err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
  };

  // In your AuthContext.js
  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/users/secrets/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            // Removed Authorization header
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      setUsersData((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Role update failed:", err);
      throw err;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/users/secrets/${userId}`,
        {
          method: "DELETE",
          // Removed Authorization header
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsersData((prevUsers) => prevUsers.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Deletion failed:", err);
      throw err;
    }
  };
  return (
    <AuthContext.Provider
      value={{
        usersData,
        user,
        role,
        login,
        register,
        logout,
        updateUserRole,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
