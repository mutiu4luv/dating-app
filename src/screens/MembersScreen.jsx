import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";

const getCurrentUserId = () => {
  return localStorage.getItem("userId");
};

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = getCurrentUserId();

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/matches/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Log the full response for debugging
        console.log("Fetched members response:", res.data);
        // Handle   { matches: [...] }, { members: [...] }, or [...] response
        if (Array.isArray(res.data)) {
          setMembers(res.data);
        } else if (Array.isArray(res.data.members)) {
          setMembers(res.data.members);
        } else if (Array.isArray(res.data.matches)) {
          setMembers(res.data.matches);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error("Error fetching members:", err, err.response?.data);
        setMembers([]);
      }
      setLoading(false);
    };
    fetchMembers();
  }, [userId]);
  return (
    <Box
      minHeight="100vh"
      sx={{
        background: "linear-gradient(135deg, #ec4899 30%, #f9fafb 100%)",
        py: 6,
        px: 2,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
        <FavoriteIcon sx={{ color: "#ec4899", mr: 1, fontSize: 32 }} />
        <Typography variant="h4" fontWeight="bold">
          Members With Your Relationship Type
        </Typography>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress color="secondary" />
        </Box>
      ) : members.length === 0 ? (
        <Typography align="center" color="text.secondary">
          No members found for your relationship type.
        </Typography>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {members.map((member) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={member._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  background: "#fff",
                  minHeight: 350,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 2,
                }}
              >
                <CardMedia
                  component="img"
                  image={member.photo}
                  alt={member.name}
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    objectFit: "cover",
                    mb: 2,
                    border: "3px solid #ec4899",
                  }}
                />
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {member.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {member.description}
                  </Typography>
                  <Chip
                    label={member.location}
                    color="secondary"
                    sx={{ background: "#ec4899", color: "#fff", mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Members;
