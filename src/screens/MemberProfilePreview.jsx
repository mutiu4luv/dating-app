import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatIcon from "@mui/icons-material/Chat";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ImageIcon from "@mui/icons-material/Image";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utility/axiosInstance";

const getLastSeenLabel = (member) => {
  if (member?.isOnline) return "Online now";
  if (!member?.lastSeen) return "Activity not available";

  const lastSeen = new Date(member.lastSeen);
  if (Number.isNaN(lastSeen.getTime())) return "Activity not available";

  const elapsedHours = (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60);
  if (elapsedHours <= 24) return "Active today";
  if (elapsedHours <= 48) return "Recently online";
  if (elapsedHours <= 24 * 7) return "Active this week";
  return "Away for a while";
};

const InfoTile = ({ icon, label, value }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.6,
      borderRadius: 2,
      border: "1px solid rgba(45,0,82,0.09)",
      bgcolor: "#fff",
      minHeight: 88,
    }}
  >
    <Stack direction="row" spacing={1.2} alignItems="center">
      <Box sx={{ color: "#8b3ba8", display: "grid", placeItems: "center" }}>
        {icon}
      </Box>
      <Box minWidth={0}>
        <Typography fontSize={12} color="#7b7280" fontWeight={800}>
          {label}
        </Typography>
        <Typography color="#171827" fontWeight={900} noWrap>
          {value || "Not provided"}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const MemberProfilePreview = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [member, setMember] = useState(null);
  const [mergeStatus, setMergeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUserId || !memberId) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const [profileRes, statusRes] = await Promise.all([
          axiosInstance.get(
            `${import.meta.env.VITE_BASE_URL}/api/user/public-profile/${memberId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axiosInstance.get(
            `${
              import.meta.env.VITE_BASE_URL
            }/api/merge/status?member1=${currentUserId}&member2=${memberId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        setMember(profileRes.data?.member || null);
        setMergeStatus(statusRes.data || {});
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load this profile right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUserId, memberId, navigate, token]);

  const canChat = Boolean(mergeStatus?.canChat);
  const primaryAction = useMemo(() => {
    if (canChat) {
      return {
        label: "Chat Now",
        icon: <ChatIcon />,
        onClick: () => navigate(`/chat/${currentUserId}/${memberId}`),
      };
    }

    return {
      label: "Merge",
      icon: <FavoriteIcon />,
      onClick: () => navigate(`/merge/${currentUserId}/${memberId}`),
    };
  }, [canChat, currentUserId, memberId, navigate]);

  if (loading) {
    return (
      <Box minHeight="100vh" display="grid" placeItems="center" bgcolor="#181c2b">
        <CircularProgress sx={{ color: "#ec4899" }} />
      </Box>
    );
  }

  if (error || !member) {
    return (
      <Box minHeight="100vh" display="grid" placeItems="center" bgcolor="#181c2b" p={2}>
        <Paper sx={{ p: 3, borderRadius: 2, textAlign: "center", maxWidth: 420 }}>
          <Typography fontWeight={900} color="#171827" mb={1}>
            Profile unavailable
          </Typography>
          <Typography color="#6b7280" mb={2}>
            {error || "This member profile could not be loaded."}
          </Typography>
          <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />}>
            Go Back
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      sx={{
        background:
          "linear-gradient(135deg, #181c2b 0%, #232526 42%, #2d0052 72%, #b993d6 100%)",
        px: { xs: 1.5, sm: 2.5, md: 4 },
        py: { xs: 2, sm: 4 },
      }}
    >
      <Box maxWidth={1120} mx="auto">
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          sx={{
            mb: 2,
            color: "#fff",
            textTransform: "none",
            fontWeight: 900,
            bgcolor: "rgba(255,255,255,0.1)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
          }}
        >
          Back
        </Button>

        <Paper
          elevation={18}
          sx={{
            overflow: "hidden",
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.28)",
            boxShadow: "0 28px 80px rgba(0,0,0,0.32)",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "390px minmax(0,1fr)" },
              minHeight: 520,
            }}
          >
            <Box
              sx={{
                position: "relative",
                minHeight: { xs: 360, md: "auto" },
                bgcolor: "#171827",
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
                    maxHeight: { xs: 460, md: 620 },
                    objectFit: "contain",
                    imageRendering: "auto",
                    bgcolor: "#171827",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    minHeight: 360,
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(145deg, #f7eefb, #eef2ff)",
                  }}
                >
                  <ImageIcon sx={{ fontSize: 86, color: "#9d63b7" }} />
                </Box>
              )}

              <Box
                sx={{
                  position: "absolute",
                  left: 16,
                  right: 16,
                  bottom: 16,
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  label={getLastSeenLabel(member)}
                  sx={{
                    color: "#fff",
                    fontWeight: 900,
                    bgcolor: member.isOnline ? "#15803d" : "rgba(17,24,39,0.84)",
                    border: "1px solid rgba(255,255,255,0.34)",
                  }}
                />
                <Chip
                  label={member.subscriptionTier || "Free"}
                  sx={{
                    color: "#fff",
                    fontWeight: 900,
                    bgcolor: "rgba(139,59,168,0.92)",
                    border: "1px solid rgba(255,255,255,0.34)",
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#fbf9fc" }}>
              <Stack spacing={2.5}>
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      src={member.photo || ""}
                      sx={{ width: 58, height: 58, bgcolor: "#8b3ba8" }}
                    >
                      {member.name?.[0] || "U"}
                    </Avatar>
                    <Box minWidth={0}>
                      <Typography
                        variant="h4"
                        fontWeight={950}
                        color="#171827"
                        sx={{ fontSize: { xs: 26, sm: 34 } }}
                      >
                        {member.name || member.username}
                      </Typography>
                      <Typography color="#6b7280" fontWeight={800}>
                        @{member.username || "member"}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    icon={<FavoriteIcon />}
                    label={member.relationshipType || "Relationship goal"}
                    sx={{ bgcolor: "#f7eefb", color: "#6f2a86", fontWeight: 900 }}
                  />
                  <Chip
                    icon={<WorkspacePremiumIcon />}
                    label={canChat ? "Chat access ready" : "Read before merge"}
                    sx={{ bgcolor: "#eef2ff", color: "#3730a3", fontWeight: 900 }}
                  />
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 1.4,
                  }}
                >
                  <InfoTile
                    icon={<PersonIcon />}
                    label="Age / Gender"
                    value={`${member.age || "-"} - ${member.gender || "-"}`}
                  />
                  <InfoTile icon={<LocationOnIcon />} label="Location" value={member.location} />
                  <InfoTile icon={<WorkIcon />} label="Occupation" value={member.occupation} />
                  <InfoTile icon={<FavoriteIcon />} label="Relationship" value={member.relationshipType} />
                </Box>

                <Divider />

                <Box>
                  <Typography fontWeight={950} color="#171827" mb={1}>
                    About this member
                  </Typography>
                  <Typography
                    color="#4b5563"
                    sx={{ lineHeight: 1.8, whiteSpace: "pre-line" }}
                  >
                    {member.description || "This member has not added a profile description yet."}
                  </Typography>
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "#171827",
                    color: "#fff",
                  }}
                >
                  <Typography fontWeight={950} mb={0.5}>
                    Before you connect
                  </Typography>
                  <Typography color="rgba(255,255,255,0.72)" fontSize={14}>
                    Check their goal, location, activity, and profile description. If it feels right, merge or start chatting.
                  </Typography>
                </Paper>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={primaryAction.icon}
                    onClick={primaryAction.onClick}
                    sx={{
                      py: 1.2,
                      borderRadius: 1.5,
                      textTransform: "none",
                      fontWeight: 950,
                      background: "linear-gradient(90deg, #ec4899, #8b3ba8)",
                    }}
                  >
                    {primaryAction.label}
                  </Button>
                  {!canChat && (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate(`/merge/${currentUserId}/${memberId}`)}
                      sx={{
                        py: 1.2,
                        borderRadius: 1.5,
                        textTransform: "none",
                        fontWeight: 950,
                        borderColor: "#8b3ba8",
                        color: "#6f2a86",
                      }}
                    >
                      See Plans
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default MemberProfilePreview;
