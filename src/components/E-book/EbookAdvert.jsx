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
  Container,
  Grid,
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

// Subtle, professional pulse instead of a fast blink
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(217, 164, 240, 0.7); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(217, 164, 240, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(217, 164, 240, 0); }
`;

const COPY_URL = "https://truematchup.com/";
const images = [ebook, ebook1, ebook2, ebook3];

const EbookAdvert = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [imageIndex, setImageIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(COPY_URL);
      setCopied(true);
      setOpen(true);
    } catch (err) {
      setCopied(false);
      setOpen(true);
    }
  };

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <Box sx={{ backgroundColor: "#D9A4F0", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        {/* Main eBook Offer Card */}
        <Card
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            borderRadius: 6,
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
            overflow: "hidden",
            border: "1px solid rgba(217, 164, 240, 0.3)",
            background: "#fff",
            mb: 8,
          }}
        >
          <CardMedia
            component="img"
            image={images[imageIndex]}
            alt="Relationship eBook"
            sx={{
              width: isMobile ? "100%" : 450,
              height: isMobile ? 300 : 450,
              objectFit: "cover",
              transition: "all 0.8s ease-in-out",
            }}
          />

          <CardContent
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              p: { xs: 4, md: 6 },
              backgroundColor: "#fafafa",
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <FavoriteIcon sx={{ color: "#D9A4F0", mr: 1.5, fontSize: 30 }} />
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{ color: "#1a1a1a", lineHeight: 1.2 }}
              >
                Find Love & End <br />
                <span style={{ color: "#D9A4F0" }}>Singlehood.</span>
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{ color: "#555", mb: 4, fontSize: "1.1rem", lineHeight: 1.6 }}
            >
              Building a lasting connection starts with the right knowledge.
              Subscribe today and receive our exclusive relationship e-books
              **for free**.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={() => (window.location.href = "/register")}
              startIcon={<LibraryBooksIcon />}
              sx={{
                background: "#000",
                color: "#fff",
                fontWeight: 800,
                borderRadius: "50px",
                px: 5,
                py: 2,
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                "&:hover": {
                  background: "#D9A4F0",
                  color: "#000",
                },
              }}
            >
              Register & Claim Free Ebook
            </Button>
          </CardContent>
        </Card>

        <Grid container spacing={4} justifyContent="center">
          {/* Online Book Section */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: "100%",
                background: "#fff",
                p: 4,
                borderRadius: 6,
                border: "1px solid #eee",
                textAlign: "center",
                transition: "0.3s",
                "&:hover": { boxShadow: "0 15px 30px rgba(0,0,0,0.05)" },
              }}
            >
              <Link
                href="https://davidonu.com/intimate-relationship/"
                target="_blank"
                sx={{ textDecoration: "none" }}
              >
                <img
                  src={online}
                  alt="Intimate Relationship"
                  style={{
                    width: "100%",
                    borderRadius: "16px",
                    marginBottom: "20px",
                  }}
                />
                <Typography variant="h6" fontWeight={800} color="#1a1a1a">
                  Intimate Relationship
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="#D9A4F0"
                  fontWeight={700}
                >
                  By David Onu
                </Typography>
              </Link>
              <Typography variant="body2" color="#666" sx={{ mt: 2, mb: 3 }}>
                Deepen your emotional intelligence and master the art of
                companionship.
              </Typography>
              <Button
                variant="outlined"
                href="https://davidonu.com/intimate-relationship/"
                target="_blank"
                sx={{
                  borderColor: "#000",
                  color: "#000",
                  borderRadius: "50px",
                  px: 4,
                  fontWeight: 700,
                  "&:hover": { borderColor: "#D9A4F0", color: "#D9A4F0" },
                }}
              >
                Read Online
              </Button>
            </Box>
          </Grid>

          {/* Refer & Earn Section */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: "100%",
                background: "#000", // Dark card for contrast on white bg
                color: "#fff",
                p: 4,
                borderRadius: 6,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MonetizationOnIcon
                sx={{ color: "#D9A4F0", fontSize: 50, mb: 2 }}
              />
              <Typography variant="h5" fontWeight={800} mb={2}>
                Invite Your Friends
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "rgba(255,255,255,0.7)", mb: 4 }}
              >
                Share the love! Earn rewards for every successful referral when
                your friends join our community.
              </Typography>

              <Tooltip title="Click to copy link">
                <Box
                  onClick={copyToClipboard}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: 3,
                    py: 1.5,
                    borderRadius: "50px",
                    background: "rgba(217, 164, 240, 0.1)",
                    border: "1px border solid #D9A4F0",
                    cursor: "pointer",
                    animation: `${pulse} 2s infinite`,
                    "&:hover": { background: "rgba(217, 164, 240, 0.2)" },
                  }}
                >
                  <Typography fontWeight={700} color="#D9A4F0">
                    {copied ? "Copied Success!" : "Copy Referral Link"}
                  </Typography>
                  {copied ? (
                    <CheckIcon sx={{ color: "#D9A4F0" }} />
                  ) : (
                    <ContentCopyIcon sx={{ color: "#D9A4F0" }} />
                  )}
                </Box>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        <Snackbar open={open} autoHideDuration={2500} onClose={handleClose}>
          <Alert severity={copied ? "success" : "error"} sx={{ width: "100%" }}>
            {copied ? "Link copied to clipboard!" : "Failed to copy link"}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default EbookAdvert;
