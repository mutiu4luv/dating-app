import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useLocation, useNavigate } from "react-router-dom";
import api from "./api/Api";

const BRAND_DARK = "#2d0052";
const BRAND_PINK = "#D9A4F0";

const ProfilePhotoPrompt = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token || location.pathname === "/profile") return;

    const sessionKey = `profilePhotoPromptDismissed_${userId}`;
    if (sessionStorage.getItem(sessionKey) === "true") return;

    let cancelled = false;

    const showPrompt = () => {
      if (!cancelled) setOpen(true);
    };

    const checkPhoto = async () => {
      try {
        const res = await api.get(`/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const photoUrl = res.data?.photo;

        if (!photoUrl) {
          showPrompt();
          return;
        }

        const image = new Image();
        image.onload = () => {
          if (!cancelled) setOpen(false);
        };
        image.onerror = showPrompt;
        image.src = photoUrl;
      } catch {
        showPrompt();
      }
    };

    const timer = window.setTimeout(checkPhoto, 1200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [location.pathname]);

  const dismiss = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      sessionStorage.setItem(`profilePhotoPromptDismissed_${userId}`, "true");
    }
    setOpen(false);
  };

  const goToProfile = () => {
    dismiss();
    navigate("/profile");
  };

  if (!open) return null;

  return (
    <Paper
      elevation={10}
      sx={{
        position: "fixed",
        right: { xs: 12, sm: 24 },
        bottom: { xs: 86, sm: 24 },
        zIndex: 1600,
        width: { xs: "calc(100% - 24px)", sm: 380 },
        borderRadius: 4,
        border: "1px solid rgba(217,164,240,0.55)",
        boxShadow: "0 22px 55px rgba(45,0,82,0.22)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 2.2,
          background:
            "linear-gradient(135deg, rgba(45,0,82,0.98), rgba(139,59,168,0.94))",
          color: "#fff",
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
        }}
      >
        <Avatar sx={{ bgcolor: BRAND_PINK, color: BRAND_DARK }}>
          <PhotoCameraIcon />
        </Avatar>
        <Box flex={1}>
          <Typography fontWeight={900}>Update your profile photo</Typography>
          <Typography variant="body2" sx={{ opacity: 0.88, mt: 0.5 }}>
            A clear photo helps people recognize you and feel confident starting
            a conversation.
          </Typography>
        </Box>
        <IconButton size="small" onClick={dismiss} sx={{ color: "#fff" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ p: 2, display: "flex", gap: 1.2, justifyContent: "flex-end" }}>
        <Button
          onClick={dismiss}
          sx={{ color: BRAND_DARK, fontWeight: 800, textTransform: "none" }}
        >
          Later
        </Button>
        <Button
          variant="contained"
          onClick={goToProfile}
          sx={{
            bgcolor: BRAND_DARK,
            color: "#fff",
            fontWeight: 900,
            textTransform: "none",
            borderRadius: 2,
            "&:hover": { bgcolor: "#4b087c" },
          }}
        >
          Update photo
        </Button>
      </Box>
    </Paper>
  );
};

export default ProfilePhotoPrompt;
