import { Box, Button, Paper, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";

const titleMap = {
  "learning-hub": "Learning Hub",
  "dating-safety-tips": "Dating Safety Tips",
  "contact-us": "Contact Us",
};

const ComingSoon = () => {
  const navigate = useNavigate();
  const { page } = useParams();
  const title = titleMap[page] || "Coming Soon";

  return (
    <>
      <Navbar />
      <Box
        minHeight="100vh"
        display="grid"
        sx={{
          placeItems: "center",
          px: 2,
          py: 6,
          bgcolor: "#f7f2fb",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 560,
            textAlign: "center",
            p: { xs: 3, sm: 5 },
            borderRadius: 2,
            border: "1px solid rgba(45,0,82,0.12)",
            bgcolor: "#fff",
          }}
        >
          <Box
            sx={{
              width: 68,
              height: 68,
              mx: "auto",
              mb: 2,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "#f3e8ff",
              color: "#2d0052",
            }}
          >
            <AutoAwesomeIcon fontSize="large" />
          </Box>
          <Typography variant="h4" fontWeight={950} color="#2d0052">
            {title}
          </Typography>
          <Typography color="#6b4679" mt={1.5}>
            This section is coming soon. We are preparing a better experience
            for members.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              mt: 4,
              bgcolor: "#2d0052",
              fontWeight: 900,
              borderRadius: 1.5,
              "&:hover": { bgcolor: "#4b087c" },
            }}
          >
            Go Back
          </Button>
        </Paper>
      </Box>
    </>
  );
};

export default ComingSoon;
