import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from "@mui/material";
import single from "../../assets/images/single.webp";
import girls from "../../assets/images/girls.avif";
import vers from "../../assets/images/vers.jpg";
import member from "../../assets/images/member.webp";
import start from "../../assets/images/start.avif";

const steps = [
  {
    title: "1. Create A Profile",
    text: "Create your profile in seconds with our easy sign-up. Don't forget to add a photo!",
    image: single,
  },
  {
    title: "2.  Subscribe and have access to free relationship ebooks",
    text: "Get instant access to carefully selected relationship ebooks to guide you on love, dating, and lasting companionship.",
    image: girls,
  },
  {
    title: "3. Start Communicating",
    text: "Connect with white men/white women.",
    image: vers,
  },
  {
    title: " 4. Browse members and find your match",
    text: "Discover a wide range of members based on your preferences and connect with someone who truly matches your vibe.",
    image: member,
  },
  {
    title: "3. Start chatting",
    text: "Send messages instantly and build genuine connections through real-time chat.",
    image: start,
  },
];

const HowItWorks = () => {
  return (
    <Box sx={{ bgcolor: "#fdf6f9", py: 10 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "#ec4899" }}
        >
          How It Works
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="textSecondary"
          sx={{ mb: 6 }}
        >
          Get started on lovedating.com today in 3 simple steps:
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {steps.map((step, index) => (
            <Grid item xs={12} sm={4} md={4} key={index}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 180,
                    height: 180,
                    borderRadius: "50%",
                    overflow: "hidden",
                    boxShadow: 4,
                    mb: 2,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={step.image}
                    alt={step.title}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
                <CardContent sx={{ maxWidth: 260 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ color: "#db2777" }}
                  >
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.text}
                  </Typography>
                </CardContent>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 6,
              py: 1.8,
              fontSize: "1rem",
              backgroundColor: "#D9A4F0",
              color: "#2d0052",
              fontWeight: "bold",
              borderRadius: "30px",
              ":hover": { backgroundColor: "#db2777" },
              boxShadow: 3,
            }}
          >
            Find Your Match
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;
