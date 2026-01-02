import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

const Chat = () => {
  const { member1, member2 } = useParams();
  const navigate = useNavigate();
  const room = [member1, member2].sort().join("_");

  const [socketInstance, setSocketInstance] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const messagesEndRef = useRef();

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
          }/api/chat?member1=${member1}&member2=${member2}`
        );

        setMessages(res.data);
      } catch (err) {
        console.log("🔥 Chat fetch error:", err.response?.data || err.message);
      }
    };

    fetchChats();
  }, [member1, member2]);

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

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !socketInstance) return;

    const data = {
      senderId: member1,
      receiverId: member2,
      content: message,
      room,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/chat/save`,
        data
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
      return;
    }

    setMessage("");
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
                primary={msg.content}
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

      <Box display="flex" gap={1} px={2} pb={2}>
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
          disabled={!message.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
