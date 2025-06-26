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
  Stack,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { Link, useNavigate } from "react-router-dom";

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
      if (!photoFile) {
        setMessage("Please upload a photo.");
        return;
      }
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

      if ((res.status === 201 || res.status === 200) && res.data.token) {
        const userId = res.data.member?._id;
        // Save token, userId, and username BEFORE navigating
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("email", res.data.member?.email); // <-- Save username
        localStorage.setItem("username", res.data.member?.username || "");
        setMessage("Registration successful! Redirecting...");
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
        navigate(`/members/${userId}`, { replace: true });
      } else {
        setMessage(res.data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Registration error:", err);

      let errorMsg =
        (err.response?.data?.message &&
        typeof err.response.data.message === "string"
          ? err.response.data.message
          : JSON.stringify(
              err.response?.data?.message || err.response?.data || err.message
            )) || "Network error. Please try again.";

      setMessage(errorMsg);
      setLoading(false);
    }
  };
  // return (
  // Main component return
  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: `
      linear-gradient(135deg, #f9fafb 0%, #fbc2eb 50%, #a6c1ee 100%)
    `,
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
            Create Your Account
          </Typography>
        </Box>
        {/* Signup Form */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={photoPreview}
                sx={{
                  width: 72,
                  height: 72,
                  mb: 1,
                  bgcolor: "#ec4899",
                  border: "3px solid #fff",
                  boxShadow: "0 2px 8px #ec4899",
                }}
              />
              <Button
                variant="outlined"
                component="label"
                sx={{
                  mb: 1,
                  borderColor: "#ec4899",
                  color: "#ec4899",
                  fontWeight: "bold",
                  letterSpacing: 1,
                }}
              >
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoChange}
                  // required
                />
              </Button>
            </Box>
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
              label="Email"
              name="email"
              type="email"
              value={form.email}
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
              type={showPassword ? "text" : "password"}
              value={form.password}
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
                letterSpacing: 1,
                fontSize: 18,
                boxShadow: "0 2px 8px rgba(236,72,153,0.15)",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #db2777 60%, #a78bfa 100%)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign Up"
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
        <Typography variant="body2" align="center" mt={2}>
          Already have an account? <Link to="/login">Login</Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Signup;
// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   TextField,
//   Typography,
//   Paper,
//   Stack,
//   CircularProgress,
// } from "@mui/material";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const RegisterEmail = () => {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");
//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/user/register`,
//         { email }
//       );
//       setMessage(res.data.message || "OTP sent!");
//       localStorage.setItem("pendingEmail", email);
//       navigate("/verify-registration");
//     } catch (err) {
//       setMessage(err.response?.data?.message || "Failed to send OTP.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box
//       minHeight="100vh"
//       display="flex"
//       justifyContent="center"
//       alignItems="center"
//       sx={{
//         background:
//           "linear-gradient(135deg, #f9fafb 0%, #fbc2eb 50%, #a6c1ee 100%)",
//         px: 2,
//       }}
//     >
//       <Paper elevation={6} sx={{ p: 4, borderRadius: 4, width: 400 }}>
//         <Typography
//           variant="h5"
//           mb={2}
//           align="center"
//           color="#ec4899"
//           fontWeight="bold"
//         >
//           Enter Your Email
//         </Typography>
//         <form onSubmit={handleSendOtp}>
//           <Stack spacing={2}>
//             <TextField
//               type="email"
//               label="Email Address"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               fullWidth
//             />
//             <Button
//               type="submit"
//               variant="contained"
//               disabled={loading}
//               sx={{ background: "#ec4899", fontWeight: "bold" }}
//             >
//               {loading ? <CircularProgress size={24} /> : "Send OTP"}
//             </Button>
//           </Stack>
//         </form>
//         {message && (
//           <Typography variant="body2" mt={2} align="center" color="error">
//             {message}
//           </Typography>
//         )}
//       </Paper>
//     </Box>
//   );
// };

// export default RegisterEmail;
