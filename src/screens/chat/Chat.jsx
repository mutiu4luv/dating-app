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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplyIcon from "@mui/icons-material/Reply";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { requestNotificationPermission } from "../../utility/notifications";

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

const Chat = () => {
  const { member1, member2 } = useParams();
  const navigate = useNavigate();
  const room = [member1, member2].sort().join("_");

  const [socketInstance, setSocketInstance] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [actionAnchor, setActionAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const messagesEndRef = useRef();
  const imageInputRef = useRef(null);
  const swipeRef = useRef({ messageId: null, x: 0, y: 0 });
  const token = localStorage.getItem("token");

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
  }, [member1, member2]);

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
  }, []);

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
    socketInstance.on("presence_update", handlePresenceUpdate);

    return () => {
      socketInstance.off("receive_message", handleReceive);
      socketInstance.off("message_edited", handleMessageEdited);
      socketInstance.off("message_deleted", handleMessageDeleted);
      socketInstance.off("presence_update", handlePresenceUpdate);
    };
  }, [socketInstance, room, member1, member2]);

  // Fetch chat history once
  useEffect(() => {
    if (!member1 || !member2) return;

    const fetchChats = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/chat?member1=${member1}&member2=${member2}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMessages(res.data);
      } catch (err) {
        console.log("🔥 Chat fetch error:", err.response?.data || err.message);
        if (err.response?.status === 403) {
          alert(err.response.data?.error || "Renew your subscription to chat.");
          navigate(`/merge/${member1}/${member2}`);
        }
      }
    };

    fetchChats();
  }, [member1, member2, navigate, token]);

  // Fetch receiver info
  useEffect(() => {
    if (!member2) return;

    const fetchReceiver = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/single/${member2}`
        );
        setReceiver(res.data);
      } catch (err) {
        console.log("🔥 Failed to fetch receiver info:", err);
      }
    };

    fetchReceiver();
  }, [member2]);
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
        sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
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
        <Box flex={1} textAlign="center" pr={5}>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            Chat with <strong>{receiver?.username || "User"}</strong>
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
            {getActivityLabel(receiver)}
          </Typography>
        </Box>
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
                onTouchStart={(event) => handleSwipeStart(event, msg)}
                onTouchEnd={(event) => handleSwipeEnd(event, msg)}
                sx={{
                  justifyContent: isMine ? "flex-end" : "flex-start",
                  alignItems: "flex-start",
                  gap: 0.5,
                  touchAction: "pan-y",
                  transition: "background 160ms ease",
                  bgcolor: isReplyTarget
                    ? "rgba(144,202,249,0.12)"
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
                        <Typography fontStyle="italic" color="rgba(255,255,255,0.75)">
                          This message was deleted
                        </Typography>
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
                          {msg.editedAt && (
                            <Typography fontSize={10} color="rgba(255,255,255,0.7)" mt={0.5}>
                              Edited
                            </Typography>
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
    </Box>
  );
};

export default Chat;
