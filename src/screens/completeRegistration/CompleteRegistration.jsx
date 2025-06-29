import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

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
  const email = sessionStorage.getItem("pendingEmail");

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
        {[
          "name",
          "username",
          "age",
          "location",
          "occupation",
          "phoneNumber",
          "password",
          "description",
          "otp",
        ].map((f) => (
          <TextField
            key={f}
            label={f.charAt(0).toUpperCase() + f.slice(1)}
            name={f}
            type={f === "password" ? "password" : "text"}
            fullWidth
            value={form[f]}
            onChange={handleChange}
            margin="normal"
          />
        ))}
        <TextField
          select
          name="gender"
          label="Gender"
          fullWidth
          value={form.gender}
          onChange={handleChange}
          margin="normal"
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
        </TextField>
        <TextField
          select
          name="maritalStatus"
          label="Marital Status"
          fullWidth
          value={form.maritalStatus}
          onChange={handleChange}
          margin="normal"
        >
          <MenuItem value="single">Single</MenuItem>
          <MenuItem value="married">Married</MenuItem>
        </TextField>
        <TextField
          select
          name="relationshipType"
          label="Relationship Type"
          fullWidth
          value={form.relationshipType}
          onChange={handleChange}
          margin="normal"
        >
          <MenuItem value="friendship">Friendship</MenuItem>
          <MenuItem value="dating">Dating</MenuItem>
          <MenuItem value="marriage">Marriage</MenuItem>
        </TextField>

        <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
          Upload Photo
          <input
            type="file"
            hidden
            onChange={(e) => setPhoto(e.target.files[0])}
          />
        </Button>

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
