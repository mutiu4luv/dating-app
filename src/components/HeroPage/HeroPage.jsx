import React from "react";
import { motion } from "framer-motion";
import { Box, Typography, Button } from "@mui/material";
// import '../HeroPage/'
const HeroPage = () => {
  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        bgcolor: "#fff0f5",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom right, #f472b6, #fca5a5, #fde68a)",
          opacity: 0.3,
          filter: "blur(120px)",
          zIndex: 0,
        }}
      />

      {/* Main Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          px: 3,
          maxWidth: 800,
        }}
      >
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Join thousands who have already started their love journey. Swipe,
            chat, and find your person.
          </Typography>
        </motion.div>

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
              backgroundColor: "#ec4899",
              ":hover": { backgroundColor: "#db2777" },
              boxShadow: 3,
            }}
          >
            Get Started
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
          color: "gray",
          fontSize: 14,
        }}
      >
        Made with ❤️ for modern love
      </Box>
    </Box>
  );
};

export default HeroPage;
