import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  useMediaQuery,
  keyframes,
  Link,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

import ebook from "../../assets/images/ebook.jpeg";
import ebook1 from "../../assets/images/ebook1.jpeg";
import ebook2 from "../../assets/images/ebook2.jpeg";
import ebook3 from "../../assets/images/ebook3.jpeg";
import online from "../../assets/images/online.webp";

// Animation
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const COPY_URL = "https://truematchup.com/";

const images = [ebook, ebook1, ebook2, ebook3];

const EbookAdvert = () => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const [imageIndex, setImageIndex] = useState(0);

  // copy button states
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // rotating image
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // copy function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(COPY_URL);
      setCopied(true);
      setOpen(true);
    } catch (err) {
      console.error("Copy failed", err);
      setCopied(false);
      setOpen(true);
    }
  };

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, #ffe0ec 0%, #fad0c4 50%, #fad0c4 100%)",
        py: 6,
        px: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Main Card */}
      <Card
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          maxWidth: 1000,
          borderRadius: 5,
          boxShadow: "0 12px 32px rgba(236, 72, 153, 0.3)",
          overflow: "hidden",
          border: "2px solid #D9A4F0",
          background: "#fff",
        }}
      >
        <CardMedia
          component="img"
          image={images[imageIndex]}
          alt="Relationship eBook"
          sx={{
            width: isMobile ? "100%" : 400,
            height: isMobile ? 250 : "100%",
            objectFit: "cover",
            borderRight: isMobile ? "none" : "2px solid #D9A4F0",
            transition: "opacity 1s ease-in-out",
          }}
        />

        <CardContent
          sx={{
            background: "#fff0f6",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            p: 4,
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <FavoriteIcon sx={{ color: "#D9A4F0", mr: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="#D9A4F0">
              Find Love & Say Goodbye to Singlehood.
            </Typography>
          </Box>

          <Typography variant="body1" color="#4b5563" mb={2}>
            Subscribe now and get our exclusive relationship e-books for FREE as
            a gift.
          </Typography>

          <Button
            variant="contained"
            size="large"
            sx={{
              background: "linear-gradient(90deg, #D9A4F0 0%, #b993d6 100%)",
              fontWeight: "bold",
              borderRadius: 3,
              mt: 2,
              alignSelf: "flex-start",
              px: 4,
              py: 1.5,
              animation: `${blink} 1.8s infinite ease-in-out`,
              boxShadow: "0 0 10px #D9A4F0",
              "&:hover": {
                background: "linear-gradient(90deg, #db2777 0%, #a78bfa 100%)",
              },
            }}
            startIcon={<LibraryBooksIcon />}
            onClick={() => (window.location.href = "/register")}
          >
            Register & Get Free Ebook
          </Button>
        </CardContent>
      </Card>

      {/* Online Book Section */}
      <Box
        sx={{
          mt: 5,
          textAlign: "center",
          maxWidth: 500,
          background: "#fff",
          p: 3,
          borderRadius: 4,
          border: "2px solid #D9A4F0",
          boxShadow: "0 8px 24px rgba(236, 72, 153, 0.2)",
        }}
      >
        <Link
          href="https://davidonu.com/intimate-relationship/"
          target="_blank"
          underline="none"
          sx={{
            display: "inline-block",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.05)" },
          }}
        >
          <img
            src={online}
            alt="Intimate Relationship Book"
            style={{
              width: "100%",
              borderRadius: 8,
              boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
            }}
          />
          <Typography
            mt={1}
            variant="subtitle1"
            fontWeight="bold"
            sx={{
              color: "#D946EF",
              animation: `${blink} 1.8s infinite ease-in-out`,
            }}
          >
            Intimate Relationship – David Onu
          </Typography>
        </Link>

        <Typography variant="body2" color="#4b5563" mt={2}>
          Discover how to build deep, meaningful relationships and improve your
          love life.
        </Typography>

        <Button
          variant="contained"
          sx={{
            mt: 3,
            backgroundColor: "#9333EA",
            fontWeight: "bold",
            animation: `${blink} 1.8s infinite ease-in-out`,
            "&:hover": {
              backgroundColor: "#7e22ce",
            },
          }}
          href="https://davidonu.com/intimate-relationship/"
          target="_blank"
        >
          Read Now
        </Button>
      </Box>

      {/* Refer & Earn Section */}
      <Box
        sx={{
          mt: 6,
          textAlign: "center",
          maxWidth: 500,
          background: "#fff",
          p: 3,
          borderRadius: 4,
          border: "2px solid #D9A4F0",
          boxShadow: "0 8px 24px rgba(236, 72, 153, 0.18)",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <MonetizationOnIcon sx={{ color: "#D9A4F0", fontSize: 32, mr: 1 }} />
          <Typography variant="h6" fontWeight="bold" color="#D9A4F0">
            Invite Your Single Friends
          </Typography>
        </Box>

        <Typography variant="body1" color="#4b5563" mb={2}>
          Share our website link with friends and family and earn rewards for
          every successful referral!
        </Typography>

        {/* COPY SIGN */}
        <Box
          onClick={copyToClipboard}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2,
            background:
              "linear-gradient(135deg, rgba(217,164,240,0.12), rgba(255,64,129,0.08))",
            border: "1px solid rgba(45,0,82,0.06)",
            cursor: "pointer",
            userSelect: "none",
            transition: "transform .12s ease, box-shadow .12s ease",
            "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
          }}
        >
          <Tooltip title="Click to copy link">
            <Button
              size="small"
              startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: "#2d0052",
                background: "transparent",
                "&:hover": { background: "transparent" },
                boxShadow: "none",
                px: 0,
              }}
            >
              {copied ? "Copied!" : "Copy Truematchup Link"}
            </Button>
          </Tooltip>
        </Box>

        <Snackbar open={open} autoHideDuration={2500} onClose={handleClose}>
          <Alert
            onClose={handleClose}
            severity={copied ? "success" : "error"}
            sx={{ width: "100%" }}
          >
            {copied ? "Link copied to clipboard!" : "Failed to copy link"}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default EbookAdvert;
