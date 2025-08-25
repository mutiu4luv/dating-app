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
    message:
      "As a single mom, dating can feel like walking a nightmare. I wasn’t just looking for someone for me, I was looking for someone who would respect my story, my priorities, and my 9 year old son who means the world to me.Find Your Match felt different right away. There was a sense of purpose in how everything was set up. It wasn’t about chasing attention or playing games, it was about real connection, built on values and intention.Through the platform, I met someone who didn’t just see me as ‘a mom’ or ‘someone with baggage’ but as a whole woman with dreams, strength, and a lot of love to give. And the best part? He embraced my child too, with patience and genuine care.Find Your Match gave me more than a match, it gave me hope. Hope that love after hardship isn’t just possible, it’s beautiful. For anyone who’s ever felt like love had passed them by, especially as a parent this is where new chapters begin.",
    photo: ruth,
  },
  {
    name: "Happy Client",
    message:
      "I never thought I’d try a matchmaking service, but working with FOUNDERS of these app was one of the best decisions I’ve made. She truly listened, understood what I was looking for, and matched me with someone who feels like a perfect fit. The whole experience felt genuine and personal. I’m so thankful I took the chance! If you’re serious about love and ready for something real, this is the place to start.",
    photo: happy,
  },
  {
    name: "Uche Emmanuella.",
    message:
      "I was skeptical at first, but the dating servicesexceeded my expectations.They understood what I was looking for in a partner and introduced me to someone amazing. The platform was incredibly supportive and professional.",
    photo: uche,
  },
  {
    name: "Ikechukwu Martins",
    message:
      "True Love found me on this app. The app is so easy to use, genuine connections, and a wonderful community.I'm thrilled to have met my partner here.",
    photo: ikechukwu,
  },
  {
    name: "Felista Ohazuruike",
    message:
      "This app truly brought magic to my life! I met someone special, and we instantly connected.The app's algorithm is impressive, and the community is supportive and friendly. I'm so grateful to have found my match! ❤️😊",
    photo: felista,
  },
  {
    name: "Chiamaka Nwafor",
    message:
      "It’s more than a dating site, it’s a life-changing space. One thing I’ve come to appreciate deeply is the power of connection, and this platform has been proof that genuine connections can happen even from a simple chat app.People from different countries, different backgrounds, and different stories came together in this one space. And somehow, meaningful relationships started to form friendships, deep conversations, even people finding the right one to build a future with.But beyond the connections, what makes this platform special is the host.Always reminding us that before stepping into marriage, you need to have something doing a purpose, a vision, a foundation.And it doesn’t stop there.This platform isn’t just a place to find love.It’s a place to become whole, to grow, and to walk into relationships with wisdom and clarity.I’m truly grateful to be part of a space where love meets purpose, and connection meets growth.If you're in this platform, you’ll know what I mean. And if you’re not",
    photo: chiamaka,
  },

  {
    name: "Engineer Praise",
    message:
      "The app  truly helped me, i met someone special from this app we connected and our relationship is so sweet and lovely all thanks to this app is impressive and the community is supportive and friendly. I'm so happy that I found my soulmate here! ❤️😊",
    photo: praise,
  },
  {
    name: "Daniel John",
    message:
      "I am a widower, since my wife died I have been lonely and searching. Have been rejected severely but your app helped me step out of my comfort zone and meet new people. The interface is sleek, and the support team is responsive. I've gone on several great dates, and I have found a perfect match 😉 about to walk down the altar.",
    photo: dan,
  },
  {
    name: "Nnah Mercy",
    message:
      "I was hesitant to try online dating again because of a bad experience in the past, but your app's focus on meaningful connections won me over. I met someone who genuinely understands and supports me. We're building a strong connection, and I'm grateful for your platform. Thank you for helping me find 😘 ",
    photo: nnah,
  },
  {
    name: "Anthony Obidigbo",
    message:
      "I was skeptical about online dating, but your app surprised me 😊 I met my partner through your platform, and we're happily together. Your app is user-friendly, and the matches were spot on👌 ",
    photo: anthony,
  },
  {
    name: "Ndiukwu Doris",
    message:
      "In all honesty, I've tried several dating apps, but Find your match stands out👌 The compatibility algorithm is genius. I connected with someone who shares my passions and values. We're having a blast getting to know each other. Thanks for making dating easier",
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
    const shuffled = [...testimonies].sort(() => Math.random() - 0.5);
    setShuffled(shuffled);
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
      <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" color="#fff">
          ❤️ TESTIMONIALS
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {shuffled.slice(0, CARDS_TO_SHOW).map((item, index) => {
          const isExpanded = expanded[index];

          return (
            <Grid item xs={6} sm={4} md={3} lg={3} key={index}>
              <Card
                sx={{
                  borderRadius: 5,
                  boxShadow: "0 8px 32px rgba(31, 38, 135, 0.25)",
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
                  sx={{
                    height: 390,
                    objectFit: "cover",
                    borderRadius: "18px 18px 0 0",
                    borderBottom: "2px solid #D9A4F0",
                  }}
                />
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: isExpanded ? "auto" : `${CARD_CONTENT_HEIGHT}px`,
                    p: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    color="#D9A4F0"
                    fontWeight="bold"
                    gutterBottom
                    align="center"
                  >
                    {item.name}
                  </Typography>

                  <Box sx={{ width: "100%", mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="#fff"
                      align="center"
                      sx={{
                        fontStyle: "italic",
                        opacity: 0.85,
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        WebkitLineClamp: isExpanded
                          ? "unset"
                          : MAX_DESCRIPTION_LINES,
                        textOverflow: "ellipsis",
                        whiteSpace: isExpanded ? "normal" : "initial",
                        maxHeight: isExpanded ? "none" : "4.6em",
                      }}
                    >
                      {item.message}
                    </Typography>

                    <Button
                      size="small"
                      sx={{
                        color: "#D9A4F0",
                        textTransform: "none",
                        mt: 1,
                      }}
                      onClick={() => handleExpandClick(index)}
                      endIcon={<ExpandMoreIcon />}
                    >
                      {isExpanded ? "Less" : "Read More"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Testimony;
