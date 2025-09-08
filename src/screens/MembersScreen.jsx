import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "..//utility/axiosInstance";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Pagination,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

const getCurrentUserId = () => localStorage.getItem("userId");
const MAX_DESCRIPTION_LINES = 2;
const CARD_HEIGHT = 480;
const CARD_CONTENT_HEIGHT = 190;
const CARDS_PER_PAGE = 8;

const Members = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [mergeStatuses, setMergeStatuses] = useState({});
  const [userStatuses, setUserStatuses] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasPaid, setHasPaid] = useState(false);

  // const userId = localStorage.getItem("userId") || getCurrentUserId();
  const userId = useMemo(() => {
    const id = localStorage.getItem("userId");
    if (!id) {
      console.error("No userId found. Redirecting to login.");
    }
    return id;
  }, []);

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
      return;
    }
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/merge/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.members || res.data.matches || [];

        const onlineStatuses = await Promise.all(
          data.map(async (member) => {
            try {
              const res = await axiosInstance.get(
                `${import.meta.env.VITE_BASE_URL}/api/user/${member._id}/status`
              );
              console.log(res);
              return { memberId: member._id, status: res.data };
            } catch {
              return {
                memberId: member._id,
                status: { isOnline: false, lastSeen: null },
              };
            }
          })
        );

        const statusObj = {};
        onlineStatuses.forEach(({ memberId, status }) => {
          statusObj[memberId] = status;
        });
        setUserStatuses(statusObj);

        const sorted = [...data].sort((a, b) => {
          const aOnline = statusObj[a._id]?.isOnline ? -1 : 1;
          const bOnline = statusObj[b._id]?.isOnline ? -1 : 1;
          return aOnline - bOnline;
        });

        const statuses = await Promise.all(
          sorted.map(async (member) => {
            try {
              const statusRes = await axiosInstance.get(
                `${
                  import.meta.env.VITE_BASE_URL
                }/api/merge/status?member1=${userId}&member2=${member._id}`
              );
              return { memberId: member._id, status: statusRes.data };
            } catch {
              return { memberId: member._id, status: {} };
            }
          })
        );

        const statusMap = {};
        statuses.forEach(({ memberId, status }) => {
          statusMap[memberId] = status;
        });

        setMergeStatuses(statusMap);
        setMembers(sorted);
        setFilteredMembers(sorted);

        // ✅ Check if any member has a valid paid record
        const now = new Date();
        const hasPaidForAnyone = sorted.some((member) => {
          const paidKey = `hasPaid_${member._id}`;
          const stored = localStorage.getItem(paidKey);
          if (!stored) return false;
          try {
            const parsed = JSON.parse(stored);
            if (!parsed.paidAt) return false;
            const paidAt = new Date(parsed.paidAt);
            const diff = now - paidAt;
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;
            return diff <= thirtyDays;
          } catch {
            return false;
          }
        });
      } catch {
        setMembers([]);
      }
      setLoading(false);
    };
    const hasPaid = localStorage.getItem("hasPaid");
    setHasPaid(hasPaid === "true");
    if (userId) fetchMembers();
  }, [userId]);

  const handleExpandClick = (member2) => {
    setExpanded((prev) => ({ ...prev, [member2]: !prev[member2] }));
  };

  const handleMerge = (member2) => navigate(`/merge/${userId}/${member2}`);
  const handleChat = (member2) => navigate(`/chat/${userId}/${member2}`);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = members.filter((m) =>
      m.name?.toLowerCase().includes(term)
    );
    setFilteredMembers(filtered);
    setCurrentPage(1);
  };

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * CARDS_PER_PAGE,
    currentPage * CARDS_PER_PAGE
  );

  if (!userId)
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
        <Typography color="#fff">Please log in to view members.</Typography>
      </Box>
    );

  if (loading)
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
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <FavoriteIcon sx={{ color: "#D9A4F0", mr: 1, fontSize: 40 }} />
          <Typography variant="h4" fontWeight="bold" color="#fff">
            Members With Your Relationship Type
          </Typography>
        </Box>

        <Box display="flex" justifyContent="center" mb={4}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by name"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ backgroundColor: "#fff", borderRadius: 2, width: "300px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {paginatedMembers.map((member) => {
            const isExpanded = expanded[member._id];
            const isLong = member.description?.length > 100;
            const status = mergeStatuses[member._id];
            const onlineStatus = userStatuses[member._id];

            return (
              <Grid item xs={6} sm={4} md={3} lg={3} key={member._id}>
                <Card
                  sx={{
                    borderRadius: 5,
                    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.25)",
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)",
                    border: "1.5px solid rgba(236,72,153,0.18)",
                    maxWidth: 240,
                    height: isExpanded ? "auto" : `${CARD_HEIGHT}px`,
                    p: 0,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={member.photo}
                    alt={member.name}
                    sx={{
                      height: 210,
                      objectFit: "cover",
                      borderRadius: "18px 18px 0 0",
                      borderBottom: "2px solid #D9A4F0",
                    }}
                  />
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: isExpanded ? "auto" : `${CARD_CONTENT_HEIGHT}px`,
                      p: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="#D9A4F0"
                      fontWeight="bold"
                      gutterBottom
                      align="center"
                    >
                      {member.name}
                    </Typography>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={1}
                    >
                      <LocationOnIcon sx={{ color: "#D9A4F0", fontSize: 20 }} />
                      <Typography variant="body2" color="#b993d6">
                        {member.location}
                      </Typography>
                    </Stack>

                    <Tooltip title={onlineStatus?.lastSeen?.exact || "Unknown"}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          fontSize: 14,
                          background: onlineStatus?.isOnline
                            ? "linear-gradient(to right, #32CD32, #7CFC00)"
                            : "none",
                          WebkitBackgroundClip: onlineStatus?.isOnline
                            ? "text"
                            : "none",
                          WebkitTextFillColor: onlineStatus?.isOnline
                            ? "transparent"
                            : "#facc15",
                          opacity: 0.85,
                          cursor: "help",
                        }}
                      >
                        {onlineStatus?.isOnline
                          ? "🟢 Online"
                          : `Last seen: ${
                              onlineStatus?.lastSeen?.relative || "Unknown"
                            }`}
                      </Typography>
                    </Tooltip>

                    <Box sx={{ width: "100%", mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="#D9A4F0"
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
                          maxHeight: isExpanded ? "none" : "4.6em",
                        }}
                      >
                        {member.description}
                      </Typography>
                      {isLong && (
                        <Button
                          size="small"
                          sx={{
                            color: "#D9A4F0",
                            textTransform: "none",
                            mt: 1,
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
                          "linear-gradient(90deg, #D9A4F0 60%, #b993d6 100%)",
                        color: "#fff",
                        fontWeight: "bold",
                        borderRadius: 3,
                        boxShadow: "0 2px 8px rgba(236,72,153,0.15)",
                        minWidth: 80,
                      }}
                      onClick={
                        status?.isMerged && status?.subscriptionActive
                          ? () => handleChat(member._id)
                          : () => handleMerge(member._id)
                      }
                    >
                      {status?.isMerged && status?.subscriptionActive
                        ? status?.hasChattedBefore
                          ? "Open Chat"
                          : "Chat"
                        : "Merge"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={Math.ceil(filteredMembers.length / CARDS_PER_PAGE)}
            page={currentPage}
            onChange={(_, value) => setCurrentPage(value)}
            color="secondary"
            shape="rounded"
          />
        </Box>

        {/* Show eBook WhatsApp section if paid for any member */}

        {hasPaid && (
          <Box mt={8} px={2} display="flex" justifyContent="center">
            <Box
              sx={{
                background:
                  "linear-gradient(145deg, rgba(236,72,153,0.2), rgba(185,147,214,0.15))",
                borderRadius: 4,
                px: { xs: 3, sm: 6 },
                py: { xs: 4, sm: 6 },
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                maxWidth: 700,
                width: "100%",
                textAlign: "center",
                animation: "fadeIn 1s ease-in-out",
                "@keyframes fadeIn": {
                  from: { opacity: 0, transform: "translateY(30px)" },
                  to: { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                color="#fff"
                gutterBottom
                sx={{
                  mb: 2,
                  background: "linear-gradient(to right, #ec4899, #b993d6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                💡 Want to Improve Your Love Life?
              </Typography>

              <Typography
                variant="body1"
                color="#e0e0e0"
                sx={{
                  mb: 3,
                  fontSize: "1rem",
                  lineHeight: 1.7,
                }}
              >
                Get our <strong>exclusive relationship e-book</strong> packed
                with practical tips and secrets to help you build a stronger,
                lasting bond. Message us now on WhatsApp to receive your copy
                instantly!
              </Typography>

              <Button
                variant="contained"
                color="success"
                size="large"
                href="https://wa.me/2347050605491"
                target="_blank"
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  px: 5,
                  py: 1.8,
                  borderRadius: 3,
                  background: "linear-gradient(to right, #22c55e, #16a34a)",
                  boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
                  "&:hover": {
                    background: "linear-gradient(to right, #16a34a, #15803d)",
                  },
                }}
              >
                📩 Get eBook on WhatsApp
              </Button>
            </Box>
          </Box>
        )}
      </Box>
      <Footer />
    </>
  );
};

export default Members;
