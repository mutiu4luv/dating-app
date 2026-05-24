import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
  Dialog,
  DialogContent,
  Chip,
  Stack,
  useMediaQuery,
  Popover,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplyIcon from "@mui/icons-material/Reply";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { requestNotificationPermission } from "../../utility/notifications";
import { cloudinaryImage } from "../../utility/cloudinaryImage";

const CHAT_PAGE_SIZE = 40;
const MESSAGE_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const getCachedReceiver = (memberId) => {
  if (!memberId) return null;
  try {
    return JSON.parse(sessionStorage.getItem(`chatReceiver_${memberId}`));
  } catch {
    return null;
  }
};

const cacheReceiver = (member) => {
  if (!member?._id) return;
  sessionStorage.setItem(`chatReceiver_${member._id}`, JSON.stringify(member));
};

const getSenderId = (message) =>
  typeof message.senderId === "object" ? message.senderId?._id : message.senderId;

const getActivityLabel = (user) => {
  if (user?.isOnline) return "Online now";
  if (!user?.lastSeen) return "Activity not available";

  const lastSeen = new Date(user.lastSeen);
  if (Number.isNaN(lastSeen.getTime())) return "Activity not available";

  const hours = (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60);
  if (hours <= 24) return "Active today";
  if (hours <= 48) return "Recently online";
  if (hours <= 24 * 7) return "Active this week";
  return "Away for a while";
};

const getReplyText = (message) => {
  if (!message) return "";
  if (message.deletedForEveryone) return "This message was deleted";
  return message.content || (message.imageUrl ? "Photo" : "Message");
};

const canEditMessage = (message, currentUserId) => {
  if (!message?.content || message.deletedForEveryone) return false;
  if (getSenderId(message) !== currentUserId) return false;

  const sentAt = new Date(message.createdAt).getTime();
  if (Number.isNaN(sentAt)) return false;
  return Date.now() - sentAt <= 20 * 60 * 1000;
};

