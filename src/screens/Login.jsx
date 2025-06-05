import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
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
      console.log(data);
      // Save userId to localStorage
      const userId = data.member?._id;
      // Save token correctly
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", userId);
      // Redirect to the subscription page with the user id
      navigate(`/members/${userId}`, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    }
    setLoading(false);
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ background: "linear-gradient(135deg, #ec4899 30%, #f9fafb 100%)" }}
    >
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3, minWidth: 340 }}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <FavoriteIcon sx={{ color: "#ec4899", mr: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            LoveLink Login
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
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
              background: "#ec4899",
              fontWeight: "bold",
              "&:hover": { background: "#db2777" },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
        </form>
        {error && (
          <Typography color="error" align="center" mt={2}>
            {error}
          </Typography>
        )}
        <Typography variant="body2" align="center" mt={2}>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
