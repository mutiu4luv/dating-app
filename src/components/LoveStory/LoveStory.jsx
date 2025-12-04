import React from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Container,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";

import ezinne from "../../assets/images/ezinne.jpeg";
import david from "../../assets/images/david.jpeg";
import mutiu from "../../assets/images/mutiu.jpeg";
import martins from "../../assets/images/martin.jpeg";

const testimonies = [
  {
    image: david,
    name: "David & Favour",
    text: "We met in the most unexpected way — and now we're inseparable.",
  },
  {
    image: ezinne,
    name: "Ugochukwu & Ezinne",
    text: "From strangers to soulmates, our journey is a testament to love.",
  },
  {
    image: mutiu,
    name: "Mutiu & Sophia",
    text: "Our love story started with a simple chat, now it's a lifetime.",
  },
];

const LoveStory = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // 🔥 Get logged-in userId from localStorage
  const userId = localStorage.getItem("userId") || "guest";
  const upgradeLink = `/merge/${userId}/upgrade`;
  // 🔥 Dynamic upgrade link

  const visibleTestimonies = isSmallScreen
    ? testimonies.slice(0, 3)
    : testimonies;

  return (
    <Box sx={{ bgcolor: "#fff0f5", py: 8 }}>
      <Container>
        {/* 🔥 Blinking Upgrade Button */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Button
            component={Link}
            to={upgradeLink}
            variant="contained"
            sx={{
              backgroundColor: "#ff4081",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "25px",
              px: 4,
              py: 1.2,
              fontSize: "1rem",
              animation: "blink 1.2s infinite",
              "@keyframes blink": {
                "0%": { opacity: 1 },
                "50%": { opacity: 0.4 },
                "100%": { opacity: 1 },
              },
              "&:hover": { backgroundColor: "#ff5c95" },
            }}
          >
            Upgrade to a Higher Plan to Chat With More People
          </Button>
        </Box>

        {/* Title */}
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 6 }}
        >
          ❤️ Real Love Stories
        </Typography>

        {/* Testimonies */}
        <Grid container spacing={4} justifyContent="center">
          {visibleTestimonies.map((story, index) => (
            <Grid item xs={12} sm={4} md={4} key={index}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Card
                  sx={{
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    overflow: "hidden",
                    boxShadow: 4,
                    mb: 2,
                    transition: "transform 0.3s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={story.image}
                    alt={story.name}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Card>
                <CardContent sx={{ p: 0, maxWidth: 240 }}>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {story.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {story.text}
                  </Typography>
                </CardContent>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LoveStory;
