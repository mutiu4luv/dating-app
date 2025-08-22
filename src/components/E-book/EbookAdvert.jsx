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
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ebook from "../../assets/images/ebook.jpeg";
import ebook1 from "../../assets/images/ebook1.jpeg";
import ebook2 from "../../assets/images/ebook2.jpeg";
import ebook3 from "../../assets/images/ebook3.jpeg";
import online from "../../assets/images/online.webp";

// Blinking animation
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const images = [ebook, ebook1, ebook2, ebook3];

const EbookAdvert = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

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
              Find Love here & say goodbye bye to Singlehood.
            </Typography>
          </Box>

          <Typography variant="body1" color="#4b5563" mb={2}>
            Subscribe now and grab our exclusive relationship e-books above for
            FREE as a gift. Absolutely all free!
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
            Register, Subscribe & Get Free Ebook
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
          Discover the secrets to a fulfilling relationship with our online
          book. Learn how to communicate effectively, resolve conflicts, and
          build a deeper connection with your partner.
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

      {/* Refer and Earn Section */}
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
            Refer and Earn
          </Typography>
        </Box>
        <Typography variant="body1" color="#4b5563" mb={2}>
          Share our website link with friends and family and get a rewards for
          every successful referral! Help others find love and earn rewards for
          growing our community.
        </Typography>
        <Button
          variant="contained"
          startIcon={<WhatsAppIcon />}
          sx={{
            background: "linear-gradient(90deg, #25D366 60%, #D9A4F0 100%)",
            fontWeight: "bold",
            borderRadius: 3,
            px: 4,
            py: 1.5,
            animation: `${blink} 1.8s infinite ease-in-out`,
            boxShadow: "0 0 10px #25D366",
            "&:hover": {
              background: "linear-gradient(90deg, #128C7E 60%, #a78bfa 100%)",
            },
          }}
          href="https://wa.me/2347050605491?text=Hi!%20I'm%20interested%20in%20the%20Refer%20and%20Earn%20program%20on%20FindYourMatch.%20Please%20give%20me%20more%20details."
          target="_blank"
        >
          Refer Now via WhatsApp
        </Button>
      </Box>
    </Box>
  );
};

export default EbookAdvert;
