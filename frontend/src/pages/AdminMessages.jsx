import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  X,
} from "lucide-react";

import {
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  sendContactReply,
} from "../services/api";
import "./Admin.css";


const STATUSES = [
  "Unread",
  "Read",
  "Replied",
];


function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}


function getStatusColors(status) {
  switch (status) {
    case "Unread":
      return {
        background:
          "rgba(239, 68, 68, 0.1)",
        color:
          "#a82424",
      };

    case "Read":
      return {
        background:
          "rgba(14, 165, 233, 0.11)",
        color:
          "#036b91",
      };

    case "Replied":
      return {
        background:
          "rgba(22, 163, 74, 0.11)",
        color:
          "#14783a",
      };

    default:
      return {
        background:
          "rgba(100, 116, 139, 0.1)",
        color:
          "#475569",
      };
  }
}


function StatusBadge({
  status,
}) {
  const colors =
    getStatusColors(status);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",

        padding:
          "0.5rem 0.8rem",

        borderRadius:
          "999px",

        background:
          colors.background,

        color:
          colors.color,

        fontSize:
          "0.82rem",

        fontWeight: 800,

        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}


function StatusSelect({
  value,
  disabled,
  onChange,
}) {
  const colors =
    getStatusColors(value);

  return (
    <div
      style={{
        position: "relative",

        display:
          "inline-flex",

        alignItems:
          "center",
      }}
    >
      <select
        value={value}
        disabled={disabled}
        onChange={onChange}
        style={{
          appearance:
            "none",

          WebkitAppearance:
            "none",

          border:
            "none",

          outline:
            "none",

          borderRadius:
            "999px",

          padding:
            "0.55rem 2rem 0.55rem 0.85rem",

          background:
            colors.background,

          color:
            colors.color,

          font:
            "inherit",

          fontSize:
            "0.82rem",

          fontWeight:
            800,

          cursor:
            disabled
              ? "wait"
              : "pointer",
        }}
      >
        {STATUSES.map(
          (status) => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          )
        )}
      </select>

      <ChevronDown
        size={15}
        style={{
          position:
            "absolute",

          right:
            "0.65rem",

          pointerEvents:
            "none",

          color:
            colors.color,
        }}
      />
    </div>
  );
}


