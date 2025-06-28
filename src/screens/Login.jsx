import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect to members page
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      navigate(`/members/${userId}`, { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/user/login`,
        form,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = res.data;
      const userId = data.member?._id;
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", data.member?.username); // <-- Save username
      localStorage.setItem("email", data.member?.email); // <-- Save username
      console.log("✅ Token stored:", localStorage.getItem("token"));
      console.log("✅ User ID stored:", localStorage.getItem("userId"));
      navigate(`/members/${userId}`, { replace: true });
      console.log(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    }
    setLoading(false);
  };
  if (localStorage.getItem("username")) {
    // Username exists in localStorage
    console.log("Username is:", localStorage.getItem("username"));
  } else {
    // Username not found
    console.log("No username found in localStorage");
  }
  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background:
          "linear-gradient(135deg, #f9fafb 0%, #fbc2eb 50%, #a6c1ee 100%)",
        zIndex: 9999,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          minWidth: { xs: 320, sm: 400 },
          maxWidth: 420,
          width: "100%",
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <FavoriteIcon sx={{ color: "#ec4899", fontSize: 40, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" color="#ec4899" mb={0.5}>
            Welcome Back!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={2}>
            Sign in to your LoveLink account
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            autoComplete="email"
          />
          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {error && (
            <Typography color="error" align="center" mt={1}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              background: "linear-gradient(90deg, #ec4899 60%, #b993d6 100%)",
              fontWeight: "bold",
              fontSize: 17,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(236,72,153,0.15)",
              "&:hover": {
                background: "linear-gradient(90deg, #db2777 60%, #a78bfa 100%)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
        </form>
        <Divider sx={{ my: 3 }}></Divider>

        <Typography variant="body2" align="center" mt={1}>
          <Link
            to="/forgot-password"
            style={{ color: "#ec4899", fontWeight: 500 }}
          >
            Forgot Password?
          </Link>
        </Typography>
        <Divider sx={{ my: 3 }}>or</Divider>
        <Typography variant="body2" align="center">
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#ec4899", fontWeight: 600 }}>
            Sign Up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
