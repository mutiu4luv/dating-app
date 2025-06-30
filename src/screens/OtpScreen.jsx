import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Stack,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OtpScreen = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/user/register/send-otp`,
        { email }
      );
      setMessage("OTP sent. Proceed to complete registration.");
      localStorage.setItem("registerEmail", email); // save for step 2
      navigate("/register");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to send OTP. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background:
          "linear-gradient(135deg, #f9fafb 0%, #fbc2eb 50%, #a6c1ee 100%)",
        py: 6,
        px: { xs: 1, sm: 2, md: 4 },
      }}
    >
      <Paper
        elevation={12}
        sx={{
          p: 4,
          borderRadius: 5,
          minWidth: 370,
          maxWidth: 440,
          opacity: 0.98,
          background: "rgba(255,255,255,0.10)",
          boxShadow: "0 8px 32px rgba(31,38,135,0.25)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <FavoriteIcon sx={{ color: "#ec4899", mr: 1, fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold" color="#ec4899">
            Verify Your Email
          </Typography>
        </Box>
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            variant="contained"
            fullWidth
            disabled={loading}
            onClick={handleSendOtp}
            sx={{
              background: "linear-gradient(90deg, #ec4899 60%, #b993d6 100%)",
              fontWeight: "bold",
              letterSpacing: 1,
              fontSize: 18,
              "&:hover": {
                background: "linear-gradient(90deg, #db2777 60%, #a78bfa 100%)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Send OTP"
            )}
          </Button>
          {message && (
            <Typography
              variant="body2"
              align="center"
              color={message.includes("sent") ? "success.main" : "error.main"}
            >
              {message}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default OtpScreen;