export default function AdminMessages() {
  const messagesAbortRef =
    useRef(null);

  const detailsAbortRef =
    useRef(null);

  const statusLockRef =
    useRef(false);

  const replyLockRef =
    useRef(false);

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    selectedMessage,
    setSelectedMessage,
  ] = useState(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    replyMessage,
    setReplyMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  const [
    sendingReply,
    setSendingReply,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    replyError,
    setReplyError,
  ] = useState("");

  const [
    replySuccess,
    setReplySuccess,
  ] = useState("");


  useEffect(() => {
    loadMessages();

    return () => {
      messagesAbortRef
        .current
        ?.abort();

      messagesAbortRef.current =
        null;

      detailsAbortRef
        .current
        ?.abort();

      detailsAbortRef.current =
        null;
    };
  }, []);


  useEffect(() => {
    if (!selectedMessage) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(event) {
      if (
        event.key === "Escape" &&
        !sendingReply
      ) {
        setSelectedMessage(null);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedMessage,
    sendingReply,
  ]);


  async function loadMessages() {
    if (messagesAbortRef.current) {
      return;
    }

    const controller =
      new AbortController();

    messagesAbortRef.current =
      controller;

    try {
      setLoading(true);
      setError("");

      const result =
        await getContactMessages({
          signal:
            controller.signal,
        });

      if (
        controller.signal.aborted
      ) {
        return;
      }

      setMessages(
        result.messages || []
      );
    } catch (error) {
      if (
        controller.signal.aborted
      ) {
        return;
      }

      setError(
        error.message
      );
    } finally {
      if (
        messagesAbortRef.current ===
        controller
      ) {
        messagesAbortRef.current =
          null;

        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }
  }


  async function handleStatusChange(
    id,
    status
  ) {
    if (statusLockRef.current) {
      return;
    }

    const currentMessage =
      messages.find(
        (message) =>
          message.id === id
      );

    if (
      currentMessage?.status ===
      status
    ) {
      return;
    }

    statusLockRef.current =
      true;

    try {
      setUpdatingId(id);
      setError("");

      await updateContactMessageStatus(
        id,
        status
      );

      setMessages(
        (current) =>
          current.map(
            (message) =>
              message.id === id
                ? {
                    ...message,
                    status,
                  }
                : message
          )
      );

      if (
        selectedMessage?.id ===
        id
      ) {
        setSelectedMessage(
          (current) => ({
            ...current,
            status,
          })
        );
      }
    } catch (error) {
      setError(
        error.message
      );
    } finally {
      statusLockRef.current =
        false;

      setUpdatingId(null);
    }
  }


  async function handleViewMessage(
    id
  ) {
    if (detailsAbortRef.current) {
      return;
    }

    const controller =
      new AbortController();

    detailsAbortRef.current =
      controller;

    try {
      setDetailsLoading(true);
      setError("");
      setReplyError("");
      setReplySuccess("");
      setReplyMessage("");
      setSelectedMessage(null);

      const result =
        await getContactMessageById(
          id,
          {
            signal:
              controller.signal,
          }
        );

      if (
        controller.signal.aborted
      ) {
        return;
      }

      let message = {
        ...result.message,

        replies:
          result.replies || [],
      };

      setSelectedMessage(
        message
      );

      if (
        message.status ===
        "Unread"
      ) {
        try {
          await updateContactMessageStatus(
            id,
            "Read",
            {
              signal:
                controller.signal,
            }
          );
        } catch (statusError) {
          if (
            controller.signal.aborted
          ) {
            return;
          }

          setError(
            statusError.message ||
              "The message opened, but its read status could not be updated."
          );

          return;
        }

        message = {
          ...message,
          status: "Read",
        };

        setMessages(
          (current) =>
            current.map(
              (item) =>
                item.id === id
                  ? {
                      ...item,
                      status:
                        "Read",
                    }
                  : item
            )
        );
      }

      setSelectedMessage(
        message
      );
    } catch (error) {
      if (
        controller.signal.aborted
      ) {
        return;
      }

      setError(
        error.message
      );
    } finally {
      if (
        detailsAbortRef.current ===
        controller
      ) {
        detailsAbortRef.current =
          null;

        if (
          !controller.signal.aborted
        ) {
          setDetailsLoading(false);
        }
      }
    }
  }


  async function handleSendReply(
    event
  ) {
    event.preventDefault();

    if (replyLockRef.current) {
      return;
    }

    const cleanReply =
      replyMessage.trim();

    if (
      cleanReply.length <
      2
    ) {
      setReplyError(
        "Please enter a reply message."
      );

      return;
    }

    replyLockRef.current =
      true;

    try {
      setSendingReply(true);
      setReplyError("");
      setReplySuccess("");

      const result =
        await sendContactReply(
          selectedMessage.id,
          cleanReply
        );

      setSelectedMessage(
        (current) => ({
          ...current,

          status:
            "Replied",

          replies: [
            ...(current.replies ||
              []),

            result.reply,
          ],
        })
      );

      setMessages(
        (current) =>
          current.map(
            (message) =>
              message.id ===
              selectedMessage.id
                ? {
                    ...message,
                    status:
                      "Replied",
                  }
                : message
          )
      );

      setReplyMessage("");

      setReplySuccess(
        "Reply sent successfully!"
      );
    } catch (error) {
      setReplyError(
        error.message ||
          "Unable to send reply."
      );
    } finally {
      replyLockRef.current =
        false;

      setSendingReply(false);
    }
  }


  const filteredMessages =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return messages.filter(
        (message) => {
          const matchesSearch =
            !keyword ||
            message.name
              ?.toLowerCase()
              .includes(
                keyword
              ) ||
            message.email
              ?.toLowerCase()
              .includes(
                keyword
              ) ||
            message.subject
              ?.toLowerCase()
              .includes(
                keyword
              ) ||
            message.message
              ?.toLowerCase()
              .includes(
                keyword
              );

          const matchesStatus =
            statusFilter ===
              "All" ||
            message.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      messages,
      search,
      statusFilter,
    ]);


  const unreadCount =
    messages.filter(
      (message) =>
        message.status ===
        "Unread"
    ).length;


  if (loading) {
    return (
      <div className="route-state" role="status" aria-live="polite">
        <span className="route-state__pulse" aria-hidden="true" />
        <p>Loading messages...</p>
      </div>
    );
  }


  return (
    <div className="container admin-page admin-page--messages">
      <span className="eyebrow">
        Admin
      </span>

      <h1>
        Contact Inbox
      </h1>

      <p>
        View, reply to, and manage
        messages submitted through the
        AddyVenture contact form.
      </p>

      <p className="admin-summary">
        <strong>
          {unreadCount}
        </strong>{" "}
        unread message
        {unreadCount === 1
          ? ""
          : "s"}
      </p>


      {error && (
        <div className="admin-notice admin-notice--error" role="alert">
          Error: {error}
        </div>
      )}


      {/* SEARCH + FILTER */}
      <div className="admin-toolbar">
        <input
          type="search"
          aria-label="Search messages"
          placeholder="Search name, email, topic, or message..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          className="admin-toolbar__search"
        />

        <select
          aria-label="Filter messages by status"
          value={
            statusFilter
          }
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="admin-toolbar__select"
        >
          <option value="All">
            All Statuses
          </option>

          {STATUSES.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            )
          )}
        </select>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            loadMessages()
          }
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>


      <p className="admin-results">
        Showing{" "}
        <strong>
          {
            filteredMessages.length
          }
        </strong>{" "}
        of{" "}
        <strong>
          {messages.length}
        </strong>{" "}
        messages
      </p>


      {/* MESSAGE TABLE */}
      <div className="admin-table-wrap">
        <table className="admin-table" aria-label="Contact messages">
          <thead>
            <tr>
              <th scope="col" align="left">
                Sender
              </th>

              <th scope="col" align="left">
                Topic
              </th>

              <th scope="col" align="left">
                Received
              </th>

              <th scope="col" align="left">
                Status
              </th>

              <th scope="col" align="left">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredMessages.map(
              (message) => (
                <tr
                  key={
                    message.id
                  }
                >
                  <td data-label="Sender">
                    <strong>
                      {
                        message.name
                      }
                    </strong>

                    <br />

                    <small>
                      {
                        message.email
                      }
                    </small>
                  </td>

                  <td data-label="Topic">
                    {
                      message.subject
                    }
                  </td>

                  <td data-label="Received">
                    {formatDate(
                      message.createdAt
                    )}
                  </td>

                  <td data-label="Status">
                    <StatusSelect
                      value={
                        message.status
                      }
                      disabled={
                        updatingId !==
                        null
                      }
                      onChange={(
                        event
                      ) =>
                        handleStatusChange(
                          message.id,
                          event.target
                            .value
                        )
                      }
                    />
                  </td>

                  <td data-label="Action">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={
                        detailsLoading
                      }
                      onClick={() =>
                        handleViewMessage(
                          message.id
                        )
                      }
                    >
                      View Message
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>


      {filteredMessages.length ===
        0 && (
        <p className="admin-empty-state">
          No matching messages
          found.
        </p>
      )}


      {detailsLoading && (
        <p className="admin-loading-state" role="status">
          Loading message...
        </p>
      )}


      {/* MESSAGE MODAL */}
      {selectedMessage && (
        <div
          className="admin-modal"
          onClick={() => {
            if (!sendingReply) {
              setSelectedMessage(null);
            }
          }}
        >
          <div
            className="admin-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-detail-title"
            aria-busy={sendingReply}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              aria-label="Close message"
              onClick={() =>
                setSelectedMessage(
                  null
                )
              }
              className="admin-modal__close"
              disabled={sendingReply}
              autoFocus
            >
              <X size={20} aria-hidden="true" />
            </button>


            <span className="eyebrow">
              Contact Message
            </span>

            <h2 id="message-detail-title" className="admin-modal__title">
              {
                selectedMessage.subject
              }
            </h2>


            <div className="admin-modal__meta">
              <p
                style={{
                  margin: 0,
                }}
              >
                <strong>
                  From:
                </strong>{" "}
                {
                  selectedMessage.name
                }
              </p>

              <p
                style={{
                  margin: 0,
                }}
              >
                <strong>
                  Email:
                </strong>{" "}
                {
                  selectedMessage.email
                }
              </p>

              <p
                style={{
                  margin: 0,
                }}
              >
                <strong>
                  Received:
                </strong>{" "}
                {formatDate(
                  selectedMessage.createdAt
                )}
              </p>

              <div
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    "0.6rem",
                }}
              >
                <strong>
                  Status:
                </strong>

                <StatusBadge
                  status={
                    selectedMessage.status
                  }
                />
              </div>
            </div>


            <hr
              style={{
                margin:
                  "1.5rem 0",
              }}
            />


            {/* CUSTOMER MESSAGE */}
            <div className="admin-message-block">
              <span className="eyebrow">
                Customer
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",

                  lineHeight:
                    "1.7",

                  marginTop:
                    "0.5rem",
                }}
              >
                {
                  selectedMessage.message
                }
              </p>
            </div>


            {/* REPLY HISTORY */}
            <div className="admin-reply-history">
              <h3>
                Reply History
              </h3>

              {selectedMessage.replies
                ?.length >
              0 ? (
                selectedMessage.replies.map(
                  (reply) => (
                    <div
                      key={
                        reply.id
                      }
                      className="admin-reply-card"
                    >
                      <strong>
                        AddyVenture
                      </strong>

                      <p
                        style={{
                          whiteSpace:
                            "pre-wrap",

                          lineHeight:
                            "1.7",
                        }}
                      >
                        {
                          reply.replyMessage
                        }
                      </p>

                      <small>
                        Sent to{" "}
                        {
                          reply.sentTo
                        }{" "}
                        ·{" "}
                        {formatDate(
                          reply.createdAt
                        )}
                      </small>
                    </div>
                  )
                )
              ) : (
                <p
                  style={{
                    color:
                      "var(--ink-soft)",
                  }}
                >
                  No replies sent
                  yet.
                </p>
              )}
            </div>


            <hr />


            {/* REPLY FORM */}
            <form
              onSubmit={
                handleSendReply
              }
              className="admin-reply-form"
            >
              <h3>
                Reply to Customer
              </h3>

              <p>
                Replying to{" "}
                <strong>
                  {
                    selectedMessage.email
                  }
                </strong>
              </p>

              <textarea
                rows="7"
                value={
                  replyMessage
                }
                onChange={(
                  event
                ) => {
                  setReplyMessage(
                    event.target.value
                  );

                  setReplyError(
                    ""
                  );

                  setReplySuccess(
                    ""
                  );
                }}
                placeholder="Write your reply here..."
                disabled={
                  sendingReply
                }
                className="admin-reply-form__textarea"
              />


              {replyError && (
                <p
                  style={{
                    marginTop:
                      "0.75rem",

                    color:
                      "#a11",

                    fontWeight:
                      600,
                  }}
                >
                  Error:{" "}
                  {
                    replyError
                  }
                </p>
              )}


              {replySuccess && (
                <p
                  style={{
                    marginTop:
                      "0.75rem",

                    color:
                      "#14783a",

                    fontWeight:
                      700,
                  }}
                >
                  {
                    replySuccess
                  }
                </p>
              )}


              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  sendingReply
                }
                style={{
                  marginTop:
                    "1rem",
                }}
              >
                {sendingReply
                  ? "Sending Reply..."
                  : "Send Reply"}
              </button>
            </form>


            <hr
              style={{
                marginTop:
                  "2rem",
              }}
            />


            {/* MANUAL STATUS */}
            <div
              style={{
                marginTop:
                  "1.5rem",
              }}
            >
              <strong
                style={{
                  display:
                    "block",

                  marginBottom:
                    "0.65rem",
                }}
              >
                Message Status
              </strong>

              <StatusSelect
                value={
                  selectedMessage.status
                }
                disabled={
                  updatingId !==
                  null
                }
                onChange={(
                  event
                ) =>
                  handleStatusChange(
                    selectedMessage.id,
                    event.target
                      .value
                  )
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
