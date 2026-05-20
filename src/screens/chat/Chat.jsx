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
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

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
  const messagesEndRef = useRef();
  const imageInputRef = useRef(null);
  const token = localStorage.getItem("token");

  // Prevent chatting with self
  useEffect(() => {
    if (member1 === member2) {
      alert("❌ You can't chat with yourself.");
      navigate("/");
    }
  }, [member1, member2]);

  // Initialize socket
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BASE_URL, {
      transports: ["websocket"],
    });

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
      setMessages((prev) => [...prev, data]);
    };

    socketInstance.on("receive_message", handleReceive);

    return () => {
      socketInstance.off("receive_message", handleReceive);
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

    const formData = new FormData();
    formData.append("senderId", member1);
    formData.append("receiverId", member2);
    formData.append("content", message);
    formData.append("room", room);
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

      // Broadcast
      socketInstance.emit("send_message", res.data);
    } catch (err) {
      console.log(
        "🔥 ERROR SENDING MESSAGE:",
        err.response?.data || err.message
      );
      if (err.response?.status === 403) {
        alert(err.response.data?.error || "Renew your subscription to chat.");
        navigate(`/merge/${member1}/${member2}`);
      }
      return;
    } finally {
      setSending(false);
    }

    setMessage("");
    setSelectedImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
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
      <Typography variant="h6" align="center" gutterBottom sx={{ mb: 2 }}>
        Chat with <strong>{receiver?.username || "User"}</strong>
      </Typography>

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
          {messages.map((msg, i) => (
            <ListItem
              key={i}
              sx={{
                justifyContent:
                  msg.senderId === member1 ? "flex-end" : "flex-start",
              }}
            >
              <ListItemText
                primary={
                  <Box>
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
                  </Box>
                }
                sx={{
                  background: msg.senderId === member1 ? "#2979ff" : "#424242",
                  color: "#fff",
                  p: 1.5,
                  borderRadius: "12px",
                  maxWidth: "75%",
                }}
              />
            </ListItem>
          ))}
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
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          sx={{
            input: { color: "#fff" },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#2a2a2a",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={sending || (!message.trim() && !selectedImage)}
        >
          {sending ? "Sending" : "Send"}
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
