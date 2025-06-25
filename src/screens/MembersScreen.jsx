import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

const getCurrentUserId = () => localStorage.getItem("userId");
const MAX_DESCRIPTION_LINES = 2;
const CARD_HEIGHT = 450;
const CARD_CONTENT_HEIGHT = 170;

const Members = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [mergeStatuses, setMergeStatuses] = useState({});
  const userId = getCurrentUserId();

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/merge/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.members || res.data.matches || [];

        const statuses = await Promise.all(
          data.map(async (member) => {
            try {
              const statusRes = await axios.get(
                `${
                  import.meta.env.VITE_BASE_URL
                }/merge/status?member1=${userId}&member2=${member._id}`
              );
              return { memberId: member._id, status: statusRes.data };
            } catch (err) {
              console.error("Error fetching status for member", member._id);
              return { memberId: member._id, status: {} };
            }
          })
        );

        const statusMap = {};
        statuses.forEach(({ memberId, status }) => {
          statusMap[memberId] = status;
        });

        setMembers(data);
        setMergeStatuses(statusMap);
      } catch (err) {
        console.error("Error fetching members or statuses:", err);
        setMembers([]);
      }
      setLoading(false);
    };

    if (userId) fetchMembers();
  }, [userId]);

  const handleExpandClick = (member2) => {
    setExpanded((prev) => ({ ...prev, [member2]: !prev[member2] }));
  };

  const handleMerge = (member2) => {
    navigate(`/merge/${userId}/${member2}`);
  };

  const handleChat = (member2) => {
    navigate(`/chat/${member2}`);
  };

  const getButtonLabel = (status) => {
    if (status?.isMerged && status?.subscriptionActive) {
      return status?.hasChattedBefore ? "Open Chat" : "Chat";
    }
    return "Merge";
  };

  const getButtonAction = (status, memberId) => {
    if (status?.isMerged && status?.subscriptionActive) {
      return () => handleChat(memberId);
    }
    return () => handleMerge(memberId);
  };

  if (!userId) {
    return (
      <Box
        minHeight="100vh"
        sx={{
          background: "#181c2b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="#fff">
          Please log in to view members.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        sx={{
          background: "#181c2b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ClipLoader size={70} color="#ec4899" />
      </Box>
    );
  }

  if (!members.length) {
    return (
      <Box
        minHeight="100vh"
        sx={{
          background: "#181c2b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="#fff">
          No members found for your relationship type.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Box
        minHeight="100vh"
        sx={{
          background:
            "linear-gradient(135deg, #181c2b 0%, #232526 40%, #414345 80%, #b993d6 100%)",
          py: 6,
          px: { xs: 1, sm: 2, md: 4 },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
          <FavoriteIcon sx={{ color: "#ec4899", mr: 1, fontSize: 40 }} />
          <Typography
            variant="h4"
            fontWeight="bold"
            color="#fff"
            sx={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)", letterSpacing: 1 }}
          >
            Members With Your Relationship Type
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {members.map((member) => {
            const isExpanded = expanded[member._id];
            const isLong = member.description?.length > 100;
            const status = mergeStatuses[member._id];

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={member._id}>
                <Card
                  sx={{
                    borderRadius: 5,
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)",
                    border: "1.5px solid rgba(236,72,153,0.18)",
                    width: "100%",
                    maxWidth: 220,
                    height: isExpanded ? "auto" : `${CARD_HEIGHT}px`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 0,
                    transition: "height 0.3s, box-shadow 0.2s, transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-8px) scale(1.04)",
                      boxShadow: "0 16px 40px 0 rgba(31,38,135,0.30)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={member.photo}
                    alt={member.name}
                    sx={{
                      width: "100%",
                      height: 210,
                      objectFit: "cover",
                      borderRadius: "18px 18px 0 0",
                      borderBottom: "2px solid #ec4899",
                    }}
                  />
                  <CardContent
                    sx={{
                      width: "100%",
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      overflow: "hidden",
                      height: isExpanded ? "auto" : `${CARD_CONTENT_HEIGHT}px`,
                      transition: "height 0.3s",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="#ec4899"
                      gutterBottom
                      align="center"
                    >
                      {member.name}
                    </Typography>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      spacing={1}
                      mb={1}
                    >
                      <LocationOnIcon sx={{ color: "#db2777", fontSize: 20 }} />
                      <Typography
                        variant="body2"
                        color="#b993d6"
                        fontWeight="medium"
                        sx={{ fontSize: 15 }}
                      >
                        {member.location}
                      </Typography>
                    </Stack>
                    <Box sx={{ width: "100%", mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="#fff"
                        align="center"
                        sx={{
                          fontStyle: "italic",
                          opacity: 0.85,
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          WebkitLineClamp: isExpanded
                            ? "unset"
                            : MAX_DESCRIPTION_LINES,
                          textOverflow: "ellipsis",
                          whiteSpace: isExpanded ? "normal" : "initial",
                          maxHeight: isExpanded ? "none" : "3.6em",
                        }}
                      >
                        {member.description}
                      </Typography>
                      {isLong && (
                        <Button
                          size="small"
                          sx={{
                            color: "#ec4899",
                            textTransform: "none",
                            mt: 1,
                            fontWeight: "bold",
                            fontSize: 13,
                          }}
                          onClick={() => handleExpandClick(member._id)}
                        >
                          {isExpanded ? "Less" : "More"}
                        </Button>
                      )}
                    </Box>

                    <Button
                      variant="contained"
                      sx={{
                        background:
                          "linear-gradient(90deg, #ec4899 60%, #b993d6 100%)",
                        color: "#fff",
                        fontWeight: "bold",
                        borderRadius: 3,
                        boxShadow: "0 2px 8px rgba(236,72,153,0.15)",
                        letterSpacing: 1,
                        minWidth: 80,
                        "&:hover": {
                          background:
                            "linear-gradient(90deg, #db2777 60%, #a78bfa 100%)",
                        },
                      }}
                      onClick={getButtonAction(status, member._id)}
                    >
                      {getButtonLabel(status)}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      <Footer />
    </>
  );
};

export default Members;
