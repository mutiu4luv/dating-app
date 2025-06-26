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

        const onlineStatuses = await Promise.all(
          data.map(async (member) => {
            try {
              const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/api/user/${member._id}/status`
              );
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
              const statusRes = await axios.get(
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
      } catch {
        setMembers([]);
      }
      setLoading(false);
    };

    if (userId) fetchMembers();
  }, [userId]);

  const handleExpandClick = (member2) => {
    setExpanded((prev) => ({ ...prev, [member2]: !prev[member2] }));
  };

  const handleMerge = (member2) => navigate(`/merge/${userId}/${member2}`);
  const handleChat = (member2) => navigate(`/chat/${member2}`);

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
          <FavoriteIcon sx={{ color: "#ec4899", mr: 1, fontSize: 40 }} />
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
                      borderBottom: "2px solid #ec4899",
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
                      color="#ec4899"
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
                      <LocationOnIcon sx={{ color: "#db2777", fontSize: 20 }} />
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
                          maxHeight: isExpanded ? "none" : "4.6em",
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
      </Box>
      <Footer />
    </>
  );
};

export default Members;
