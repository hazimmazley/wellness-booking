import { useState, useEffect } from "react";
import api from "../lib/api";

export default function CreateEventModal({ onClose, onCreate }) {
  const [eventTypes, setEventTypes] = useState([]);
  const [eventTypeId, setEventTypeId] = useState("");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [date3, setDate3] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [streetName, setStreetName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEventTypes() {
      try {
        const { data } = await api.get("/event-types");
        setEventTypes(data);
      } catch (err) {
        setError("Failed to load event types");
      } finally {
        setLoadingTypes(false);
      }
    }
    fetchEventTypes();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!eventTypeId) {
      setError("Please select an event type");
      return;
    }
    if (!date1 || !date2 || !date3) {
      setError("Please select all 3 proposed dates");
      return;
    }
    if (date1 === date2 || date1 === date3 || date2 === date3) {
      setError("All 3 proposed dates must be different");
      return;
    }
    if (!/^\d{5}$/.test(postalCode.trim())) {
      setError("Postal code must be exactly 5 digits");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/events", {
        eventTypeId,
        proposedDates: [
          new Date(date1).toISOString(),
          new Date(date2).toISOString(),
          new Date(date3).toISOString(),
        ],
        location: {
          postalCode: postalCode.trim(),
          streetName: streetName.trim(),
        },
      });
      onCreate(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Create Wellness Event</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.modalBody}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.field}>
            <label style={styles.label}>Event Type *</label>
            {loadingTypes ? (
              <p style={{ fontSize: "14px", color: "#94a3b8" }}>Loading...</p>
            ) : (
              <select
                value={eventTypeId}
                onChange={(e) => setEventTypeId(e.target.value)}
                style={styles.select}
                required
              >
                <option value="">Select an event type</option>
                {eventTypes.map((et) => (
                  <option key={et._id} value={et._id}>
                    {et.name} — {et.vendor?.companyName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Proposed Date 1 *</label>
            <input
              type="date"
              value={date1}
              min={today}
              onChange={(e) => setDate1(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Proposed Date 2 *</label>
            <input
              type="date"
              value={date2}
              min={today}
              onChange={(e) => setDate2(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Proposed Date 3 *</label>
            <input
              type="date"
              value={date3}
              min={today}
              onChange={(e) => setDate3(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Postal Code *</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
              style={styles.input}
              placeholder="e.g. 50000"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Street Name (optional)</label>
            <textarea
              value={streetName}
              onChange={(e) => setStreetName(e.target.value)}
              style={{ ...styles.input, resize: "vertical", minHeight: "60px" }}
              placeholder="e.g. 1 Jalan Bukit Bintang"
              rows={3}
              maxLength={200}
            />
          </div>

          <div style={styles.formActions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    background: "#fff",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "520px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#94a3b8",
    padding: "4px 8px",
  },
  modalBody: { padding: "24px" },
  error: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "13px",
  },
  field: { marginBottom: "16px" },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    background: "#fff",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
  },
  cancelBtn: {
    padding: "10px 20px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 24px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
