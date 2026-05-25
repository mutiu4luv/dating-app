import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Avatar,
  CircularProgress,
  Stack,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
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

const BRAND_DARK = "#2d0052";
const BRAND_PINK = "#D9A4F0";
const BRAND_SOFT = "#fbf5ff";

const formatDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const calculateAgeFromDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) return "";
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasNotHappened =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate());

  if (birthdayHasNotHappened) age -= 1;
  return age;
};

const UpdateProfileScreen = () => {
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
        setForm({
          ...res.data,
          dateOfBirth: formatDateInputValue(res.data.dateOfBirth),
        });
        setPhotoPreview(res.data.photo);
      } catch {
        setMessage("Failed to fetch profile");
      }
    };
    if (userId) fetchUser();
  }, [token, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "dateOfBirth") {
      setForm({
        ...form,
        dateOfBirth: value,
        age: calculateAgeFromDateOfBirth(value),
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.25,
        maxWidthOrHeight: 900,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      const allowedFields = [
        "name",
        "age",
        "dateOfBirth",
        "gender",
        "location",
        "occupation",
        "description",
        "maritalStatus",
        "relationshipType",
        "username",
        "email",
        "phoneNumber",
      ];

      allowedFields.forEach((key) => {
        if (form[key] !== undefined && form[key] !== null) {
          formData.append(key, form[key]);
        }
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
      if (res.data?.photo) {
        setPhotoPreview(res.data.photo);
      }
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
          "linear-gradient(135deg, #fff 0%, #fbf5ff 48%, #f0ddff 100%)",
        py: 6,
        px: { xs: 1, sm: 2, md: 4 },
      }}
    >
      <Paper
        elevation={12}
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 4,
          width: "100%",
          maxWidth: 520,
          opacity: 0.98,
          background: "rgba(255,255,255,0.96)",
          border: "1px solid rgba(217,164,240,0.4)",
          boxShadow: "0 24px 70px rgba(45,0,82,0.14)",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={2.5}
          textAlign="center"
        >
          <FavoriteIcon sx={{ color: BRAND_PINK, mr: 1, fontSize: 32 }} />
          <Typography variant="h5" fontWeight={900} color={BRAND_DARK}>
            Update Your Profile
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={photoPreview}
                sx={{
                  width: 92,
                  height: 92,
                  mb: 1.5,
                  bgcolor: BRAND_PINK,
                  color: BRAND_DARK,
                  border: `4px solid ${BRAND_SOFT}`,
                  boxShadow: "0 14px 36px rgba(45,0,82,0.18)",
                }}
              />
              <Button
                variant="outlined"
                component="label"
                sx={{
                  mb: 1,
                  borderColor: BRAND_PINK,
                  color: BRAND_DARK,
                  borderRadius: 2,
                  fontWeight: 900,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: BRAND_DARK,
                    backgroundColor: BRAND_SOFT,
                  },
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
              name="dateOfBirth"
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth || ""}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: new Date(
                  new Date().setFullYear(new Date().getFullYear() - 18)
                )
                  .toISOString()
                  .split("T")[0],
              }}
              helperText={
                form.age
                  ? `Your age updates automatically every birthday. Current age: ${form.age}`
                  : "Choose your date of birth."
              }
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
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 1,
                background:
                  "linear-gradient(135deg, #2d0052 0%, #8b3ba8 100%)",
                borderRadius: 2,
                py: 1.2,
                boxShadow: "0 16px 36px rgba(45,0,82,0.22)",
                fontWeight: 900,
                textTransform: "none",
                fontSize: 16,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #230040 0%, #743091 100%)",
                },
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
