import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import api from "../../components/api/Api"; // <-- Your API setup file
import { useParams } from "react-router-dom";

const ChatScreen = () => {
  const { member2 } = useParams();
  const member1 = localStorage.getItem("userId");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef(null);

  useEffect(() => {
    // Fetch existing messages between member1 and member2
    const fetchMessages = async () => {
      try {
        const res = await api.get(
          `/chat?member1=${member1}&member2=${member2}`
        );
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    fetchMessages();
  }, [member1, member2]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      sender: member1,
      receiver: member2,
      content: newMessage.trim(),
    };

    try {
      const res = await api.post("/chat/send", messageData);
      setMessages((prev) => [...prev, res.data.message]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      p={2}
      sx={{ bgcolor: "#f0f2f5" }}
    >
      <Paper elevation={3} sx={{ p: 2, mb: 2, textAlign: "center" }}>
        <Typography variant="h6" fontWeight="bold">
          Chat Room
        </Typography>
        <Typography variant="body2">You're chatting with {member2}</Typography>
      </Paper>

      <Paper
        elevation={1}
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          bgcolor: "#ffffff",
          borderRadius: 2,
        }}
      >
        <List>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent:
                  msg.sender === member1 ? "flex-end" : "flex-start",
              }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: msg.sender === member1 ? "#1976d2" : "#e0e0e0",
                  color: msg.sender === member1 ? "#fff" : "#000",
                  maxWidth: "70%",
                  borderRadius: 3,
                }}
              >
                <ListItemText primary={msg.content} />
              </Paper>
            </ListItem>
          ))}
          <div ref={messageEndRef} />
        </List>
      </Paper>

      <Divider sx={{ my: 1 }} />

      <Box display="flex" gap={1} mt={1}>
        <TextField
          variant="outlined"
          placeholder="Type a message..."
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
        />
        <IconButton color="primary" onClick={handleSendMessage}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatScreen;
