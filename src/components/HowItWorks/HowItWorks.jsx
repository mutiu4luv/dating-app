import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Assets
import single from "../../assets/images/single.webp";
import girls from "../../assets/images/girls.avif";
import vers from "../../assets/images/vers.jpg";
import member from "../../assets/images/member.webp";
import start from "../../assets/images/start.avif";

const steps = [
  {
    title: "1. Create A Profile",
    text: "Create your profile in seconds with our easy sign-up. Don't forget a photo!",
    image: single,
  },
  {
    title: "2. Unlock Ebooks",
    text: "Get instant access to carefully selected relationship ebooks.",
    image: girls,
  },
  {
    title: "3. Start Communicating",
    text: "Connect with white men/white women and start building connections.",
    image: vers,
  },
  {
    title: "4. Browse & Match",
    text: "Discover members based on your preferences and match your vibe.",
    image: member,
  },
  {
    title: "5. Real-Time Chat",
    text: "Send messages instantly and build genuine connections through chat.",
    image: start,
  },
];

const userId = localStorage.getItem("userId");
const MotionBox = motion(Box);

const HowItWorks = () => {
  return (
    <Box sx={{ backgroundColor: "#0f0f0f", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "#fff", mb: 1.5 }}
          >
            How It <span style={{ color: "#D9A4F0" }}>Works</span> 💜
          </Typography>
          <Typography
            sx={{
              maxWidth: 520,
              mx: "auto",
              color: "rgba(255,255,255,0.7)",
              fontSize: 15,
            }}
          >
            Get started on FindYourMatch today in 5 simple steps.
          </Typography>
        </Box>

        {/* Steps Grid */}
        <Grid
          container
          spacing={{ xs: 3, sm: 3, md: 7 }} // Increased xs spacing for better mobile look
          justifyContent="center"
          alignItems="center" // Ensures items are vertically aligned if heights vary
          sx={{ maxWidth: 1100, mx: "auto", px: 2 }}
        >
          {steps.map((step, index) => (
            <Grid
              item
              xs={11} // Use 11 instead of 12 to show a tiny bit of the background on edges
              sm={6} // Two cards per row on tablets
              md={4} // Three cards per row on desktop
              key={index}
              sx={{ display: "flex", justifyContent: "center" }} // Extra centering insurance
            >
              <MotionBox
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                viewport={{ once: true }}
                sx={{
                  backgroundColor: "#0f0f0f",
                  borderRadius: 3,
                  p: 2.5,
                  width: "100%",
                  maxWidth: { xs: 320, sm: "100%" }, // Prevents cards from getting too wide on mobile
                  height: { xs: 180, sm: 190, md: 210 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-around",
                  textAlign: "center",
                  border: "1px solid rgba(217,164,240,0.25)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 18px 40px rgba(217,164,240,0.4)",
                    borderColor: "#D9A4F0",
                  },
                }}
              >
                <Avatar
                  src={step.image}
                  alt={step.title}
                  sx={{
                    width: { xs: 65, sm: 70, md: 85 },
                    height: { xs: 65, sm: 70, md: 85 },
                    border: "2px solid #D9A4F0",
                    bgcolor: "#fff",
                  }}
                />

                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: { xs: 13, sm: 14, md: 15 },
                    lineHeight: 1.2,
                  }}
                >
                  {step.title}
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: { xs: 11, sm: 12, md: 13 },
                    lineHeight: 1.4,
                    maxWidth: 240,
                  }}
                >
                  {step.text}
                </Typography>
              </MotionBox>
            </Grid>
          ))}
        </Grid>

        {/* CTA Button */}
        <Box sx={{ textAlign: "center", mt: 10 }}>
          <Link to={`/members/${userId}`} style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={{
                px: 6,
                py: 1.8,
                background: "linear-gradient(45deg, #D9A4F0 30%, #bf72e8 90%)",
                color: "#000",
                fontWeight: "bold",
                borderRadius: "30px",
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  background: "#fff",
                  transform: "scale(1.05)",
                },
              }}
            >
              Find Your Match
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;
