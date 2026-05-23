import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const BRAND_DARK = "#2d0052";
const BRAND_PINK = "#D9A4F0";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/user/forgot-password`,
        { email }
      );
      setMessage("Check your email for the password reset link.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        px: 2,
        py: 6,
        background:
          "linear-gradient(135deg, #fff 0%, #fbf5ff 48%, #f0ddff 100%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          maxWidth: 430,
          width: "100%",
          borderRadius: 4,
          border: "1px solid rgba(217,164,240,0.45)",
          boxShadow: "0 24px 70px rgba(45,0,82,0.14)",
        }}
      >
        <Typography variant="h5" fontWeight={900} color={BRAND_DARK}>
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1} mb={2}>
          Enter your email and we will send you a secure password reset link.
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              py: 1.2,
              borderRadius: 2,
              bgcolor: BRAND_DARK,
              fontWeight: 900,
              textTransform: "none",
              boxShadow: "0 16px 36px rgba(45,0,82,0.22)",
              "&:hover": { bgcolor: "#4b087c" },
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
        {message && (
          <Typography mt={2} color="primary">
            {message}
          </Typography>
        )}
        <Typography
          component="a"
          href="/login"
          sx={{
            display: "inline-block",
            mt: 2,
            color: BRAND_DARK,
            fontWeight: 800,
            textDecorationColor: BRAND_PINK,
          }}
        >
          Back to login
        </Typography>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
