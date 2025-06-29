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
      minHeight="90vh"
    >
      <Paper sx={{ p: 4, maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom>
          Forgot Password
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
            sx={{ mt: 2 }}
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
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
