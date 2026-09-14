import { useEffect, useMemo, useState } from "react";
import {
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
} from "../services/api";

const STATUSES = ["Unread", "Read", "Replied"];

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      setLoading(true);
      setError("");

      const result = await getContactMessages();

      setMessages(result.messages || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      setUpdatingId(id);
      setError("");

      await updateContactMessageStatus(id, status);

      setMessages((current) =>
        current.map((message) =>
          message.id === id
            ? { ...message, status }
            : message
        )
      );

      if (selectedMessage?.id === id) {
        setSelectedMessage((current) => ({
          ...current,
          status,
        }));
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleViewMessage(id) {
    try {
      setDetailsLoading(true);
      setError("");

      const result = await getContactMessageById(id);

      let message = result.message;

      if (message.status === "Unread") {
        await updateContactMessageStatus(id, "Read");

        message = {
          ...message,
          status: "Read",
        };

        setMessages((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, status: "Read" }
              : item
          )
        );
      }

      setSelectedMessage(message);
    } catch (error) {
      setError(error.message);
    } finally {
      setDetailsLoading(false);
    }
  }

  const filteredMessages = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesSearch =
        !keyword ||
        message.name?.toLowerCase().includes(keyword) ||
        message.email?.toLowerCase().includes(keyword) ||
        message.subject?.toLowerCase().includes(keyword) ||
        message.message?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" ||
        message.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [messages, search, statusFilter]);

  const unreadCount = messages.filter(
    (message) => message.status === "Unread"
  ).length;

  if (loading) {
    return (
      <div className="container">
        <h1>Loading messages...</h1>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "3rem" }}>
      <span className="eyebrow">Admin</span>

      <h1>Contact Inbox</h1>

      <p>
        View and manage messages submitted through the AddyVenture
        contact form.
      </p>

      <p>
        <strong>{unreadCount}</strong> unread message
        {unreadCount === 1 ? "" : "s"}
      </p>

      {error && (
        <p style={{ marginTop: "1rem" }}>
          Error: {error}
        </p>
      )}

      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginTop: "2rem",
          marginBottom: "1.5rem",
        }}
      >
        <input
          type="search"
          placeholder="Search name, email, topic, or message..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          style={{
            flex: "1",
            minWidth: "260px",
            padding: "0.8rem",
          }}
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          style={{ padding: "0.8rem" }}
        >
          <option value="All">All Statuses</option>

          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={loadMessages}
        >
          Refresh
        </button>
      </div>

      <p>
        Showing{" "}
        <strong>{filteredMessages.length}</strong> of{" "}
        <strong>{messages.length}</strong> messages
      </p>

      <div
        style={{
          overflowX: "auto",
          marginTop: "1rem",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th align="left">Sender</th>
              <th align="left">Topic</th>
              <th align="left">Received</th>
              <th align="left">Status</th>
              <th align="left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredMessages.map((message) => (
              <tr key={message.id}>
                <td>
                  <strong>{message.name}</strong>
                  <br />
                  <small>{message.email}</small>
                </td>

                <td>{message.subject}</td>

                <td>{formatDate(message.createdAt)}</td>

                <td>
                  <select
                    value={message.status}
                    disabled={updatingId === message.id}
                    onChange={(event) =>
                      handleStatusChange(
                        message.id,
                        event.target.value
                      )
                    }
                  >
                    {STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      handleViewMessage(message.id)
                    }
                  >
                    View Message
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMessages.length === 0 && (
        <p style={{ marginTop: "2rem" }}>
          No matching messages found.
        </p>
      )}

      {detailsLoading && (
        <p style={{ marginTop: "2rem" }}>
          Loading message...
        </p>
      )}

      {selectedMessage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 9999,
          }}
          onClick={() => setSelectedMessage(null)}
        >
          <div
            style={{
              background: "white",
              width: "min(700px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "16px",
              padding: "2rem",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={() =>
                setSelectedMessage(null)
              }
              style={{
                float: "right",
              }}
            >
              Close
            </button>

            <span className="eyebrow">
              Contact Message
            </span>

            <h2>{selectedMessage.subject}</h2>

            <p>
              <strong>From:</strong>{" "}
              {selectedMessage.name}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {selectedMessage.email}
            </p>

            <p>
              <strong>Received:</strong>{" "}
              {formatDate(selectedMessage.createdAt)}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {selectedMessage.status}
            </p>

            <hr />

            <h3>Message</h3>

            <p
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: "1.7",
              }}
            >
              {selectedMessage.message}
            </p>

            <hr />

            <label>
              <strong>Update Status</strong>
              <br />

              <select
                value={selectedMessage.status}
                disabled={
                  updatingId === selectedMessage.id
                }
                onChange={(event) =>
                  handleStatusChange(
                    selectedMessage.id,
                    event.target.value
                  )
                }
                style={{
                  marginTop: "0.5rem",
                  padding: "0.7rem",
                }}
              >
                {STATUSES.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}