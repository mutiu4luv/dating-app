import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  InputAdornment,
  LinearProgress,
  Pagination,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ImageIcon from "@mui/icons-material/Image";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import axiosInstance from "../utility/axiosInstance";
import { cloudinaryImage } from "../utility/cloudinaryImage";

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

const getLastSeenLabel = (status) => {
  if (status?.isOnline) return "Online now";
  const lastSeenDate = getLastSeenDate(status?.lastSeen);
  if (!lastSeenDate) return "Not active recently";

  const elapsedHours = (Date.now() - lastSeenDate.getTime()) / (1000 * 60 * 60);
  const elapsedDays = elapsedHours / 24;
  if (elapsedHours <= 48) return "Recently online";
  if (elapsedDays <= 14) return "Active this week";
  return "Away for a while";
};

const sortByOnlineStatus = (items, statuses) =>
  [...items].sort((a, b) => {
    const aStatus = statuses[a._id] || a;
    const bStatus = statuses[b._id] || b;

    if (Boolean(aStatus.isOnline) !== Boolean(bStatus.isOnline)) {
      return aStatus.isOnline ? -1 : 1;
    }

    const aLastSeen = getLastSeenDate(aStatus.lastSeen)?.getTime() || 0;
    const bLastSeen = getLastSeenDate(bStatus.lastSeen)?.getTime() || 0;
    if (aLastSeen !== bLastSeen) return bLastSeen - aLastSeen;
    return (a.name || "").localeCompare(b.name || "");
  });

