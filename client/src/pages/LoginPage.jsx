import { useState } from "react";
import api from "../lib/api";

const DEMO_ACCOUNTS = [
  { label: "HR", username: "hr_acme", company: "Acme Corporation" },
  { label: "HR", username: "hr_globex", company: "Globex Industries" },
  { label: "Vendor", username: "vendor_healthplus", company: "HealthPlus Pte Ltd" },
  { label: "Vendor", username: "vendor_wellcare", company: "WellCare Solutions" },
  { label: "Vendor", username: "vendor_fitlife", company: "FitLife Wellness" },
];

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Wellness Event Booking</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="e.g. hr_acme"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={styles.demoBox}>
          <p style={styles.demoTitle}>Demo Accounts:</p>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.username}
              type="button"
              style={styles.demoBtn}
              onClick={() => {
                setUsername(account.username);
                setPassword("password123");
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
              }}
            >
              <span
                style={{
                  ...styles.demoBtnRole,
                  background: account.label === "HR" ? "#dbeafe" : "#f0fdf4",
                  color: account.label === "HR" ? "#1d4ed8" : "#15803d",
                }}
              >
                {account.label}
              </span>
              {account.company}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 8px 0",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 32px 0",
    textAlign: "center",
  },
  error: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    textAlign: "center",
  },
  field: { marginBottom: "20px" },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
  demoBox: {
    marginTop: "24px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  demoTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    margin: "0 0 8px 0",
  },
  demoBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 10px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "13px",
    color: "#334155",
    cursor: "pointer",
    marginTop: "6px",
    textAlign: "left",
    transition: "background 0.15s",
  },
  demoBtnRole: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "4px",
    flexShrink: 0,
  },
};
