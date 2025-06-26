import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

// Blinking animation
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const EbookAdvert = () => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, #ffe0ec 0%, #fad0c4 50%, #fad0c4 100%)",
        py: 6,
        px: 2,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          maxWidth: 1000,
          borderRadius: 5,
          boxShadow: "0 12px 32px rgba(236, 72, 153, 0.3)",
          overflow: "hidden",
          border: "2px solid #ec4899",
          background: "#fff",
        }}
      >
        <CardMedia
          component="img"
          image="https://cdn.pixabay.com/photo/2016/11/29/05/08/adult-1867093_1280.jpg"
          alt="Relationship eBook"
          sx={{
            width: isMobile ? "100%" : 400,
            height: isMobile ? 250 : "100%",
            objectFit: "cover",
            borderRight: isMobile ? "none" : "2px solid #ec4899",
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
            <FavoriteIcon sx={{ color: "#ec4899", mr: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="#db2777">
              Find Love & Learn Together
            </Typography>
          </Box>

          <Typography variant="body1" color="#4b5563" mb={2}>
            Subscribe now and stand a chance to meet your perfect match. As a
            special gift, get our exclusive e-book:
            <strong>
              {" "}
              “Love That Lasts – Secrets to a Strong Relationship”
            </strong>{" "}
            absolutely free!
          </Typography>

          <Button
            variant="contained"
            size="large"
            sx={{
              background: "linear-gradient(90deg, #ec4899 0%, #b993d6 100%)",
              fontWeight: "bold",
              borderRadius: 3,
              mt: 2,
              alignSelf: "flex-start",
              px: 4,
              py: 1.5,
              animation: `${blink} 1.8s infinite ease-in-out`,
              boxShadow: "0 0 10px #ec4899",
              "&:hover": {
                background: "linear-gradient(90deg, #db2777 0%, #a78bfa 100%)",
              },
            }}
            startIcon={<LibraryBooksIcon />}
            onClick={() => (window.location.href = "/register")}
          >
            Register, Subscribe & Get Book
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EbookAdvert;
