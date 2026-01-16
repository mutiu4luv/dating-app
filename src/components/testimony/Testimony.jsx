import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";

import sunday from "../../assets/images/sunday.jpeg";
import ifeanyi from "../../assets/images/ifeanyi.jpeg";
import ruth from "../../assets/images/ruth.jpeg";
import happy from "../../assets/images/happy.jpeg";
import uche from "../../assets/images/uche.jpeg";
import ikechukwu from "../../assets/images/ikechukwu.jpeg";
import felista from "../../assets/images/felista.jpeg";
import chiamaka from "../../assets/images/chiamaka.jpeg";
import praise from "../../assets/images/praise.jpeg";
import dan from "../../assets/images/dan.jpeg";
import nnah from "../../assets/images/nnah.jpeg";
import anthony from "../../assets/images/anthony.jpeg";
import ndiukwu from "../../assets/images/ndiukwu.jpeg";

const testimonies = [
  {
    name: "Bonny Christian",
    message:
      "I'm so grateful in other words I'm a happy member of this dating site.This app helped me find my perfect match. The community is supportive, and the matching algorithm is spot on. I'm loving every moment with my partner.",
    photo: sunday,
  },
  {
    name: "Ifeanyi Stanley",
    message:
      "This platform is a Life-changer 😍 I found my soulmate on this app 💕 The platform's intuitive design and thoughtful approach made it easy to connect with like-minded people. Highly recommend❤️",
    photo: ifeanyi,
  },
  {
    name: "Rumi Ezlyn",
    message: "As a single mom, dating can feel like walking a nightmare...",
    photo: ruth,
  },
  {
    name: "Happy Client",
    message: "I never thought I’d try a matchmaking service...",
    photo: happy,
  },
  {
    name: "Uche Emmanuella.",
    message: "I was skeptical at first...",
    photo: uche,
  },
  {
    name: "Ikechukwu Martins",
    message: "True Love found me on this app...",
    photo: ikechukwu,
  },
  {
    name: "Felista Ohazuruike",
    message: "This app truly brought magic to my life!",
    photo: felista,
  },
  {
    name: "Chiamaka Nwafor",
    message: "It’s more than a dating site...",
    photo: chiamaka,
  },
  {
    name: "Engineer Praise",
    message: "The app truly helped me...",
    photo: praise,
  },
  { name: "Daniel John", message: "I am a widower...", photo: dan },
  {
    name: "Nnah Mercy",
    message: "I was hesitant to try online dating again...",
    photo: nnah,
  },
  {
    name: "Anthony Obidigbo",
    message: "I was skeptical about online dating...",
    photo: anthony,
  },
  {
    name: "Ndiukwu Doris",
    message: "In all honesty, I've tried several dating apps...",
    photo: ndiukwu,
  },
];

const CARD_HEIGHT = 580;
const CARD_CONTENT_HEIGHT = 190;
const MAX_DESCRIPTION_LINES = 2;

const Testimony = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const CARDS_TO_SHOW = isSmallScreen ? 4 : 8;

  const [shuffled, setShuffled] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    setShuffled([...testimonies].sort(() => Math.random() - 0.5));
  }, []);

  const handleExpandClick = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, #181c2b 0%, #232526 40%, #414345 80%, #b993d6 100%)",
        py: 6,
        px: { xs: 1, sm: 2, md: 4 },
        minHeight: "100vh",
      }}
    >
      <Box display="flex" justifyContent="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" color="#fff">
          ❤️ TESTIMONIALS
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {shuffled.slice(0, CARDS_TO_SHOW).map((item, index) => {
          const isExpanded = expanded[index];

          return (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -120 : 120 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Card
                  sx={{
                    borderRadius: 5,
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)",
                    border: "1.5px solid rgba(236,72,153,0.18)",
                    maxWidth: 240,
                    height: isExpanded ? "auto" : `${CARD_HEIGHT}px`,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={item.photo}
                    alt={item.name}
                    sx={{ height: 390, objectFit: "cover" }}
                  />

                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: isExpanded ? "auto" : `${CARD_CONTENT_HEIGHT}px`,
                    }}
                  >
                    <Typography variant="h6" color="#D9A4F0" fontWeight="bold">
                      {item.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="#fff"
                      align="center"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: isExpanded
                          ? "unset"
                          : MAX_DESCRIPTION_LINES,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        mt: 1,
                      }}
                    >
                      {item.message}
                    </Typography>

                    <Button
                      size="small"
                      sx={{ color: "#D9A4F0", mt: 1 }}
                      onClick={() => handleExpandClick(index)}
                      endIcon={<ExpandMoreIcon />}
                    >
                      {isExpanded ? "Less" : "Read More"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Testimony;
