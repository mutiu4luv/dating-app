import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack, WhatsApp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../api/Api";

const whatsappNumber = "2347040356844";

const ContactUs = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    contactUs: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await api.post("/contact", form);
      setMessage("Your message has been sent. Admin will review it shortly.");
      setForm({ name: "", email: "", phoneNumber: "", contactUs: "" });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 8,
        px: 1.5,
        background:
          "linear-gradient(135deg, #181c2b 0%, #2d0052 48%, #D9A4F0 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 2,
            color: "#fff",
            textTransform: "none",
            fontWeight: 900,
            bgcolor: "rgba(255,255,255,0.12)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
          }}
        >
          Back
        </Button>

        <Paper
          elevation={14}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.28)",
          }}
        >
          <Typography variant="h4" fontWeight={950} color="#2d0052" mb={1}>
            Contact Us
          </Typography>
          <Typography color="#6b4679" mb={3}>
            Send your complaint or support request. You can also reach us
            directly on WhatsApp.
          </Typography>

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <TextField
              name="name"
              label="Name"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="phoneNumber"
              label="Phone Number"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="contactUs"
              label="Contact Us"
              value={form.contactUs}
              onChange={handleChange}
              required
              multiline
              minRows={5}
              fullWidth
            />

            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.2,
                bgcolor: "#2d0052",
                fontWeight: 900,
                textTransform: "none",
                "&:hover": { bgcolor: "#4b087c" },
              }}
            >
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </Stack>
        </Paper>
      </Container>

      <IconButton
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Contact us on WhatsApp"
        sx={{
          position: "fixed",
          right: 18,
          bottom: { xs: 92, sm: 24 },
          zIndex: 1700,
          width: 58,
          height: 58,
          bgcolor: "#25D366",
          color: "#fff",
          boxShadow: "0 16px 36px rgba(0,0,0,0.28)",
          "&:hover": { bgcolor: "#1ebe5d" },
        }}
      >
        <WhatsApp fontSize="large" />
      </IconButton>
    </Box>
  );
};

export default ContactUs;
