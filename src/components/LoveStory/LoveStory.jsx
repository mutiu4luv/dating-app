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
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import ezinne from "../../assets/images/ezinne.jpeg";
import david from "../../assets/images/david.jpeg";
import mutiu from "../../assets/images/mutiu.jpeg";

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

  const userId = localStorage.getItem("userId") || "guest";
  const upgradeLink = `/merge/${userId}/upgrade`;

  const visibleTestimonies = isSmallScreen
    ? testimonies.slice(0, 3)
    : testimonies;

  return (
    <Box
      sx={{
        py: 10,
        background: "#D9A4F0",
        color: "#fff",
      }}
    >
      <Container>
        {/* CTA */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Button
              component={Link}
              to={upgradeLink}
              sx={{
                px: 5,
                py: 1.4,
                fontSize: "1rem",
                fontWeight: 800,
                borderRadius: "50px",
                color: "#2d0052",
                background: "linear-gradient(black, #D9A4F0, #b65cff)",
                boxShadow: "0 12px 30px rgba(217,164,240,0.6)",
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(135deg, #e8b8ff, #c77dff)",
                },
              }}
            >
              Upgrade Your Plan — Meet More People
            </Button>
          </motion.div>
        </Box>

        {/* TITLE */}
        <Box textAlign="center" mb={8}>
          <Typography variant="h4" fontWeight={900}>
            Real{" "}
            <Box component="span" sx={{ color: "black" }}>
              Love Stories
            </Box>
          </Typography>
          <Typography sx={{ color: "black", maxWidth: 520, mx: "auto" }}>
            Genuine connections that started with a simple conversation.
          </Typography>
        </Box>

        {/* STORIES */}
        <Grid container spacing={5} justifyContent="center">
          {visibleTestimonies.map((story, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <Box textAlign="center">
                  {/* DANCING IMAGE */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 1.5, -1.5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Card
                      sx={{
                        width: 210,
                        height: 210,
                        mx: "auto",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "3px solid rgba(217,164,240,0.4)",
                        boxShadow: "0 15px 40px rgba(0,0,0,0.7)",
                        mb: 3,
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={story.image}
                        alt={story.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Card>
                  </motion.div>

                  {/* NAME + ANIMATED UNDERLINE */}
                  <CardContent sx={{ p: 0 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{ color: "#fff" }}
                    >
                      {story.name}
                    </Typography>

                    <motion.div
                      animate={{ width: ["20%", "60%", "20%"] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        height: 3,
                        backgroundColor: "#D9A4F0",
                        margin: "6px auto 10px",
                        borderRadius: 4,
                      }}
                    />

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#000",
                        maxWidth: 260,
                        mx: "auto",
                      }}
                    >
                      {story.text}
                    </Typography>
                  </CardContent>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LoveStory;
