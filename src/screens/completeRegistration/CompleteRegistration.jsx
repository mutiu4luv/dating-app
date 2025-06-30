import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  CircularProgress,
  Avatar,
  Stack,
} from "@mui/material";
import axios from "axios";

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
  "Gay",
  "Lasbian",
];

const CompleteRegistration = () => {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    location: "",
    occupation: "",
    maritalStatus: "",
    relationshipType: "",
    username: "",
    phoneNumber: "",
    password: "",
    description: "",
    otp: "",
  });
  const [photo, setPhoto] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const email = localStorage.getItem("registerEmail");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return alert("No verified email found.");

    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => data.append(key, val));
    data.append("email", email);
    if (photo) data.append("photo", photo);

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/user/register`,
        data
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.member._id);
      localStorage.setItem("username", res.data.member.username);
      setMsg("Registration successful! Redirecting...");
      setTimeout(() => (window.location.href = "/"), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h6">Complete Registration</Typography>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <Stack spacing={2}>
          <Button variant="outlined" component="label" fullWidth>
            Upload Photo
            <input
              type="file"
              hidden
              onChange={(e) => setPhoto(e.target.files[0])}
            />
          </Button>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Age"
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            fullWidth
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
            required
          />
          <TextField
            label="Occupation"
            name="occupation"
            value={form.occupation}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Describe your kind of Man/Woman?"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            select
            label="Marital Status"
            name="maritalStatus"
            value={form.maritalStatus}
            onChange={handleChange}
            fullWidth
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
            required
          />
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="OTP"
            name="otp"
            value={form.otp}
            onChange={handleChange}
            fullWidth
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Register"
            )}
          </Button>
        </Stack>
      </form>
      {msg && (
        <Typography mt={2} color="primary">
          {msg}
        </Typography>
      )}
    </Box>
  );
};

export default CompleteRegistration;
