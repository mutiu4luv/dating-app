import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  InputAdornment,
  IconButton,
  Avatar,
  CircularProgress,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { useNavigate } from "react-router-dom";

const genders = ["Male", "Female", "Other"];
const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];
const relationshipTypes = ["Friendship", "Dating", "Marriage", "Other"];

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    location: "",
    occupation: "",
    maritalStatus: "",
    relationshipType: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    description: "",
  });
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Handle text input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle photo upload, compress, and store file
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.05, // 50KB
        maxWidthOrHeight: 300,
        useWebWorker: true,
      });
      setPhotoFile(compressedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      setMessage("Image compression failed. Please try another image.");
    }
  };

  const handleShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/user/register`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Always log the response
      console.log("Registration response:", res);

      if ((res.status === 201 || res.status === 200) && res.data.token) {
        localStorage.setItem("token", res.data.token);
        setMessage("Registration successful! Redirecting...");
        setTimeout(() => {
          navigate(`/members/${userId}`, { replace: true });
        }, 1200);
        setForm({
          name: "",
          age: "",
          gender: "",
          location: "",
          occupation: "",
          maritalStatus: "",
          relationshipType: "",
          username: "",
          email: "",
          phoneNumber: "",
          password: "",
          description: "",
        });
        setPhotoPreview("");
        setPhotoFile(null);
      } else {
        setMessage(res.data.message || "Registration failed.");
      }
    } catch (err) {
      // Always log the error
      console.log("Registration error:", err);
      setMessage(
        err.response?.data?.message || "Network error. Please try again."
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
      sx={{
        background: "linear-gradient(135deg, #ec4899 30%, #f9fafb 100%)",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 3,
          minWidth: 370,
          maxWidth: 420,
          opacity: 0.97,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <FavoriteIcon sx={{ color: "#ec4899", mr: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Create Your Account
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar
              src={photoPreview}
              sx={{ width: 64, height: 64, mb: 1, bgcolor: "#ec4899" }}
            />
            <Button
              variant="outlined"
              component="label"
              sx={{ mb: 1, borderColor: "#ec4899", color: "#ec4899" }}
            >
              Upload Photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoChange}
                required
              />
            </Button>
          </Box>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Age"
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            inputProps={{ min: 18, max: 100 }}
          />
          <TextField
            select
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            {genders.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Occupation"
            name="occupation"
            value={form.occupation}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="What are you looking for?"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            select
            label="Marital Status"
            name="maritalStatus"
            value={form.maritalStatus}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            {maritalStatuses.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Relationship Type"
            name="relationshipType"
            value={form.relationshipType}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            {relationshipTypes.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
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
            label="Phone Number"
            name="phoneNumber"
            value={form.phoneNumber}
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
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
        {message && (
          <Typography
            variant="body2"
            align="center"
            mt={2}
            color={message.includes("success") ? "success.main" : "error.main"}
          >
            {message}
          </Typography>
        )}
        <Typography variant="body2" align="center" mt={2}>
          Already have an account? <a href="/login">Login</a>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Signup;
