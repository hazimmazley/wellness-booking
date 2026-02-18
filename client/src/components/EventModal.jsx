import { useState } from "react";
import api from "../lib/api";

export default function EventModal({ event, userRole, onClose, onUpdate }) {
  const [action, setAction] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-SG", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  async function handleApprove() {
    if (!selectedDate) {
      setError("Please select a date");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.patch(`/events/${event._id}/approve`, {
        confirmedDate: selectedDate,
      });
      onUpdate(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      setError("Please provide a reason");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.patch(`/events/${event._id}/reject`, {
        remarks: rejectReason,
      });
      onUpdate(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const statusColors = {
    pending: { bg: "#fef9c3", color: "#a16207", label: "Pending" },
    approved: { bg: "#dcfce7", color: "#16a34a", label: "Approved" },
    rejected: { bg: "#fef2f2", color: "#dc2626", label: "Rejected" },
  };

  const st = statusColors[event.status] || statusColors.pending;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Event Details</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={styles.modalBody}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Event Name</span>
              <span style={styles.infoValue}>{event.eventType?.name}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Description</span>
              <span style={styles.infoValue}>
                {event.eventType?.description || "—"}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Company</span>
              <span style={styles.infoValue}>{event.companyName}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Vendor</span>
              <span style={styles.infoValue}>{event.vendor?.companyName}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Location</span>
              <span style={styles.infoValue}>
                {event.location?.streetName
                  ? `${event.location.streetName} (${event.location.postalCode})`
                  : event.location?.postalCode}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Status</span>
              <span
                style={{
                  ...styles.statusBadge,
                  background: st.bg,
                  color: st.color,
                }}
              >
                {st.label}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Created</span>
              <span style={styles.infoValue}>
                {formatDate(event.createdAt)}
              </span>
            </div>
          </div>

          {/* Proposed Dates */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Proposed Dates</h3>
            {event.proposedDates?.map((date, i) => (
              <div
                key={i}
                style={{
                  ...styles.dateChip,
                  ...(event.confirmedDate &&
                  new Date(date).getTime() ===
                    new Date(event.confirmedDate).getTime()
                    ? {
                        background: "#dcfce7",
                        color: "#16a34a",
                        fontWeight: "600",
                      }
                    : {}),
                }}
              >
                {formatDate(date)}
                {event.confirmedDate &&
                  new Date(date).getTime() ===
                    new Date(event.confirmedDate).getTime() &&
                  " ✓"}
              </div>
            ))}
          </div>

          {/* Confirmed Date */}
          {event.confirmedDate && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Confirmed Date</h3>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#16a34a",
                  margin: 0,
                }}
              >
                {formatDate(event.confirmedDate)}
              </p>
            </div>
          )}

          {/* Rejection Remarks */}
          {event.status === "rejected" && event.remarks && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Rejection Reason</h3>
              <p style={styles.remarks}>{event.remarks}</p>
            </div>
          )}

          {/* Vendor Actions */}
          {userRole === "vendor" && event.status === "pending" && !action && (
            <div style={styles.actionBar}>
              <button
                onClick={() => setAction("approve")}
                style={{
                  ...styles.actionBtn,
                  background: "#16a34a",
                  color: "#fff",
                }}
              >
                ✓ Approve
              </button>
              <button
                onClick={() => setAction("reject")}
                style={{
                  ...styles.actionBtn,
                  background: "#dc2626",
                  color: "#fff",
                }}
              >
                ✕ Reject
              </button>
            </div>
          )}

          {/* Approve: Select a date */}
          {action === "approve" && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Select a Date to Approve</h3>
              {event.proposedDates?.map((date, i) => (
                <label key={i} style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="approveDate"
                    value={date}
                    checked={selectedDate === date}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  {formatDate(date)}
                </label>
              ))}
              <div style={styles.formActions}>
                <button
                  onClick={() => setAction(null)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  style={{
                    ...styles.actionBtn,
                    background: "#16a34a",
                    color: "#fff",
                  }}
                >
                  {loading ? "Approving..." : "Confirm Approval"}
                </button>
              </div>
            </div>
          )}

          {/* Reject: Enter reason */}
          {action === "reject" && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Reason for Rejection</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejecting this event..."
                style={styles.textarea}
                rows={3}
              />
              <div style={styles.formActions}>
                <button
                  onClick={() => setAction(null)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  style={{
                    ...styles.actionBtn,
                    background: "#dc2626",
                    color: "#fff",
                  }}
                >
                  {loading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          )}
        </div>
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
    maxWidth: "560px",
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
  infoGrid: { display: "grid", gap: "16px" },
  infoItem: { display: "flex", flexDirection: "column", gap: "4px" },
  infoLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: { fontSize: "14px", color: "#334155" },
  statusBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    width: "fit-content",
  },
  section: {
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    margin: "0 0 12px 0",
  },
  dateChip: {
    padding: "8px 14px",
    background: "#f1f5f9",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#334155",
    marginBottom: "8px",
  },
  remarks: {
    fontSize: "14px",
    color: "#dc2626",
    margin: 0,
    padding: "12px",
    background: "#fef2f2",
    borderRadius: "8px",
  },
  actionBar: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
  },
  actionBtn: {
    flex: 1,
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    background: "#f8fafc",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    border: "1px solid #e2e8f0",
    marginBottom: "8px",
  },
  textarea: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "16px",
  },
  cancelBtn: {
    padding: "10px 20px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
};