const Members = () => {
  const navigate = useNavigate();
  const suggestionsRef = useRef(null);
  const userId = useMemo(() => localStorage.getItem("userId"), []);

  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [mergeStatuses, setMergeStatuses] = useState({});
  const [userStatuses, setUserStatuses] = useState({});
  const [suggestedMembers, setSuggestedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasPaid, setHasPaid] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;
    const token = localStorage.getItem("token");
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const loadMembers = async () => {
      setLoadingMembers(true);
      try {
        const res = await axiosInstance.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/merge/${userId}`,
          authHeaders
        );

        if (cancelled) return;
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.members || res.data.matches || [];

        const initialStatuses = {};
        data.forEach((member) => {
          initialStatuses[member._id] = {
            isOnline: Boolean(member.isOnline),
            lastSeen: member.lastSeen || null,
          };
        });

        const sorted = sortByOnlineStatus(data, initialStatuses);
        setUserStatuses(initialStatuses);
        setMembers(sorted);
        setFilteredMembers(sorted);
        setLoadingMembers(false);

        const paidFromStorage = sorted.some((member) => {
          const stored = localStorage.getItem(`hasPaid_${member._id}`);
          if (!stored) return false;
          try {
            const parsed = JSON.parse(stored);
            const paidAt = parsed.paidAt ? new Date(parsed.paidAt) : null;
            return paidAt && Date.now() - paidAt.getTime() <= 30 * 24 * 60 * 60 * 1000;
          } catch {
            return false;
          }
        });
        setHasPaid(localStorage.getItem("hasPaid") === "true" || paidFromStorage);

        loadSecondaryData(data, initialStatuses, authHeaders, cancelled);
      } catch (err) {
        console.error("Members load failed:", err);
        if (!cancelled) {
          setMembers([]);
          setFilteredMembers([]);
          setSuggestedMembers([]);
          setLoadingMembers(false);
        }
      }
    };

    const loadSecondaryData = async (baseMembers, initialStatuses, headers, isCancelled) => {
      try {
        const suggestedRes = await axiosInstance.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/suggested/${userId}`,
          headers
        );
        if (isCancelled) return;

        const suggestions = Array.isArray(suggestedRes.data?.suggestions)
          ? suggestedRes.data.suggestions
          : [];
        setSuggestedMembers(sortByOnlineStatus(suggestions, initialStatuses));

        const membersById = new Map();
        [...baseMembers, ...suggestions].forEach((member) => {
          if (member?._id) membersById.set(member._id, member);
        });
        const allKnownMembers = [...membersById.values()];

        Promise.all([
          loadOnlineStatuses(allKnownMembers),
          loadMergeStatuses(allKnownMembers),
        ]).catch((err) => console.error("Secondary member data failed:", err));
      } catch (err) {
        console.error("Suggestions load failed:", err);
      }
    };

    const loadOnlineStatuses = async (items) => {
      const statuses = await Promise.all(
        items.map(async (member) => {
          try {
            const res = await axiosInstance.get(
              `${import.meta.env.VITE_BASE_URL}/api/user/${member._id}/status`
            );
            return { memberId: member._id, status: res.data };
          } catch {
            return {
              memberId: member._id,
              status: {
                isOnline: Boolean(member.isOnline),
                lastSeen: member.lastSeen || null,
              },
            };
          }
        })
      );

      if (cancelled) return;
      const statusObj = {};
      statuses.forEach(({ memberId, status }) => {
        statusObj[memberId] = status;
      });

      setUserStatuses((prev) => {
        const next = { ...prev, ...statusObj };
        setMembers((current) => sortByOnlineStatus(current, next));
        setFilteredMembers((current) => sortByOnlineStatus(current, next));
        setSuggestedMembers((current) => sortByOnlineStatus(current, next));
        return next;
      });
    };

    const loadMergeStatuses = async (items) => {
      const statuses = await Promise.all(
        items.map(async (member) => {
          try {
            const res = await axiosInstance.get(
              `${
                import.meta.env.VITE_BASE_URL
              }/api/merge/status?member1=${userId}&member2=${member._id}`
            );
            return { memberId: member._id, status: res.data };
          } catch {
            return { memberId: member._id, status: {} };
          }
        })
      );

      if (cancelled) return;
      const statusMap = {};
      statuses.forEach(({ memberId, status }) => {
        statusMap[memberId] = status;
      });
      setMergeStatuses(statusMap);
    };

    loadMembers();

    return () => {
      cancelled = true;
    };
  }, [navigate, userId]);

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
        setSuggestedMembers((current) => sortByOnlineStatus(current, next));
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

  const scrollSuggestions = (direction) => {
    const container = suggestionsRef.current;
    if (!container) return;
    container.scrollBy({
      left: direction * Math.min(container.clientWidth * 0.9, 720),
      behavior: "smooth",
    });
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = members.filter(
      (member) =>
        member.name?.toLowerCase().includes(term) ||
        member.location?.toLowerCase().includes(term) ||
        member.occupation?.toLowerCase().includes(term) ||
        member.relationshipType?.toLowerCase().includes(term)
    );

    setFilteredMembers(sortByOnlineStatus(filtered, userStatuses));
    setCurrentPage(1);
  };

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * CARDS_PER_PAGE,
    currentPage * CARDS_PER_PAGE
  );

  const renderMemberSkeletons = () =>
    Array.from({ length: CARDS_PER_PAGE }).map((_, index) => (
      <Card
        key={`member-skeleton-${index}`}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          background: "rgba(255,255,255,0.96)",
          border: "1px solid rgba(217,164,240,0.35)",
          height: `${CARD_HEIGHT}px`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Skeleton variant="rectangular" height={214} />
        <CardContent
          sx={{
            height: `${CARD_CONTENT_HEIGHT}px`,
            p: 1.75,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Skeleton width="68%" height={28} />
          <Skeleton width="58%" height={22} sx={{ mt: 1 }} />
          <Skeleton width="44%" height={20} sx={{ mt: 1 }} />
          <Skeleton width="92%" height={20} sx={{ mt: 2 }} />
          <Skeleton width="78%" height={20} />
          <Skeleton
            variant="rounded"
            width="100%"
            height={40}
            sx={{ mt: "auto", borderRadius: 1.5 }}
          />
        </CardContent>
      </Card>
    ));

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
        <Typography color="#fff">Please log in to view members.</Typography>
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
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <FavoriteIcon sx={{ color: "#D9A4F0", mr: 1, fontSize: 40 }} />
          <Typography variant="h4" fontWeight="bold" color="#fff">
            Members With Your Relationship Type
          </Typography>
        </Box>

        {!loadingMembers && suggestedMembers.length > 0 && (
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
                label={`${Math.min(suggestedMembers.length, 24)} suggestions shown`}
                size="small"
                sx={{
                  bgcolor: "rgba(217,164,240,0.16)",
                  color: "#f7e6ff",
                  border: "1px solid rgba(217,164,240,0.35)",
                  fontWeight: 800,
                }}
              />
            </Stack>

            <Box sx={{ position: "relative" }}>
              <Button
                onClick={() => scrollSuggestions(-1)}
                aria-label="Previous suggestions"
                sx={{
                  position: "absolute",
                  left: { xs: -8, sm: -12 },
                  top: "50%",
                  transform: "translateY(-50%)",
                  minWidth: 42,
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  zIndex: 2,
                  color: "#fff",
                  bgcolor: "rgba(23,24,39,0.88)",
                  "&:hover": { bgcolor: "#8b3ba8" },
                }}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                onClick={() => scrollSuggestions(1)}
                aria-label="Next suggestions"
                sx={{
                  position: "absolute",
                  right: { xs: -8, sm: -12 },
                  top: "50%",
                  transform: "translateY(-50%)",
                  minWidth: 42,
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  zIndex: 2,
                  color: "#fff",
                  bgcolor: "rgba(23,24,39,0.88)",
                  "&:hover": { bgcolor: "#8b3ba8" },
                }}
              >
                <ChevronRightIcon />
              </Button>

              <Box
                ref={suggestionsRef}
                sx={{
                  display: "grid",
                  gridAutoFlow: "column",
                  gridAutoColumns: {
                    xs: "minmax(260px, 82vw)",
                    sm: "310px",
                    md: "330px",
                  },
                  gap: 1.5,
                  overflowX: "auto",
                  px: { xs: 0.5, sm: 1 },
                  pb: 1,
                  scrollSnapType: "x mandatory",
                  scrollBehavior: "smooth",
                  scrollbarWidth: "thin",
                }}
              >
                {suggestedMembers.slice(0, 24).map((member) => {
                  const status = mergeStatuses[member._id];
                  const score = Number(member.compatibilityScore || 0);
                  const onlineStatus = userStatuses[member._id] || member;
                  const isOnline = Boolean(onlineStatus?.isOnline || member.isOnline);
                  const freeLimitReached = Boolean(
                    status?.freeTierChatLimitReached
                  );

                  return (
                    <Box
                      key={`suggested-${member._id}`}
                      sx={{
                        scrollSnapAlign: "start",
                        borderRadius: 2,
                        p: 1.25,
                        background: "#fff",
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
                            src={cloudinaryImage(member.photo, {
                              width: 520,
                              height: 620,
                              crop: "fill",
                            })}
                            alt={member.name}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <ImageIcon sx={{ color: "#9d63b7", fontSize: 36 }} />
                        )}
                      </Box>

                      <Box minWidth={0}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Typography fontWeight={900} color="#171827" noWrap>
                            {member.name}
                          </Typography>
                          <Typography fontWeight={900} color="#8b3ba8" fontSize={13}>
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
                              background: "linear-gradient(90deg, #8b3ba8, #ec4899)",
                            },
                          }}
                        />
                        <Typography color="#5b5f72" fontSize={12} fontWeight={700} noWrap>
                          {member.relationshipType || "Relationship goal"} -{" "}
                          {isOnline ? "Online now" : getLastSeenLabel(onlineStatus)}
                        </Typography>
                        <Stack direction="row" spacing={0.75} mt={1}>
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
                              "&:hover": { bgcolor: "#8b3ba8" },
                            }}
                            onClick={
                              status?.canChat
                                ? () => handleChat(member._id)
                                : freeLimitReached
                                ? () => navigate(`/merge/${userId}/upgrade`)
                                : () => handleMerge(member._id)
                            }
                          >
                            {status?.canChat
                              ? "Chat"
                              : freeLimitReached
                              ? "Upgrade"
                              : "Merge"}
                          </Button>
                        </Stack>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}

        <Box display="flex" justifyContent="center" mb={4}>
          {loadingMembers ? (
            <Skeleton
              variant="rounded"
              width={300}
              height={42}
              sx={{ bgcolor: "rgba(255,255,255,0.24)", borderRadius: 2 }}
            />
          ) : (
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
          )}
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
          {loadingMembers
            ? renderMemberSkeletons()
            : paginatedMembers.map((member) => {
                const status = mergeStatuses[member._id];
                const onlineStatus = userStatuses[member._id] || member;

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
                          image={cloudinaryImage(member.photo, {
                            width: 700,
                            height: 700,
                            crop: "fill",
                          })}
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
                            background: "linear-gradient(145deg, #f7eefb, #eef2ff)",
                          }}
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
                          {getLastSeenLabel(onlineStatus)}
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
                        background: "linear-gradient(180deg, #ffffff 0%, #fbf7fd 100%)",
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

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          color: onlineStatus?.isOnline ? "#16834f" : "#6b7280",
                          mb: 1.25,
                          textAlign: "center",
                        }}
                      >
                        {getLastSeenLabel(onlineStatus)}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="#4b5563"
                        align="center"
                        sx={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          WebkitLineClamp: MAX_DESCRIPTION_LINES,
                          maxHeight: "4.6em",
                          fontSize: "0.83rem",
                          lineHeight: 1.45,
                        }}
                      >
                        {member.description || "No profile description yet."}
                      </Typography>

                      <Button
                        variant="contained"
                        sx={{
                          mt: "auto",
                          background: "#171827",
                          color: "#fff",
                          fontWeight: 800,
                          borderRadius: 1.5,
                          minWidth: 80,
                          py: 1,
                          textTransform: "none",
                          "&:hover": { background: "#8b3ba8" },
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

        {!loadingMembers && filteredMembers.length > CARDS_PER_PAGE && (
          <Box mt={4} display="flex" justifyContent="center">
            <Pagination
              count={Math.ceil(filteredMembers.length / CARDS_PER_PAGE)}
              page={currentPage}
              onChange={(_, value) => setCurrentPage(value)}
              color="secondary"
              shape="rounded"
            />
          </Box>
        )}

        {!loadingMembers && filteredMembers.length === 0 && (
          <Box textAlign="center" mt={4}>
            <Typography color="#fff" fontWeight={800}>
              No members found.
            </Typography>
          </Box>
        )}

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
                Want to Improve Your Love Life?
              </Typography>
              <Typography
                variant="body1"
                color="#e0e0e0"
                sx={{ mb: 3, fontSize: "1rem", lineHeight: 1.7 }}
              >
                Get our exclusive relationship e-book packed with practical
                tips and secrets to help you build a stronger, lasting bond.
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
                }}
              >
                Get eBook on WhatsApp
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
