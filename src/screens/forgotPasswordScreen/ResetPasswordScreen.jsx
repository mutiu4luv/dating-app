import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/user/reset-password`,
        {
          token,
          newPassword: password,
        }
      );

      // ✅ Save token and user details before navigating
      const { token: newToken, user } = res.data;
      if (newToken && user) {
        localStorage.setItem("token", newToken);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("username", user.username || "");
        localStorage.setItem("email", user.email || "");
      }

      setMsg("Password reset successful. Redirecting...");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      console.error("Reset error:", err);
      setMsg(err.response?.data?.message || "Reset failed.");
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
          Reset Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              "Reset Password"
            )}
          </Button>
        </form>
        {msg && (
          <Typography mt={2} color="primary">
            {msg}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword;
