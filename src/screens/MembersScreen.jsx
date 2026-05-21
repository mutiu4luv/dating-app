import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "..//utility/axiosInstance";
import {
  Box,
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
  Chip,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ImageIcon from "@mui/icons-material/Image";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import io from "socket.io-client";

const getCurrentUserId = () => localStorage.getItem("userId");
const MAX_DESCRIPTION_LINES = 2;
const CARD_HEIGHT = 486;
const CARD_CONTENT_HEIGHT = 206;
const CARDS_PER_PAGE = 8;

const getLastSeenDate = (lastSeen) => {
  if (!lastSeen) return null;

  const rawDate =
    typeof lastSeen === "string"
      ? lastSeen
      : lastSeen.date || lastSeen.exact || lastSeen.value || null;

  if (!rawDate) return null;

  const parsedDate = new Date(rawDate);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const sortByOnlineStatus = (items, statuses) =>
  [...items].sort((a, b) => {
    const aStatus = statuses[a._id] || {};
    const bStatus = statuses[b._id] || {};

    if (Boolean(aStatus.isOnline) !== Boolean(bStatus.isOnline)) {
      return aStatus.isOnline ? -1 : 1;
    }

    const aLastSeen = getLastSeenDate(aStatus.lastSeen)?.getTime() || 0;
    const bLastSeen = getLastSeenDate(bStatus.lastSeen)?.getTime() || 0;

    if (aLastSeen !== bLastSeen) {
      return bLastSeen - aLastSeen;
    }

    return (a.name || "").localeCompare(b.name || "");
  });

const getLastSeenLabel = (status) => {
  if (status?.isOnline) return "Online now";

  const lastSeenDate = getLastSeenDate(status?.lastSeen);
  if (!lastSeenDate) return "Not active recently";

  const elapsedMs = Date.now() - lastSeenDate.getTime();
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  const elapsedDays = elapsedHours / 24;

  if (elapsedHours <= 48) return "Recently online";
  if (elapsedDays <= 14) return "Active this week";
  return "Away for a while";
};

const Members = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mergeStatuses, setMergeStatuses] = useState({});
  const [userStatuses, setUserStatuses] = useState({});
  const [suggestedMembers, setSuggestedMembers] = useState([]);
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

    //     const fetchMembers = async () => {
    //       setLoading(true);
    //       try {
    //         const token = localStorage.getItem("token");
    //         const res = await axiosInstance.get(
    //           `${import.meta.env.VITE_BASE_URL}/api/user
    // `,
    //           { headers: { Authorization: `Bearer ${token}` } }
    //         );

    //         const data = Array.isArray(res.data)
    //           ? res.data
    //           : res.data.members || res.data.matches || [];

    //         const onlineStatuses = await Promise.all(
    //           data.map(async (member) => {
    //             try {
    //               const res = await axiosInstance.get(
    //                 `${import.meta.env.VITE_BASE_URL}/api/user/${member._id}/status`
    //               );
    //               console.log(res);
    //               return { memberId: member._id, status: res.data };
    //             } catch {
    //               return {
    //                 memberId: member._id,
    //                 status: { isOnline: false, lastSeen: null },
    //               };
    //             }
    //           })
    //         );
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

        const suggestedRes = await axiosInstance.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/suggested/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const suggestions = Array.isArray(suggestedRes.data?.suggestions)
          ? suggestedRes.data.suggestions
          : [];

        const membersById = new Map();
        [...data, ...suggestions].forEach((member) => {
          if (member?._id) membersById.set(member._id, member);
        });
        const statusMembers = [...membersById.values()];

        const onlineStatuses = await Promise.all(
          statusMembers.map(async (member) => {
            try {
              const res = await axiosInstance.get(
                `${import.meta.env.VITE_BASE_URL}/api/user/${member._id}/status`
              );
              // console.log(res);
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

        const sorted = sortByOnlineStatus(data, statusObj);

        const mergeStatusMembers = [...membersById.values()];
        const statuses = await Promise.all(
          mergeStatusMembers.map(async (member) => {
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
        setSuggestedMembers(sortByOnlineStatus(suggestions, statusObj));

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
        setFilteredMembers([]);
        setSuggestedMembers([]);
      }
      setLoading(false);
    };
    const hasPaid = localStorage.getItem("hasPaid");
    setHasPaid(hasPaid === "true");
    if (userId) fetchMembers();
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;

    const socket = io(import.meta.env.VITE_BASE_URL, {
      transports: ["websocket"],
    });

    socket.emit("register_user", userId);

    const handlePresenceUpdate = ({ userId: changedUserId, isOnline, lastSeen }) => {
      setUserStatuses((prev) => {
        const next = {
          ...prev,
          [changedUserId]: {
            ...(prev[changedUserId] || {}),
            isOnline,
            lastSeen,
          },
        };

        setMembers((current) => sortByOnlineStatus(current, next));
        setFilteredMembers((current) => sortByOnlineStatus(current, next));

        return next;
      });
    };

    socket.on("presence_update", handlePresenceUpdate);

    return () => {
      socket.off("presence_update", handlePresenceUpdate);
      socket.disconnect();
    };
  }, [userId]);

  const handleMerge = (member2) => navigate(`/merge/${userId}/${member2}`);
  const handleChat = (member2) => navigate(`/chat/${userId}/${member2}`);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = members.filter(
      (m) =>
        m.name?.toLowerCase().includes(term) ||
        m.location?.toLowerCase().includes(term) ||
        m.occupation?.toLowerCase().includes(term) ||
        m.relationshipType?.toLowerCase().includes(term)
    );

    setFilteredMembers(sortByOnlineStatus(filtered, userStatuses));
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

        {suggestedMembers.length > 0 && (
          <Box
            sx={{
              maxWidth: 1180,
              mx: "auto",
              mb: 4,
              borderRadius: 2,
              border: "1px solid rgba(217,164,240,0.28)",
              background: "rgba(13, 16, 30, 0.68)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.24)",
              backdropFilter: "blur(14px)",
              p: { xs: 1.5, sm: 2.25 },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1}
              mb={2}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <AutoAwesomeIcon sx={{ color: "#D9A4F0" }} />
                <Box>
                  <Typography color="#fff" fontWeight={900} fontSize={20}>
                    Suggested for you
                  </Typography>
                  <Typography color="rgba(255,255,255,0.66)" fontSize={13}>
                    Ranked by relationship goal, location, age, interests, and activity.
                  </Typography>
                </Box>
              </Stack>
              <Chip
                label={`${Math.min(suggestedMembers.length, 18)} suggestions shown`}
                size="small"
                sx={{
                  bgcolor: "rgba(217,164,240,0.16)",
                  color: "#f7e6ff",
                  border: "1px solid rgba(217,164,240,0.35)",
                  fontWeight: 800,
                }}
              />
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridAutoFlow: { xs: "column", md: "row" },
                gridAutoColumns: { xs: "minmax(260px, 82vw)", sm: "310px" },
                gridTemplateColumns: {
                  xs: "none",
                  md: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                  xl: "repeat(4, minmax(0, 1fr))",
                },
                gap: 1.5,
                overflowX: { xs: "auto", md: "visible" },
                pb: { xs: 0.5, md: 0 },
                scrollSnapType: { xs: "x mandatory", md: "none" },
                "&::-webkit-scrollbar": { height: 8 },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(217,164,240,0.42)",
                  borderRadius: 99,
                },
              }}
            >
              {suggestedMembers.slice(0, 18).map((member) => {
                const status = mergeStatuses[member._id];
                const score = Number(member.compatibilityScore || 0);
                const onlineStatus = userStatuses[member._id] || member;
                const isOnline = Boolean(onlineStatus?.isOnline || member.isOnline);

                return (
                  <Box
                    key={`suggested-${member._id}`}
                    sx={{
                      scrollSnapAlign: "start",
                      minWidth: 0,
                      borderRadius: 2,
                      p: 1.25,
                      background: "#ffffff",
                      border: "1px solid rgba(255,255,255,0.14)",
                      display: "grid",
                      gridTemplateColumns: "72px minmax(0, 1fr)",
                      gap: 1.25,
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 72,
                        height: 84,
                        borderRadius: 1.5,
                        overflow: "hidden",
                        bgcolor: "#f4e8fb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {member.photo ? (
                        <Box
                          component="img"
                          src={member.photo}
                          alt={member.name}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <ImageIcon sx={{ color: "#9d63b7", fontSize: 36 }} />
                      )}
                    </Box>

                    <Box minWidth={0}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Typography
                          fontWeight={900}
                          color="#171827"
                          noWrap
                          sx={{ minWidth: 0 }}
                        >
                          {member.name}
                        </Typography>
                        <Typography
                          fontWeight={900}
                          color="#8b3ba8"
                          fontSize={13}
                          whiteSpace="nowrap"
                        >
                          {score}% match
                        </Typography>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={score}
                        sx={{
                          my: 0.85,
                          height: 6,
                          borderRadius: 99,
                          bgcolor: "#eee7f2",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 99,
                            background:
                              "linear-gradient(90deg, #8b3ba8, #ec4899)",
                          },
                        }}
                      />

                      <Typography
                        color="#5b5f72"
                        fontSize={12}
                        fontWeight={700}
                        noWrap
                      >
                        {member.relationshipType || "Relationship goal"} -{" "}
                        {isOnline
                          ? "Online now"
                          : getLastSeenLabel(onlineStatus)}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={0.75}
                        mt={1}
                        sx={{ overflow: "hidden", flexWrap: "nowrap" }}
                      >
                        <Chip
                          label={isOnline ? "Best to chat now" : "Check activity"}
                          size="small"
                          sx={{
                            maxWidth: 124,
                            height: 24,
                            borderRadius: 1,
                            bgcolor: isOnline ? "#dcfce7" : "#eef2ff",
                            color: isOnline ? "#166534" : "#3730a3",
                            fontWeight: 900,
                            "& .MuiChip-label": {
                              px: 0.75,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            },
                          }}
                        />
                        {(member.compatibilityReasons || [])
                          .slice(0, 1)
                          .map((reason) => (
                            <Chip
                              key={`${member._id}-${reason}`}
                              label={reason}
                              size="small"
                              sx={{
                                maxWidth: 118,
                                height: 24,
                                borderRadius: 1,
                                bgcolor: "#f7eefb",
                                color: "#6f2a86",
                                fontWeight: 800,
                                "& .MuiChip-label": {
                                  px: 0.75,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                },
                              }}
                            />
                          ))}
                      </Stack>

                      <Stack direction="row" spacing={0.75} mt={1.1}>
                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          startIcon={<PersonSearchIcon />}
                          sx={{
                            borderColor: "#8b3ba8",
                            color: "#6f2a86",
                            borderRadius: 1.25,
                            textTransform: "none",
                            fontWeight: 850,
                            minWidth: 0,
                            "& .MuiButton-startIcon": { mr: 0.4 },
                          }}
                          onClick={() => navigate(`/member-profile/${member._id}`)}
                        >
                          View
                        </Button>
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          sx={{
                            bgcolor: "#171827",
                            borderRadius: 1.25,
                            textTransform: "none",
                            fontWeight: 850,
                            minWidth: 0,
                            "&:hover": { bgcolor: "#8b3ba8" },
                          }}
                          onClick={
                            status?.canChat
                              ? () => handleChat(member._id)
                              : () => handleMerge(member._id)
                          }
                        >
                          {status?.canChat ? "Chat" : "Merge"}
                        </Button>
                      </Stack>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        <Box display="flex" justifyContent="center" mb={4}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by name or location"
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, min(100%, 340px))",
              sm: "repeat(2, minmax(0, 260px))",
              md: "repeat(3, minmax(0, 240px))",
              lg: "repeat(4, minmax(0, 240px))",
            },
            gap: { xs: 2.5, sm: 3 },
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          {paginatedMembers.map((member) => {
            const status = mergeStatuses[member._id];
            const onlineStatus = userStatuses[member._id];

            return (
              <Card
                key={member._id}
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 18px 44px rgba(5, 8, 20, 0.32)",
                  background: "rgba(255,255,255,0.96)",
                  border: "1px solid rgba(217,164,240,0.35)",
                  width: "100%",
                  minWidth: 0,
                  height: `${CARD_HEIGHT}px`,
                  p: 0,
                  display: "flex",
                  flexDirection: "column",
                  transition:
                    "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 24px 54px rgba(5, 8, 20, 0.42)",
                    borderColor: "rgba(217,164,240,0.72)",
                  },
                }}
              >
                  <Box sx={{ position: "relative" }}>
                    {member.photo ? (
                      <CardMedia
                        component="img"
                        image={member.photo}
                        alt={member.name}
                        sx={{
                          height: 214,
                          objectFit: "cover",
                          borderBottom: "1px solid rgba(17,24,39,0.08)",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 214,
                          borderBottom: "1px solid rgba(17,24,39,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background:
                            "linear-gradient(145deg, #f7eefb, #eef2ff)",
                        }}
                        aria-label={`${member.name || "Member"} has no profile image`}
                      >
                        <ImageIcon sx={{ color: "#9d63b7", fontSize: 58 }} />
                      </Box>
                    )}

                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0.02) 42%, rgba(5,8,20,0.46) 100%)",
                        pointerEvents: "none",
                      }}
                    />

                    <Tooltip
                      title={
                        onlineStatus?.lastSeen?.exact ||
                        getLastSeenLabel(onlineStatus)
                      }
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          px: 1.1,
                          py: 0.55,
                          borderRadius: 1.25,
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 700,
                          background: onlineStatus?.isOnline
                            ? "rgba(20, 132, 73, 0.95)"
                            : "rgba(17, 24, 39, 0.86)",
                          border: "1px solid rgba(255,255,255,0.38)",
                          boxShadow: "0 10px 22px rgba(0,0,0,0.24)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <Box
                          sx={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            backgroundColor: onlineStatus?.isOnline
                              ? "#4ade80"
                              : "#9ca3af",
                            boxShadow: onlineStatus?.isOnline
                              ? "0 0 0 3px rgba(74,222,128,0.25)"
                              : "none",
                          }}
                        />
                        {onlineStatus?.isOnline ? "Online" : "Offline"}
                      </Box>
                    </Tooltip>
                  </Box>
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      height: `${CARD_CONTENT_HEIGHT}px`,
                      p: 1.75,
                      background:
                        "linear-gradient(180deg, #ffffff 0%, #fbf7fd 100%)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="#171827"
                      fontWeight={800}
                      gutterBottom
                      align="center"
                      noWrap
                      sx={{ fontSize: "1rem", lineHeight: 1.2, mb: 0.75 }}
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
                      <LocationOnIcon sx={{ color: "#8b3ba8", fontSize: 18 }} />
                      <Typography
                        variant="body2"
                        color="#5b5f72"
                        noWrap
                        sx={{ maxWidth: 160, fontWeight: 600 }}
                      >
                        {member.location || "Location not set"}
                      </Typography>
                    </Stack>

                    <Tooltip
                      title={
                        onlineStatus?.lastSeen?.exact ||
                        getLastSeenLabel(onlineStatus)
                      }
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          color: onlineStatus?.isOnline ? "#16834f" : "#6b7280",
                          cursor: "help",
                          mb: 1.25,
                          textAlign: "center",
                        }}
                      >
                        {getLastSeenLabel(onlineStatus)}
                      </Typography>
                    </Tooltip>

                    <Box sx={{ width: "100%", mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="#4b5563"
                        align="center"
                        sx={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          WebkitLineClamp: MAX_DESCRIPTION_LINES,
                          textOverflow: "ellipsis",
                          whiteSpace: "initial",
                          maxHeight: "4.6em",
                          fontSize: "0.83rem",
                          lineHeight: 1.45,
                        }}
                      >
                        {member.description || "No profile description yet."}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      sx={{
                        mt: "auto",
                        background: "#171827",
                        color: "#fff",
                        fontWeight: 800,
                        borderRadius: 1.5,
                        boxShadow: "0 10px 22px rgba(23,24,39,0.2)",
                        minWidth: 80,
                        py: 1,
                        textTransform: "none",
                        "&:hover": {
                          background: "#8b3ba8",
                          boxShadow: "0 12px 24px rgba(139,59,168,0.26)",
                        },
                      }}
                      onClick={
                        status?.canChat
                          ? () => handleChat(member._id)
                          : () => handleMerge(member._id)
                      }
                    >
                      {status?.canChat
                        ? status?.hasChattedBefore
                          ? "Open Chat"
                          : "Chat"
                        : "Merge"}
                    </Button>
                  </CardContent>
              </Card>
            );
          })}
        </Box>

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
