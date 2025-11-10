import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Simple Login Component
const Login = ({ onLogin }) => {
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id === "Admin" && pass === "123") {
      onLogin();
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "100px auto", padding: "20px" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ID:</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ width: "100%" }}>Login</button>
      </form>
    </div>
  );
};

// Private Route Component
const PrivateRoute = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Use local state for simplicity; in production, use context or auth lib

  // Note: In a real app, persist login state (e.g., localStorage, tokens)
  // Here, login is session-only and resets on refresh

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Global app state for login

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Index />
                </PrivateRoute>
              }
            />
            <Route
              path="/login"
              element={<Login onLogin={handleLogin} />}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
