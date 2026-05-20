import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";

const AgeGate = () => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true);
  }, []);

  const handleContinue = () => {
    setOpen(false);
  };

  const handleExit = () => {
    window.location.replace("https://www.google.com");
  };

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(217, 164, 240, 0.45)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          pt: 3,
          color: "#2d0052",
          background: "linear-gradient(135deg, #D9A4F0 0%, #fdf2f8 100%)",
        }}
      >
        <FavoriteIcon sx={{ fontSize: 42 }} />
      </Box>

      <DialogTitle
        sx={{
          pt: 2,
          textAlign: "center",
          fontWeight: 800,
          color: "#2d0052",
          background: "linear-gradient(135deg, #D9A4F0 0%, #fdf2f8 100%)",
        }}
      >
        Are you 18 or older?
      </DialogTitle>

      <DialogContent sx={{ pt: 3, textAlign: "center", bgcolor: "#fff" }}>
        <Typography sx={{ color: "#4b255f", lineHeight: 1.6 }}>
          Truematchup is for adults only. Please confirm your age before using
          the site.
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          gap: 1,
          bgcolor: "#fff",
          justifyContent: "center",
        }}
      >
        <Button
          variant="outlined"
          onClick={handleExit}
          sx={{
            borderColor: "#D9A4F0",
            color: "#2d0052",
            fontWeight: 700,
            borderRadius: 3,
            px: 3,
          }}
        >
          Exit
        </Button>
        <Button
          variant="contained"
          onClick={handleContinue}
          sx={{
            bgcolor: "#D9A4F0",
            color: "#2d0052",
            fontWeight: 800,
            borderRadius: 3,
            px: 3,
            "&:hover": { bgcolor: "#c886e7" },
          }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgeGate;
