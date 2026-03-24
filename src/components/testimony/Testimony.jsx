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
      "Joining this platform was one of the best decisions I’ve ever made. At first, I didn’t expect much, but everything changed when I connected with someone who truly understands me. The matching system is incredibly accurate, and the environment feels safe and supportive. Today, I can confidently say I’ve found my perfect partner, and every day since has been filled with genuine happiness and peace of mind.",
    photo: sunday,
  },
  {
    name: "Ifeanyi Stanley",
    message:
      "This platform is truly a life-changer. I came in with doubts, but within a short time, I met someone who completely transformed my life. The interface is easy to use, and the connections feel real, not forced. I’ve built something meaningful here, something I never thought was possible online. If you're serious about finding love, this is the place to be.",
    photo: ifeanyi,
  },
  {
    name: "Rumi Ezlyn",
    message:
      "As a single mom, I had almost given up on finding love again. It felt overwhelming and honestly scary to start over. But this platform gave me hope. The people here are respectful and genuine, and I was able to connect with someone who not only accepts me but appreciates my journey. I finally feel seen, valued, and loved again.",
    photo: ruth,
  },
  {
    name: "Happy Client",
    message:
      "I never imagined I would try a matchmaking service, but I’m so glad I did. From the moment I joined, everything felt intentional and well thought out. The quality of people here is different—serious, mature, and ready for something real. I found someone who aligns with my values, and we’ve been building something beautiful ever since.",
    photo: happy,
  },
  {
    name: "Uche Emmanuella.",
    message:
      "I was very skeptical at first because of my past experiences with online dating. But this platform changed my perspective completely. The process is smooth, and the connections feel genuine. I met someone who respects me, understands me, and brings out the best in me. It’s more than just a dating site—it’s a place where real relationships begin.",
    photo: uche,
  },
  {
    name: "Ikechukwu Martins",
    message:
      "I never believed I would find true love online, but this platform proved me wrong. From meaningful conversations to a deep emotional connection, everything happened so naturally. Today, I’m in a relationship that feels right in every way. I’m grateful for this opportunity and highly recommend it to anyone looking for something serious.",
    photo: ikechukwu,
  },
  {
    name: "Felista Ohazuruike",
    message:
      "This app brought real magic into my life. I went from feeling lonely and uncertain to being deeply connected with someone who genuinely cares about me. The experience has been smooth, and the people I’ve met here are sincere. It’s not just about dating—it’s about finding someone who complements your life.",
    photo: felista,
  },
  {
    name: "Chiamaka Nwafor",
    message:
      "This is more than just a dating platform—it’s a community of people who are serious about love and relationships. I’ve had meaningful conversations, built trust, and eventually found someone who shares my goals and values. It feels good to finally be in a relationship that has direction and purpose.",
    photo: chiamaka,
  },
  {
    name: "Engineer Praise",
    message:
      "I’ve tried several platforms before, but none compare to this. Everything here feels intentional—from the matching process to the quality of conversations. I was able to meet someone who aligns with my mindset and life goals. This platform made the process easy and enjoyable, and I’m truly grateful for that.",
    photo: praise,
  },
  {
    name: "Daniel John",
    message:
      "As a widower, I didn’t think I would ever open my heart again. It took a lot of courage to try, but this platform made it easier. I met someone who understands my past and is willing to build a future with me. It’s been a healing and fulfilling experience that I never expected.",
    photo: dan,
  },
  {
    name: "Nnah Mercy",
    message:
      "After a disappointing experience with online dating in the past, I was very hesitant to try again. But this platform restored my confidence. The connections here are genuine, and I was able to meet someone who truly values me. It’s been a refreshing and positive journey.",
    photo: nnah,
  },
  {
    name: "Anthony Obidigbo",
    message:
      "I used to think online dating wasn’t for me, but this platform completely changed my mindset. The people here are serious and intentional, and I quickly found someone who shares my vision for the future. It’s been an amazing experience from start to finish.",
    photo: anthony,
  },
  {
    name: "Ndiukwu Doris",
    message:
      "I’ve tried several dating apps before, but none gave me the kind of experience I found here. The platform focuses on meaningful connections, not just casual chats. I met someone who truly understands me, and we’ve been building something strong and lasting. I highly recommend this to anyone looking for real love.",
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
                      textAlign={isExpanded ? "left" : "center"}
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
