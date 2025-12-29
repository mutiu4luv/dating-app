import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

import seriousImg from "../../assets/images/serious.webp";
import funImg from "../../assets/images/funImg.avif";
import maleImg from "../../assets/images/maleImg.webp";
import femaleImg from "../../assets/images/femaleImg.jpg";
import marraigeandchat from "../../assets/images/marraigeandchat.png";

/**
 * CONFIG-DRIVEN DATA
 */
const categories = [
  {
    id: "serious",
    title: "Serious Relationship",
    description: "For commitment, trust, and long-term love.",
    image: seriousImg,
  },
  {
    id: "fun",
    title: "Fun & Friendship",
    description: "Vibe freely, chat casually, and enjoy connections.",
    image: funImg,
  },
  {
    id: "male",
    title: "Male Friends",
    description: "Build strong, meaningful male friendships.",
    image: maleImg,
  },
  {
    id: "female",
    title: "Female Friends",
    description: "Connect with supportive and genuine women.",
    image: femaleImg,
  },
  {
    id: "marriage",
    title: "Marriage",
    description: "For singles ready to settle down with a better half.",
    image: marraigeandchat,
  },
  {
    id: "chat",
    title: "Online Chat Mate",
    description: "Instant chats with people who match your vibe.",
    image: marraigeandchat,
  },
];

const MotionBox = motion(Box);

const CategoryCard = ({ title, description, image, index }) => {
  return (
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
        height: { xs: 170, sm: 190, md: 210 },
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
      {/* Image */}
      <Box
        component="img"
        src={image}
        alt={title}
        sx={{
          width: { xs: 60, sm: 70, md: 85 },
          height: { xs: 60, sm: 70, md: 85 },
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #D9A4F0",
          backgroundColor: "#fff",
        }}
      />

      {/* Title */}
      <Typography
        sx={{
          color: "#fff",
          fontWeight: 700,
          fontSize: { xs: 14, sm: 15, md: 16 },
        }}
      >
        {title}
      </Typography>

      {/* Description */}
      <Typography
        sx={{
          color: "rgba(255,255,255,0.7)",
          fontSize: 13,
          lineHeight: 1.5,
          maxWidth: 220,
        }}
      >
        {description}
      </Typography>
    </MotionBox>
  );
};

const CategoryGrid = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        py: { xs: 6, md: 10 },
      }}
    >
      {/* Section Header */}
      <Box sx={{ textAlign: "center", mb: 6, px: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#111",
            mb: 1.5,
          }}
        >
          Choose How You Want to Connect 💜
        </Typography>

        <Typography
          sx={{
            maxWidth: 560,
            mx: "auto",
            color: "#555",
            fontSize: 15,
            lineHeight: 1.7,
            minHeight: 26,
          }}
        >
          <Typewriter
            words={[
              "Love, friendship, marriage, or meaningful chats – connect your way.",
            ]}
            loop={0}
            cursor
            cursorStyle="|"
            typeSpeed={90}
            deleteSpeed={40}
            delaySpeed={12000}
          />
        </Typography>
      </Box>

      {/* Cards */}
      <Grid
        container
        spacing={{ xs: 3, sm: 3, md: 7 }} // Increased xs spacing for vertical gap on mobile
        justifyContent="center"
        sx={{
          maxWidth: 1100,
          mx: "auto",
          px: 2,
        }}
      >
        {categories.map((item, index) => (
          <Grid
            item
            xs={11} // Takes up most of the width on mobile to ensure centering
            sm={4} // Back to 3 columns on tablet/desktop
            key={item.id}
            sx={{
              display: "flex",
              justifyContent: "center", // Centers the card within the grid item
            }}
          >
            <CategoryCard {...item} index={index} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryGrid;
