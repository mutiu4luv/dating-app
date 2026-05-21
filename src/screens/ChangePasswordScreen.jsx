import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axiosInstance from "../utility/axiosInstance";

const ChangePasswordScreen = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        `${import.meta.env.VITE_BASE_URL}/api/user/change-password`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data?.message || "Password changed successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordType = showPassword ? "text" : "password";
  const renderPasswordAdornment = () => (
    <InputAdornment position="end">
      <IconButton onClick={() => setShowPassword((value) => !value)} edge="end">
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box
      minHeight="100vh"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 1.5, sm: 2 },
        py: 6,
        background:
          "linear-gradient(135deg, #181c2b 0%, #2d0052 45%, #b993d6 100%)",
      }}
    >
      <Paper
        elevation={14}
        sx={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 2,
          p: { xs: 2.5, sm: 4 },
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
        }}
      >
        <Stack spacing={1} alignItems="center" mb={3}>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              background: "linear-gradient(135deg, #ec4899, #8b3ba8)",
            }}
          >
            <LockResetIcon />
          </Box>
          <Typography variant="h5" fontWeight={950} color="#171827">
            Change Password
          </Typography>
          <Typography color="#6b7280" textAlign="center" fontSize={14}>
            Verify your current password before setting a new one.
          </Typography>
        </Stack>

        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <TextField
            name="currentPassword"
            label="Current Password"
            type={passwordType}
            value={form.currentPassword}
            onChange={handleChange}
            required
            fullWidth
            InputProps={{ endAdornment: renderPasswordAdornment() }}
          />
          <TextField
            name="newPassword"
            label="New Password"
            type={passwordType}
            value={form.newPassword}
            onChange={handleChange}
            required
            fullWidth
            inputProps={{ minLength: 6 }}
            InputProps={{ endAdornment: renderPasswordAdornment() }}
          />
          <TextField
            name="confirmPassword"
            label="Confirm New Password"
            type={passwordType}
            value={form.confirmPassword}
            onChange={handleChange}
            required
            fullWidth
            inputProps={{ minLength: 6 }}
            InputProps={{ endAdornment: renderPasswordAdornment() }}
          />

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.15,
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 900,
              background: "linear-gradient(90deg, #ec4899, #8b3ba8)",
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Update Password"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ChangePasswordScreen;