const formatMessageTime = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Chat = () => {
  const { member1, member2 } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const room = [member1, member2].sort().join("_");
  const initialReceiver =
    location.state?.member || location.state?.receiver || getCachedReceiver(member2);

  const [socketInstance, setSocketInstance] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(initialReceiver);
  const [actionAnchor, setActionAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reactionAnchor, setReactionAnchor] = useState(null);
  const [reactionMessage, setReactionMessage] = useState(null);
  const messagesEndRef = useRef();
  const imageInputRef = useRef(null);
  const swipeRef = useRef({ messageId: null, x: 0, y: 0 });
  const longPressTimerRef = useRef(null);
  const isPrependingMessagesRef = useRef(false);
  const token = localStorage.getItem("token");
  const isSmallDialog = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const askForNotifications = () => {
      requestNotificationPermission();
    };

    window.addEventListener("click", askForNotifications, { once: true });
    window.addEventListener("touchstart", askForNotifications, { once: true });

    return () => {
      window.removeEventListener("click", askForNotifications);
      window.removeEventListener("touchstart", askForNotifications);
    };
  }, []);

  // Prevent chatting with self
  useEffect(() => {
    if (member1 === member2) {
      alert("❌ You can't chat with yourself.");
      navigate("/");
    }
  }, [member1, member2, navigate]);

  // Initialize socket
  useEffect(() => {
    const newSocket = io(
      import.meta.env.VITE_BASE_URL ||
        import.meta.env.VITE_BACKEND_URL ||
        "http://localhost:7000",
      {
        transports: ["websocket", "polling"],
      }
    );

    if (member1) {
      newSocket.emit("register_user", member1);
    }

    setSocketInstance(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [member1]);

  // Join room and receive messages
  useEffect(() => {
    if (!socketInstance || !member1 || !member2) return;

    socketInstance.emit("join_room", room);

    const handleReceive = (data) => {
      if (data.room === room) {
        setMessages((prev) => [...prev, data]);
        return;
      }

      if (data.receiverId === member1) return;
    };

    const handleMessageEdited = (updatedMessage) => {
      setMessages((prev) =>
        prev.map((item) =>
          item._id === updatedMessage._id ? { ...item, ...updatedMessage } : item
        )
      );
    };

    const handleMessageDeleted = ({ message, messageId, mode }) => {
      setMessages((prev) => {
        if (mode === "me") {
          return prev.filter((item) => item._id !== messageId);
        }
        return prev.map((item) =>
          item._id === message._id ? { ...item, ...message } : item
        );
      });
    };

    const handleMessageReacted = (updatedMessage) => {
      setMessages((prev) =>
        prev.map((item) =>
          item._id === updatedMessage._id ? { ...item, ...updatedMessage } : item
        )
      );
    };

    const handlePresenceUpdate = (data) => {
      if (data.userId === member2) {
        setReceiver((prev) =>
          prev
            ? {
                ...prev,
                isOnline: data.isOnline,
                lastSeen: data.lastSeen,
              }
            : prev
        );
      }
    };

    socketInstance.on("receive_message", handleReceive);
    socketInstance.on("message_edited", handleMessageEdited);
    socketInstance.on("message_deleted", handleMessageDeleted);
    socketInstance.on("message_reacted", handleMessageReacted);
    socketInstance.on("presence_update", handlePresenceUpdate);

    return () => {
      socketInstance.off("receive_message", handleReceive);
      socketInstance.off("message_edited", handleMessageEdited);
      socketInstance.off("message_deleted", handleMessageDeleted);
      socketInstance.off("message_reacted", handleMessageReacted);
      socketInstance.off("presence_update", handlePresenceUpdate);
    };
  }, [socketInstance, room, member1, member2]);

  // Fetch latest chat messages first, then hydrate older messages quietly.
  useEffect(() => {
    if (!member1 || !member2) return;
    let cancelled = false;

    const normalizeChatResponse = (payload) =>
      Array.isArray(payload)
        ? { messages: payload, hasMore: false, nextBefore: null }
        : {
            messages: payload?.messages || [],
            hasMore: Boolean(payload?.hasMore),
            nextBefore: payload?.nextBefore || payload?.messages?.[0]?.createdAt,
          };

    const fetchChatPage = async (before) => {
      const params = new URLSearchParams({
        member1,
        member2,
        latest: "true",
        limit: String(CHAT_PAGE_SIZE),
      });
      if (before) params.set("before", before);

      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/chat?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return normalizeChatResponse(res.data);
    };

    const prependOlderMessages = (olderMessages) => {
      if (!olderMessages.length) return;
      isPrependingMessagesRef.current = true;
      setMessages((current) => {
        const existingIds = new Set(current.map((item) => item._id));
        const uniqueOlder = olderMessages.filter((item) => !existingIds.has(item._id));
        return [...uniqueOlder, ...current];
      });
    };

    const fetchChats = async () => {
      try {
        const firstPage = await fetchChatPage();
        if (cancelled) return;

        setMessages(firstPage.messages);

        let nextBefore = firstPage.nextBefore;
        let hasMore = firstPage.hasMore;

        while (!cancelled && hasMore && nextBefore) {
          await new Promise((resolve) => window.setTimeout(resolve, 350));
          const olderPage = await fetchChatPage(nextBefore);
          if (cancelled) return;
          prependOlderMessages(olderPage.messages);
          nextBefore = olderPage.nextBefore;
          hasMore = olderPage.hasMore;
        }
      } catch (err) {
        console.log("🔥 Chat fetch error:", err.response?.data || err.message);
        if (err.response?.status === 403) {
          alert(err.response.data?.error || "Renew your subscription to chat.");
          navigate(`/merge/${member1}/${member2}`);
        }
      }
    };

    fetchChats();

    return () => {
      cancelled = true;
    };
  }, [member1, member2, navigate, token]);

  // Fetch receiver info
  useEffect(() => {
    if (!member2) return;

    const fetchReceiver = async () => {
      try {
        const profileRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/public-profile/${member2}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const member = profileRes.data?.member || profileRes.data;
        setReceiver(member);
        cacheReceiver(member);
      } catch (err) {
        try {
          const fallbackRes = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/user/${member2}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setReceiver(fallbackRes.data);
          cacheReceiver(fallbackRes.data);
        } catch (fallbackErr) {
          console.log(
            "🔥 Failed to fetch receiver info:",
            fallbackErr.response?.data || err.response?.data || fallbackErr
          );
        }
      }
    };

    fetchReceiver();
  }, [member2, token]);
  // Mark messages as read
  useEffect(() => {
    if (!member1 || !member2) return;

    const markAsRead = async () => {
      try {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/api/chat/read/${member1}`,
          { otherUserId: member2 },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        window.dispatchEvent(new CustomEvent("unreadReset"));
      } catch (err) {
        console.error("❌ Failed to mark messages as read", err);
      }
    };

    markAsRead();
  }, [member1, member2, token]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isPrependingMessagesRef.current) {
      isPrependingMessagesRef.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if ((!message.trim() && !selectedImage) || !socketInstance || sending) {
      return;
    }

    requestNotificationPermission();

    const formData = new FormData();
    formData.append("senderId", member1);
    formData.append("receiverId", member2);
    formData.append("content", message);
    formData.append("room", room);
    if (replyingTo) {
      formData.append(
        "replyTo",
        JSON.stringify({
          messageId: replyingTo._id,
          senderId: getSenderId(replyingTo),
          content: replyingTo.content || "",
          imageUrl: replyingTo.imageUrl || "",
        })
      );
    }
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      setSending(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/chat/save`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Save to UI
      setMessages((prev) => [...prev, res.data]);

      // Backend broadcasts the saved message to the receiver and room.
    } catch (err) {
      console.log(
        "🔥 ERROR SENDING MESSAGE:",
        err.response?.data || err.message
      );
      if (err.response?.status === 403) {
          alert(
            err.response.data?.error ||
              "You have reached your monthly chat limit."
          );
          navigate(`/merge/${member1}/${member2}`);
        }
      return;
    } finally {
      setSending(false);
    }

    setMessage("");
    setReplyingTo(null);
    setSelectedImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const closeActionMenu = () => {
    setActionAnchor(null);
    setSelectedMessage(null);
  };

  const closeReactionPicker = () => {
    setReactionAnchor(null);
    setReactionMessage(null);
  };

  const openReactionPicker = (event, msg) => {
    if (msg.deletedForEveryone) return;
    setReactionAnchor(event.currentTarget);
    setReactionMessage(msg);
  };

  const startLongPressReaction = (event, msg) => {
    if (msg.deletedForEveryone) return;
    window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = window.setTimeout(() => {
      openReactionPicker(event, msg);
    }, 520);
  };

  const clearLongPressReaction = () => {
    window.clearTimeout(longPressTimerRef.current);
  };

  const beginReply = (msg) => {
    setReplyingTo(msg);
    setEditingMessage(null);
    closeActionMenu();
  };

  const handleSwipeStart = (event, msg) => {
    const touch = event.touches?.[0];
    if (!touch || msg.deletedForEveryone) return;
    swipeRef.current = {
      messageId: msg._id,
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleSwipeEnd = (event, msg) => {
    const touch = event.changedTouches?.[0];
    const start = swipeRef.current;
    if (!touch || start.messageId !== msg._id || msg.deletedForEveryone) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) >= 56 && Math.abs(deltaY) <= 42) {
      beginReply(msg);
    }
  };

  const beginEdit = (msg) => {
    setEditingMessage(msg);
    setReplyingTo(null);
    setMessage(msg.content || "");
    closeActionMenu();
  };

  const editMessage = async () => {
    if (!editingMessage || !message.trim()) return;

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/chat/message/${editingMessage._id}`,
        { content: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) =>
        prev.map((item) => (item._id === res.data._id ? res.data : item))
      );
      socketInstance?.emit("message_edited", res.data);
      setEditingMessage(null);
      setMessage("");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to edit this message.");
    }
  };

  const deleteMessage = async (mode) => {
    if (!selectedMessage) return;

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/chat/message/${selectedMessage._id}`,
        {
          data: { mode },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.mode === "me") {
        setMessages((prev) =>
          prev.filter((item) => item._id !== res.data.messageId)
        );
      } else {
        setMessages((prev) =>
          prev.map((item) =>
            item._id === res.data.message._id ? res.data.message : item
          )
        );
        socketInstance?.emit("message_deleted", res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete this message.");
    } finally {
      closeActionMenu();
    }
  };

  const reactToMessage = async (emoji) => {
    if (!reactionMessage) return;

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/chat/message/${reactionMessage._id}/reaction`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) =>
        prev.map((item) => (item._id === res.data._id ? res.data : item))
      );
      socketInstance?.emit("message_reacted", res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to react to this message.");
    } finally {
      closeReactionPicker();
    }
  };

  const receiverName = receiver?.username || receiver?.name || "";
  const receiverPhoto = cloudinaryImage(receiver?.photo, {
    width: 640,
    height: 640,
    crop: "fill",
    quality: "auto:best",
  });
  const receiverLargePhoto = cloudinaryImage(receiver?.photo, {
    width: 1100,
    crop: "limit",
    quality: "auto:best",
  });
  const receiverDescription =
    receiver?.description || receiver?.bio || receiver?.about || "";

  const profileDetails = [
    ["Gender", receiver?.gender || "Not provided"],
    ["Location", receiver?.location || "Not provided"],
    ["Occupation", receiver?.occupation || "Not provided"],
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      maxWidth="600px"
      mx="auto"
      pt={2}
      sx={{
        backgroundColor: "#121212",
        color: "#fff",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        px={1.5}
        pb={1.5}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          bgcolor: "#121212",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          aria-label="Go back"
          sx={{
            color: "#fff",
            bgcolor: "rgba(255,255,255,0.08)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box flex={1} textAlign="center" minWidth={0}>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            {receiverName ? (
              <>
                Chat with <strong>{receiverName}</strong>
              </>
            ) : (
              "Chat"
            )}
          </Typography>
          <Typography
            component="span"
            variant="caption"
            sx={{
              display: "block",
              color: receiver?.isOnline ? "#4ade80" : "#9ca3af",
              mt: 0.5,
            }}
          >
            {receiver ? getActivityLabel(receiver) : "Loading profile..."}
          </Typography>
        </Box>
        <IconButton
          onClick={() => receiver && setProfileOpen(true)}
          aria-label={`View ${receiverName || "member"} profile`}
          disabled={!receiver}
          sx={{
            p: 0.35,
            border: "2px solid rgba(217,164,240,0.75)",
            boxShadow: receiver?.isOnline
              ? "0 0 0 3px rgba(74,222,128,0.22)"
              : "none",
          }}
        >
          <Avatar
            src={receiverPhoto}
            alt={receiverName || "Member"}
            imgProps={{ loading: "eager" }}
            sx={{
              width: 44,
              height: 44,
              bgcolor: "#D9A4F0",
              color: "#2d0052",
              fontWeight: 900,
            }}
          >
            {(receiverName || "?").charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </Box>

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          mb: 2,
          borderRadius: 3,
          background: "#1e1e1e",
        }}
      >
        <List>
          {messages.map((msg) => {
            const isMine = getSenderId(msg) === member1;
            const isReplyTarget = replyingTo?._id === msg._id;

            return (
              <ListItem
                key={msg._id}
                onContextMenu={(event) => {
                  event.preventDefault();
                  openReactionPicker(event, msg);
                }}
                onMouseDown={(event) => startLongPressReaction(event, msg)}
                onMouseUp={clearLongPressReaction}
                onMouseLeave={clearLongPressReaction}
                onTouchStart={(event) => {
                  handleSwipeStart(event, msg);
                  startLongPressReaction(event, msg);
                }}
                onTouchMove={clearLongPressReaction}
                onTouchEnd={(event) => {
                  clearLongPressReaction();
                  handleSwipeEnd(event, msg);
                }}
                sx={{
                  justifyContent: isMine ? "flex-end" : "flex-start",
                  alignItems: "flex-start",
                  gap: 0.5,
                  touchAction: "pan-y",
                  transition: "background 160ms ease",
                  bgcolor: isReplyTarget
                    ? "rgba(144,202,249,0.12)"
                    : reactionMessage?._id === msg._id
                    ? "rgba(217,164,240,0.14)"
                    : "transparent",
                  borderRadius: 2,
                }}
              >
                {isMine && !msg.deletedForEveryone && (
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      setActionAnchor(event.currentTarget);
                      setSelectedMessage(msg);
                    }}
                    sx={{ color: "#cbd5e1", mt: 0.5 }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )}

                <ListItemText
                  primary={
                    <Box>
                      {msg.replyTo?.messageId && (
                        <Box
                          sx={{
                            borderLeft: "3px solid #f8c7ff",
                            bgcolor: "rgba(255,255,255,0.14)",
                            borderRadius: 1,
                            px: 1,
                            py: 0.75,
                            mb: 1,
                          }}
                        >
                          <Typography fontSize={11} fontWeight={900}>
                            Replying to message
                          </Typography>
                          <Typography fontSize={12} noWrap>
                            {msg.replyTo.content ||
                              (msg.replyTo.imageUrl ? "Photo" : "Message")}
                          </Typography>
                        </Box>
                      )}

                      {msg.deletedForEveryone ? (
                        <>
                          <Typography fontStyle="italic" color="rgba(255,255,255,0.75)">
                            This message was deleted
                          </Typography>
                          <Typography
                            fontSize={10}
                            color="rgba(255,255,255,0.72)"
                            textAlign="right"
                            mt={0.5}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </Typography>
                        </>
                      ) : (
                        <>
                          {msg.imageUrl && (
                            <Box
                              component="img"
                              src={msg.imageUrl}
                              alt="Chat upload"
                              sx={{
                                width: "100%",
                                maxHeight: 260,
                                objectFit: "cover",
                                borderRadius: 2,
                                mb: msg.content ? 1 : 0,
                              }}
                            />
                          )}
                          {msg.content && <Typography>{msg.content}</Typography>}
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="flex-end"
                            gap={0.75}
                            mt={0.5}
                          >
                            {msg.editedAt && (
                              <Typography fontSize={10} color="rgba(255,255,255,0.7)">
                                Edited
                              </Typography>
                            )}
                            <Typography fontSize={10} color="rgba(255,255,255,0.72)">
                              {formatMessageTime(msg.createdAt)}
                            </Typography>
                          </Box>
                          {Array.isArray(msg.reactions) &&
                            msg.reactions.length > 0 && (
                              <Box display="flex" gap={0.5} mt={0.75} flexWrap="wrap">
                                {msg.reactions.map((reaction) => (
                                  <Box
                                    key={`${reaction.userId}-${reaction.emoji}`}
                                    component="span"
                                    sx={{
                                      px: 0.8,
                                      py: 0.15,
                                      borderRadius: 999,
                                      bgcolor: "rgba(255,255,255,0.18)",
                                      fontSize: 14,
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    {reaction.emoji}
                                  </Box>
                                ))}
                              </Box>
                            )}
                        </>
                      )}
                    </Box>
                  }
                  sx={{
                    background: isMine ? "#2979ff" : "#424242",
                    color: "#fff",
                    p: 1.5,
                    borderRadius: "12px",
                    maxWidth: "75%",
                    border: isReplyTarget
                      ? "2px solid #90caf9"
                      : "2px solid transparent",
                    boxShadow: isReplyTarget
                      ? "0 0 0 3px rgba(144,202,249,0.18)"
                      : "none",
                  }}
                />

                {!isMine && !msg.deletedForEveryone && (
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      setActionAnchor(event.currentTarget);
                      setSelectedMessage(msg);
                    }}
                    sx={{ color: "#cbd5e1", mt: 0.5 }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )}
              </ListItem>
            );
          })}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      {selectedImage && (
        <Box
          mx={2}
          mb={1}
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ color: "#fff" }}
        >
          <Typography variant="body2" noWrap flex={1}>
            {selectedImage.name}
          </Typography>
          <IconButton
            size="small"
            color="inherit"
            onClick={() => {
              setSelectedImage(null);
              if (imageInputRef.current) imageInputRef.current.value = "";
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {(replyingTo || editingMessage) && (
        <Box
          mx={2}
          mb={1}
          p={1.25}
          sx={{
            borderLeft: "4px solid #90caf9",
            bgcolor: "#202a36",
            borderRadius: 1.5,
            color: "#fff",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <ReplyIcon fontSize="small" />
            <Box flex={1} minWidth={0}>
              <Typography fontSize={12} fontWeight={900}>
                {editingMessage ? "Editing message" : "Replying to message"}
              </Typography>
              <Typography fontSize={12} noWrap color="#cbd5e1">
                {editingMessage
                  ? editingMessage.content
                  : getReplyText(replyingTo)}
              </Typography>
              {!editingMessage && (
                <Typography fontSize={11} color="#90caf9">
                  Swipe any message left or right to reply faster.
                </Typography>
              )}
            </Box>
            <IconButton
              size="small"
              color="inherit"
              onClick={() => {
                setReplyingTo(null);
                setEditingMessage(null);
                setMessage("");
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      <Box display="flex" gap={1} px={2} pb={2}>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
        />
        <IconButton
          color="primary"
          onClick={() => imageInputRef.current?.click()}
          sx={{ backgroundColor: "#2a2a2a" }}
        >
          <ImageIcon />
        </IconButton>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (editingMessage) editMessage();
            else sendMessage();
          }}
          sx={{
            input: { color: "#fff" },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#2a2a2a",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={editingMessage ? editMessage : sendMessage}
          disabled={
            sending ||
            (editingMessage ? !message.trim() : !message.trim() && !selectedImage)
          }
        >
          {sending ? "Sending" : editingMessage ? "Save" : "Send"}
        </Button>
      </Box>

      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
        onClose={closeActionMenu}
      >
        {selectedMessage && !selectedMessage.deletedForEveryone && (
          <MenuItem onClick={() => beginReply(selectedMessage)}>Reply</MenuItem>
        )}
        {selectedMessage &&
          canEditMessage(selectedMessage, member1) && (
            <MenuItem onClick={() => beginEdit(selectedMessage)}>Edit</MenuItem>
          )}
        {selectedMessage && (
          <MenuItem onClick={() => deleteMessage("me")}>Delete for me</MenuItem>
        )}
        {selectedMessage &&
          getSenderId(selectedMessage) === member1 &&
          !selectedMessage.deletedForEveryone && (
            <MenuItem onClick={() => deleteMessage("everyone")}>
              Delete for everyone
            </MenuItem>
          )}
      </Menu>

      <Popover
        open={Boolean(reactionAnchor)}
        anchorEl={reactionAnchor}
        onClose={closeReactionPicker}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        PaperProps={{
          sx: {
            borderRadius: 999,
            bgcolor: "#fff",
            boxShadow: "0 18px 46px rgba(0,0,0,0.28)",
            border: "1px solid rgba(217,164,240,0.45)",
            p: 0.75,
          },
        }}
      >
        <Box display="flex" gap={0.5}>
          {MESSAGE_REACTIONS.map((emoji) => (
            <IconButton
              key={emoji}
              size="small"
              onClick={() => reactToMessage(emoji)}
              sx={{
                fontSize: 22,
                width: 38,
                height: 38,
                "&:hover": {
                  bgcolor: "#fbf5ff",
                  transform: "translateY(-2px)",
                },
              }}
            >
              {emoji}
            </IconButton>
          ))}
        </Box>
      </Popover>

      <Dialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isSmallDialog}
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 4 },
            overflow: "hidden",
            height: { xs: "100dvh", sm: "auto" },
            maxHeight: { xs: "100dvh", sm: "calc(100dvh - 24px)" },
            display: "flex",
            background: "#fff",
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Box
            sx={{
              position: "relative",
              background:
                "linear-gradient(135deg, rgba(45,0,82,0.98), rgba(139,59,168,0.92))",
            }}
          >
            <IconButton
              onClick={() => setProfileOpen(false)}
              aria-label="Close profile"
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 2,
                color: "#fff",
                bgcolor: "rgba(0,0,0,0.28)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.42)" },
              }}
            >
              <CloseIcon />
            </IconButton>

            {receiverLargePhoto ? (
              <Box
                component="img"
                src={receiverLargePhoto}
                alt={receiverName}
                sx={{
                  width: "100%",
                  height: { xs: "42dvh", sm: 320 },
                  minHeight: { xs: 230, sm: 320 },
                  maxHeight: { xs: 360, sm: 320 },
                  display: "block",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            ) : (
              <Box
                sx={{
                  height: { xs: "36dvh", sm: 320 },
                  minHeight: { xs: 220, sm: 320 },
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Avatar
                  sx={{
                    width: 132,
                    height: 132,
                    bgcolor: "#D9A4F0",
                    color: "#2d0052",
                    fontSize: 54,
                    fontWeight: 900,
                  }}
                >
                  {(receiverName || "?").charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Box>

          <Box sx={{ p: { xs: 2.25, sm: 3 } }}>
          <Box display="flex" alignItems="flex-start" gap={1.5} mb={2}>
            <Box flex={1} minWidth={0}>
              <Typography variant="h5" fontWeight={900} color="#2d0052">
                {receiverName}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={900}
                color="#8b3ba8"
                textTransform="uppercase"
              >
                Profile details shared with you
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Description, occupation, location, and gender are shown below to
                help you know who you are chatting with.
              </Typography>
            </Box>
            <Chip
              label={getActivityLabel(receiver)}
              size="small"
              sx={{
                bgcolor: receiver?.isOnline ? "#dcfce7" : "#f3e8ff",
                color: receiver?.isOnline ? "#166534" : "#2d0052",
                fontWeight: 900,
              }}
            />
          </Box>

          <Box
            sx={{
              p: 1.5,
              mb: 1.5,
              borderRadius: 2,
              bgcolor: "#fff",
              border: "1px solid rgba(217,164,240,0.45)",
              boxShadow: "0 10px 28px rgba(45,0,82,0.08)",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={900}
              textTransform="uppercase"
            >
              Description
            </Typography>
            <Typography color="#2d0052" fontWeight={700} mt={0.5}>
              {receiverDescription || "No description added yet."}
            </Typography>
          </Box>

          <Stack spacing={1.2}>
            {profileDetails.map(([label, value]) => (
              <Box
                key={label}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "140px 1fr" },
                  gap: { xs: 0.25, sm: 1.5 },
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: "#fbf5ff",
                  border: "1px solid rgba(217,164,240,0.35)",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={900}
                  textTransform="uppercase"
                >
                  {label}
                </Typography>
                <Typography fontWeight={800} color="#2d0052">
                  {value}
                </Typography>
              </Box>
            ))}
          </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Chat;
