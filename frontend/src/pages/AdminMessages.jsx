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
      <div className="container">
        <h1>
          Loading messages...
        </h1>
      </div>
    );
  }


  return (
    <div
      className="container"
      style={{
        paddingTop:
          "3rem",

        paddingBottom:
          "3rem",
      }}
    >
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

      <p>
        <strong>
          {unreadCount}
        </strong>{" "}
        unread message
        {unreadCount === 1
          ? ""
          : "s"}
      </p>


      {error && (
        <div
          style={{
            marginTop:
              "1rem",

            padding:
              "0.9rem 1rem",

            borderRadius:
              "10px",

            background:
              "rgba(220, 38, 38, 0.07)",

            color:
              "#a11",
          }}
        >
          Error: {error}
        </div>
      )}


      {/* SEARCH + FILTER */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",

          marginTop:
            "2rem",

          marginBottom:
            "1.5rem",
        }}
      >
        <input
          type="search"
          placeholder="Search name, email, topic, or message..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          style={{
            flex: "1",

            minWidth:
              "260px",

            padding:
              "0.85rem 1rem",

            border:
              "1px solid var(--line)",

            borderRadius:
              "12px",

            background:
              "white",

            font:
              "inherit",
          }}
        />

        <select
          value={
            statusFilter
          }
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          style={{
            padding:
              "0.85rem 1rem",

            border:
              "1px solid var(--line)",

            borderRadius:
              "12px",

            background:
              "white",

            font:
              "inherit",
          }}
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


      <p>
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
      <div
        style={{
          overflowX:
            "auto",

          marginTop:
            "1rem",
        }}
      >
        <table
          style={{
            width:
              "100%",

            borderCollapse:
              "collapse",
          }}
        >
          <thead>
            <tr>
              <th align="left">
                Sender
              </th>

              <th align="left">
                Topic
              </th>

              <th align="left">
                Received
              </th>

              <th align="left">
                Status
              </th>

              <th align="left">
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
                  <td>
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

                  <td>
                    {
                      message.subject
                    }
                  </td>

                  <td>
                    {formatDate(
                      message.createdAt
                    )}
                  </td>

                  <td>
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

                  <td>
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
        <p
          style={{
            marginTop:
              "2rem",
          }}
        >
          No matching messages
          found.
        </p>
      )}


      {detailsLoading && (
        <p
          style={{
            marginTop:
              "2rem",
          }}
        >
          Loading message...
        </p>
      )}


      {/* MESSAGE MODAL */}
      {selectedMessage && (
        <div
          style={{
            position:
              "fixed",

            inset: 0,

            background:
              "rgba(3, 24, 32, 0.58)",

            backdropFilter:
              "blur(4px)",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            padding:
              "1rem",

            zIndex:
              9999,
          }}
          onClick={() =>
            setSelectedMessage(
              null
            )
          }
        >
          <div
            style={{
              position:
                "relative",

              background:
                "white",

              width:
                "min(760px, 100%)",

              maxHeight:
                "90vh",

              overflowY:
                "auto",

              borderRadius:
                "22px",

              padding:
                "2.25rem",

              boxShadow:
                "0 25px 70px rgba(3, 24, 32, 0.28)",
            }}
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
              style={{
                position:
                  "absolute",

                top:
                  "1.25rem",

                right:
                  "1.25rem",

                width:
                  "42px",

                height:
                  "42px",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                border:
                  "1px solid var(--line)",

                borderRadius:
                  "50%",

                background:
                  "white",

                color:
                  "var(--deep-water)",

                cursor:
                  "pointer",
              }}
            >
              <X size={20} />
            </button>


            <span className="eyebrow">
              Contact Message
            </span>

            <h2
              style={{
                paddingRight:
                  "3rem",
              }}
            >
              {
                selectedMessage.subject
              }
            </h2>


            <div
              style={{
                display:
                  "grid",

                gap:
                  "0.55rem",

                marginTop:
                  "1rem",
              }}
            >
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
            <div
              style={{
                marginBottom:
                  "2rem",
              }}
            >
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
            <div
              style={{
                marginBottom:
                  "2rem",
              }}
            >
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
                      style={{
                        padding:
                          "1rem",

                        marginTop:
                          "1rem",

                        border:
                          "1px solid var(--line)",

                        borderRadius:
                          "14px",

                        background:
                          "rgba(18, 184, 199, 0.035)",
                      }}
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
              style={{
                marginTop:
                  "2rem",
              }}
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
                style={{
                  width:
                    "100%",

                  padding:
                    "1rem",

                  marginTop:
                    "0.75rem",

                  resize:
                    "vertical",

                  border:
                    "1px solid var(--line)",

                  borderRadius:
                    "12px",

                  font:
                    "inherit",
                }}
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
