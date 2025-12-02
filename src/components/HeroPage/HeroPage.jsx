import React from "react";
import { motion } from "framer-motion";
import { Box, Typography, Button } from "@mui/material";
import bgImg from "../../assets/images/background.jpeg";
import { Typewriter } from "react-simple-typewriter";

import "../HeroPage/HeroPage.css";
import { Link } from "react-router-dom";

const HeroPage = () => {
  return (
    <Box
      sx={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        height: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflow: "hidden",
        pt: 5,
      }}
    >
      {/* Gradient Blur Layer */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom right, #D9A4F0, #fca5a5, #fde68a)",
          opacity: 0.25,
          filter: "blur(120px)",
          zIndex: 0,
        }}
      />

      {/* === RATED 18 BADGE (Above Container) === */}
      <motion.div
        initial={{ opacity: 0, y: -20, rotate: -10 }}
        animate={{
          opacity: 1,
          y: [0, -10, 0], // bounce
          rotate: [-10, 10, -10], // wiggle
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          top: 10,
          zIndex: 20,
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            backgroundColor: "#ff0033",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "1.2rem",
            border: "3px solid white",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
          }}
        >
          18+
        </Box>
      </motion.div>

      {/* Overlay Container */}
      <Box
        sx={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          px: 3,
          py: 4,
          maxWidth: 800,
          borderRadius: 4,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "#fff",
        }}
      >
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Find Love, Real Connections
          </Typography>
        </motion.div>

        {/* Subheading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Typography variant="h6" sx={{ color: "#fce7f3" }} gutterBottom>
            Join thousands who have already started their love journey. Swipe,
            chat, and find your person.
          </Typography>
        </motion.div>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              mt: 3,
              px: 5,
              py: 1.5,
              fontSize: "1rem",
              borderRadius: "50px",
              backgroundColor: "#D9A4F0",
              ":hover": { backgroundColor: "#db2777" },
              boxShadow: 3,
            }}
          >
            <Link
              to="/login"
              style={{ textDecoration: "none", color: "#2d0052" }}
            >
              Get Started
            </Link>
          </Button>
        </motion.div>
      </Box>

      {/* Footer Text */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          width: "100%",
          textAlign: "center",
          color: "#f5f5f5",
          fontSize: 14,
          zIndex: 10,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          py: 1,
        }}
      >
        <Typewriter
          words={["Made with ❤️ for modern love"]}
          loop={false}
          cursor
          cursorStyle="|"
          typeSpeed={80}
          deleteSpeed={50}
          delaySpeed={2000}
        />
      </Box>
    </Box>
  );
};

export default HeroPage;
