import { useState, useEffect } from "react";
import api from "../lib/api";
import EventModal from "../components/EventModal";
import CreateEventModal from "../components/CreateEventModal";
import Notification from "../components/Notification";

export default function Dashboard({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await api.get("/events", { page: currentPage, limit: 10 });
        setEvents(res.data);
        setTotalPages(res.totalPages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [currentPage, fetchTrigger]);

  function handleEventUpdate(updatedEvent) {
    setEvents((prev) =>
      prev.map((e) => (e._id === updatedEvent._id ? updatedEvent : e)),
    );
    const action = updatedEvent.status === "approved" ? "approved" : "rejected";
    setNotification({
      message: `Event ${action} successfully`,
      type: "success",
    });
  }

  function handleEventCreated() {
    if (currentPage === 1) {
      setFetchTrigger((t) => t + 1);
    } else {
      setCurrentPage(1);
    }
    setNotification({ message: "Event created successfully", type: "success" });
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-SG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const statusColors = {
    pending: { bg: "#fef9c3", color: "#a16207" },
    approved: { bg: "#dcfce7", color: "#16a34a" },
    rejected: { bg: "#fef2f2", color: "#dc2626" },
  };

  return (
    <div style={styles.page}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Navigation */}
      <nav style={styles.nav}>
        <span style={styles.logo}>Wellness Booking</span>
        <div style={styles.navRight}>
          <span style={styles.roleBadge}>
            {user.role === "hr" ? "HR Admin" : "Vendor Admin"}
          </span>
          <span style={styles.companyName}>{user.companyName}</span>
          <button onClick={onLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              {user.role === "hr" ? "Company HR Dashboard" : "Vendor Dashboard"}
            </h1>
            <p style={styles.subtitle}>
              {user.role === "hr"
                ? "Manage your wellness event bookings"
                : "Review and respond to event bookings"}
            </p>
          </div>
          {user.role === "hr" && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={styles.createBtn}
            >
              + Create Event
            </button>
          )}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <p style={styles.loading}>Loading events...</p>
        ) : events.length === 0 ? (
          <p style={styles.empty}>No events found</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Event Name</th>
                  <th style={styles.th}>
                    {user.role === "hr" ? "Vendor" : "Company"}
                  </th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const sc = statusColors[event.status] || statusColors.pending;
                  return (
                    <tr key={event._id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong>{event.eventType?.name}</strong>
                      </td>
                      <td style={styles.td}>
                        {user.role === "hr"
                          ? event.vendor?.companyName
                          : event.companyName}
                      </td>
                      <td style={styles.td}>
                        {event.confirmedDate ? (
                          <span style={{ color: "#16a34a", fontWeight: "600" }}>
                            ✓ {formatDate(event.confirmedDate)}
                          </span>
                        ) : (
                          <span style={{ color: "#64748b", fontSize: "13px" }}>
                            {event.proposedDates
                              ?.map((d) => formatDate(d))
                              .join(", ")}
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background: sc.bg,
                            color: sc.color,
                          }}
                        >
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1)}
                        </span>
                      </td>
                      <td style={styles.td}>{formatDate(event.createdAt)}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => setSelectedEvent(event)}
                          style={styles.viewBtn}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={{
                ...styles.pageBtn,
                ...(currentPage <= 1 ? styles.pageBtnDisabled : {}),
              }}
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </button>
            <span style={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              style={{
                ...styles.pageBtn,
                ...(currentPage >= totalPages ? styles.pageBtnDisabled : {}),
              }}
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </main>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          userRole={user.role}
          onClose={() => setSelectedEvent(null)}
          onUpdate={handleEventUpdate}
        />
      )}

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleEventCreated}
        />
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc" },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
  },
  logo: { fontSize: "18px", fontWeight: "700", color: "#1e293b" },
  navRight: { display: "flex", alignItems: "center", gap: "12px" },
  roleBadge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    background: "#ede9fe",
    color: "#7c3aed",
  },
  companyName: { fontSize: "14px", color: "#475569" },
  logoutBtn: {
    padding: "6px 16px",
    background: "none",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
  },
  main: { maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
  createBtn: {
    padding: "10px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  loading: { textAlign: "center", padding: "60px", color: "#94a3b8" },
  empty: { textAlign: "center", padding: "60px", color: "#94a3b8" },
  tableWrapper: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    overflow: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    borderBottom: "1px solid #e2e8f0",
  },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "14px 16px", color: "#334155" },
  viewBtn: {
    padding: "6px 16px",
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    marginTop: "16px",
  },
  pageBtn: {
    padding: "6px 16px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "13px",
    color: "#334155",
    cursor: "pointer",
  },
  pageBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  pageInfo: {
    fontSize: "13px",
    color: "#64748b",
  },
};
