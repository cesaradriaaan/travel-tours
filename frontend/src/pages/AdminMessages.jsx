import { useEffect, useMemo, useState } from "react";

import {
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  sendContactReply,
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

  const [replyMessage, setReplyMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [sendingReply, setSendingReply] = useState(false);

  const [error, setError] = useState("");
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");

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
            ? {
                ...message,
                status,
              }
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
      setReplyError("");
      setReplySuccess("");
      setReplyMessage("");

      const result = await getContactMessageById(id);

      let message = {
        ...result.message,
        replies: result.replies || [],
      };

      if (message.status === "Unread") {
        await updateContactMessageStatus(id, "Read");

        message = {
          ...message,
          status: "Read",
        };

        setMessages((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "Read",
                }
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

  async function handleSendReply(event) {
    event.preventDefault();

    const cleanReply = replyMessage.trim();

    if (cleanReply.length < 2) {
      setReplyError("Please enter a reply message.");
      return;
    }

    try {
      setSendingReply(true);
      setReplyError("");
      setReplySuccess("");

      const result = await sendContactReply(
        selectedMessage.id,
        cleanReply
      );

      setSelectedMessage((current) => ({
        ...current,
        status: "Replied",
        replies: [
          ...(current.replies || []),
          result.reply,
        ],
      }));

      setMessages((current) =>
        current.map((message) =>
          message.id === selectedMessage.id
            ? {
                ...message,
                status: "Replied",
              }
            : message
        )
      );

      setReplyMessage("");
      setReplySuccess("Reply sent successfully!");
    } catch (error) {
      setReplyError(
        error.message || "Unable to send reply."
      );
    } finally {
      setSendingReply(false);
    }
  }

  const filteredMessages = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesSearch =
        !keyword ||
        message.name
          ?.toLowerCase()
          .includes(keyword) ||
        message.email
          ?.toLowerCase()
          .includes(keyword) ||
        message.subject
          ?.toLowerCase()
          .includes(keyword) ||
        message.message
          ?.toLowerCase()
          .includes(keyword);

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
    <div
      className="container"
      style={{
        paddingTop: "3rem",
        paddingBottom: "4rem",
      }}
    >
      <span className="eyebrow">Admin</span>

      <h1>Contact Inbox</h1>

      <p>
        View, reply to, and manage messages submitted
        through the AddyVenture contact form.
      </p>

      <p>
        <strong>{unreadCount}</strong> unread message
        {unreadCount === 1 ? "" : "s"}
      </p>

      {error && (
        <p
          style={{
            marginTop: "1rem",
          }}
        >
          Error: {error}
        </p>
      )}

      {/* SEARCH + FILTER */}
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
          style={{
            padding: "0.8rem",
          }}
        >
          <option value="All">
            All Statuses
          </option>

          {STATUSES.map((status) => (
            <option
              key={status}
              value={status}
            >
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
        <strong>
          {filteredMessages.length}
        </strong>{" "}
        of <strong>{messages.length}</strong>{" "}
        messages
      </p>

      {/* MESSAGE TABLE */}
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

                <td>
                  {formatDate(message.createdAt)}
                </td>

                <td>
                  <select
                    value={message.status}
                    disabled={
                      updatingId === message.id
                    }
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
        <p
          style={{
            marginTop: "2rem",
          }}
        >
          No matching messages found.
        </p>
      )}

      {detailsLoading && (
        <p
          style={{
            marginTop: "2rem",
          }}
        >
          Loading message...
        </p>
      )}

      {/* MESSAGE MODAL */}
      {selectedMessage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 9999,
          }}
          onClick={() =>
            setSelectedMessage(null)
          }
        >
          <div
            style={{
              background: "white",
              width: "min(760px, 100%)",
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

            <h2>
              {selectedMessage.subject}
            </h2>

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
              {formatDate(
                selectedMessage.createdAt
              )}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {selectedMessage.status}
            </p>

            <hr />

            {/* CUSTOMER MESSAGE */}
            <div
              style={{
                marginTop: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <span className="eyebrow">
                Customer
              </span>

              <p
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.7",
                  marginTop: "0.5rem",
                }}
              >
                {selectedMessage.message}
              </p>
            </div>

            {/* REPLY HISTORY */}
            <div
              style={{
                marginBottom: "2rem",
              }}
            >
              <h3>Reply History</h3>

              {selectedMessage.replies?.length >
              0 ? (
                selectedMessage.replies.map(
                  (reply) => (
                    <div
                      key={reply.id}
                      style={{
                        padding: "1rem",
                        marginTop: "1rem",
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                      }}
                    >
                      <strong>
                        AddyVenture
                      </strong>

                      <p
                        style={{
                          whiteSpace: "pre-wrap",
                          lineHeight: "1.7",
                        }}
                      >
                        {reply.replyMessage}
                      </p>

                      <small>
                        Sent to {reply.sentTo} ·{" "}
                        {formatDate(
                          reply.createdAt
                        )}
                      </small>
                    </div>
                  )
                )
              ) : (
                <p>
                  No replies sent yet.
                </p>
              )}
            </div>

            <hr />

            {/* REPLY FORM */}
            <form
              onSubmit={handleSendReply}
              style={{
                marginTop: "2rem",
              }}
            >
              <h3>Reply to Customer</h3>

              <p>
                Replying to{" "}
                <strong>
                  {selectedMessage.email}
                </strong>
              </p>

              <textarea
                rows="7"
                value={replyMessage}
                onChange={(event) => {
                  setReplyMessage(
                    event.target.value
                  );

                  setReplyError("");
                  setReplySuccess("");
                }}
                placeholder="Write your reply here..."
                disabled={sendingReply}
                style={{
                  width: "100%",
                  padding: "1rem",
                  marginTop: "0.75rem",
                  resize: "vertical",
                }}
              />

              {replyError && (
                <p
                  style={{
                    marginTop: "0.75rem",
                  }}
                >
                  Error: {replyError}
                </p>
              )}

              {replySuccess && (
                <p
                  style={{
                    marginTop: "0.75rem",
                  }}
                >
                  {replySuccess}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={sendingReply}
                style={{
                  marginTop: "1rem",
                }}
              >
                {sendingReply
                  ? "Sending Reply..."
                  : "Send Reply"}
              </button>
            </form>

            <hr
              style={{
                marginTop: "2rem",
              }}
            />

            {/* MANUAL STATUS */}
            <div
              style={{
                marginTop: "1.5rem",
              }}
            >
              <label>
                <strong>
                  Message Status
                </strong>

                <br />

                <select
                  value={
                    selectedMessage.status
                  }
                  disabled={
                    updatingId ===
                    selectedMessage.id
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
        </div>
      )}
    </div>
  );
}