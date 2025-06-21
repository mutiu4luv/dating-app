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

const socket = io(import.meta.env.VITE_BASE_URL);

const Chat = () => {
  const { member1, member2 } = useParams(); // ✅ Get both IDs from URL
  const navigate = useNavigate();
  const room = [member1, member2].sort().join("_");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const messagesEndRef = useRef();

  // Guard against chatting with yourself
  useEffect(() => {
    if (member1 === member2) {
      alert("❌ You can't chat with yourself.");
      navigate("/");
    }
  }, [member1, member2]);

  // Join socket room
  useEffect(() => {
    if (!room.includes("undefined")) {
      socket.emit("join_room", room);
      socket.on("receive_message", (data) => {
        setMessages((prev) => [...prev, data]);
      });
    }

    return () => {
      socket.off("receive_message");
    };
  }, [room]);

  // Fetch chat history
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/chat?member1=${member1}&member2=${member2}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
      }
    };

    if (member1 && member2) fetchChats();
  }, [member1, member2]);

  // Fetch receiver info
  useEffect(() => {
    const fetchReceiver = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/single/${member2}`
        );
        setReceiver(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch receiver info", err);
      }
    };

    if (member2) fetchReceiver();
  }, [member2]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!message.trim()) return;

    const data = {
      senderId: member1,
      receiverId: member2,
      content: message,
      room,
    };

    console.log("Sending:", data);

    socket.emit("send_message", data);

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/chat/save`, data);
    } catch (err) {
      console.error("❌ Failed to save message:", err);
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
    >
      <Typography variant="h5" align="center" gutterBottom>
        Chat with {receiver?.username || "User"}
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          mb: 2,
          borderRadius: 2,
          background: "#f9f9f9",
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
                  background: msg.senderId === member1 ? "#1976d2" : "#e0e0e0",
                  color: msg.senderId === member1 ? "#fff" : "#000",
                  p: 1.5,
                  borderRadius: 2,
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
        />
        <Button
          variant="contained"
          color="primary"
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
