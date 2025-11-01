import React, { useEffect, useState } from "react";
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
  Stack,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { useNavigate } from "react-router-dom";

const genders = ["Male", "Female"];
const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];
const relationshipTypes = [
  "friendship",
  "dating",
  "marriage",
  "Online Dating ",
  "Males Friends ",
  "Female friends ",
  "Chat mate ",
  "Friends with Benefits  ",
  "Sex chat  ",
  // "Gay",
  // "Lasbian",
  "Sugar Daddy",
  "Sugar Mommy",
  "Casual Relationship",
  "Long-term Relationship",
  "Open Relationship",
];

const UpdateProfileScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({});
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setForm(res.data);
        setPhotoPreview(res.data.photo);
      } catch (error) {
        setMessage("Failed to fetch profile");
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.05,
        maxWidthOrHeight: 300,
        useWebWorker: true,
      });
      setPhotoFile(compressedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch {
      setMessage("Image compression failed. Try another image.");
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
      if (photoFile) formData.append("photo", photoFile);

      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/user/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Profile updated successfully.");
      navigate(`/members/${userId}`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile.");
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
          boxShadow: "0 8px 32px 0 rgba(31,38,135,0.25)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <FavoriteIcon sx={{ color: "#ec4899", mr: 1, fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold" color="#ec4899">
            Update Your Profile
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={photoPreview}
                sx={{ width: 72, height: 72, mb: 1, bgcolor: "#ec4899" }}
              />
              <Button
                variant="outlined"
                component="label"
                sx={{
                  mb: 1,
                  borderColor: "#ec4899",
                  color: "#ec4899",
                  fontWeight: "bold",
                }}
              >
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoChange}
                />
              </Button>
            </Box>

            <TextField
              name="name"
              label="Name"
              value={form.name || ""}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="age"
              label="Age"
              type="number"
              value={form.age || ""}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              select
              name="gender"
              label="Gender"
              value={form.gender || ""}
              onChange={handleChange}
              fullWidth
              required
            >
              {genders.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="location"
              label="Location"
              value={form.location || ""}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="occupation"
              label="Occupation"
              value={form.occupation || ""}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="description"
              label="Description"
              value={form.description || ""}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              select
              name="maritalStatus"
              label="Marital Status"
              value={form.maritalStatus || ""}
              onChange={handleChange}
              fullWidth
              required
            >
              {maritalStatuses.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              name="relationshipType"
              label="Relationship Type"
              value={form.relationshipType || ""}
              onChange={handleChange}
              fullWidth
              required
            >
              {relationshipTypes.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="username"
              label="Username"
              value={form.username || ""}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="email"
              label="Email"
              value={form.email || ""}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="phoneNumber"
              label="Phone Number"
              value={form.phoneNumber || ""}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password || ""}
              onChange={handleChange}
              fullWidth
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
                mt: 1,
                background: "linear-gradient(90deg, #ec4899 60%, #b993d6 100%)",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Update Profile"
              )}
            </Button>
          </Stack>
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
      </Paper>
    </Box>
  );
};

export default UpdateProfileScreen;
