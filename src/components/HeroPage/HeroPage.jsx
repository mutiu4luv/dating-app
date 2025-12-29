import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import bgImg from "../../assets/images/background.jpeg";

const HeroPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Dark + Purple Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top, rgba(217,164,240,0.35), rgba(0,0,0,0.9))",
          zIndex: 0,
        }}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ zIndex: 5 }}
      >
        <Box
          sx={{
            maxWidth: 880,
            px: { xs: 3, md: 6 },
            py: { xs: 4, md: 6 },
            textAlign: "center",
            borderRadius: "22px",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(217,164,240,0.25)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.7)",
          }}
        >
          {/* 18+ BADGE (CENTERED, ROUND, DANGER RED) */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                mx: "auto",
                mb: 3,
                borderRadius: "50%",
                backgroundColor: "#dc2626",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "1.1rem",
                border: "3px solid #fff",
                boxShadow: "0 0 25px rgba(220,38,38,0.7)",
              }}
            >
              18+
            </Box>
          </motion.div>

          {/* HEADING */}
          <Typography
            variant="h2"
            fontWeight={900}
            sx={{
              color: "#fff",
              lineHeight: 1.15,
              mb: 1,
            }}
          >
            Find{" "}
            <Box component="span" sx={{ color: "#D9A4F0" }}>
              Real Love
            </Box>
            <br />
            Without the Games
          </Typography>

          {/* SUBTITLE */}
          <Typography
            sx={{
              color: "#e5e5e5",
              fontSize: "1.05rem",
              maxWidth: 620,
              mx: "auto",
              mt: 2,
            }}
          >
            Connect with verified people ready for serious relationships. Secure
            chats. Meaningful connections.
          </Typography>

          {/* CTA BUTTON */}
          <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
            <Button
              component={Link}
              to="/login"
              sx={{
                mt: 4,
                px: 7,
                py: 1.7,
                borderRadius: "60px",
                fontSize: "1rem",
                fontWeight: 800,
                color: "#2d0052",
                background: "linear-gradient(135deg, #D9A4F0, #b65cff)",
                boxShadow: "0 12px 35px rgba(217,164,240,0.65)",
                textTransform: "none",
                ":hover": {
                  background: "linear-gradient(135deg, #e8b8ff, #c77dff)",
                },
              }}
            >
              Get Started
            </Button>
          </motion.div>

          {/* TRUST LINE (TYPED) */}
          <Typography
            sx={{
              mt: 2,
              fontSize: "0.85rem",
              color: "#cfcfcf",
            }}
          >
            <Typewriter
              words={["🔒 Private chats · Verified profiles · Real matches"]}
              typeSpeed={100}
            />
          </Typography>
        </Box>
      </motion.div>

      {/* FOOTER TEXT */}
      <Box
        sx={{
          position: "absolute",
          bottom: 18,
          width: "100%",
          textAlign: "center",
          color: "#cfcfcf",
          fontSize: "13px",
          zIndex: 5,
        }}
      >
        <Typewriter
          words={["Built with 💜 for serious relationships"]}
          typeSpeed={100}
        />
      </Box>
    </Box>
  );
};

export default HeroPage;
