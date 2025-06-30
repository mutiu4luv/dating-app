import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Fade,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const testimonies = [
  {
    name: "Ada & Emeka",
    message:
      "We met on this platform and are now happily married. Thank you for changing our lives!",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Zainab & Musa",
    message:
      "From chatting daily to walking down the aisle. It all started here.",
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Blessing & Tunde",
    message: "He was 300 miles away but this app brought us together forever.",
    photo: "https://randomuser.me/api/portraits/men/78.jpg",
  },
  {
    name: "Chika & Victor",
    message: "Real love still exists. Thank you for giving me my soulmate!",
    photo: "https://randomuser.me/api/portraits/women/61.jpg",
  },
  {
    name: "Grace & David",
    message:
      "We clicked instantly and never looked back. This app is a blessing!",
    photo: "https://randomuser.me/api/portraits/men/77.jpg",
  },
  {
    name: "Ijeoma & Nnamdi",
    message:
      "After heartbreaks, we finally found our peace and love. God bless this platform!",
    photo: "https://randomuser.me/api/portraits/women/60.jpg",
  },
  {
    name: "Omolara & Femi",
    message: "He slid into my inbox, now he’s my husband!",
    photo: "https://randomuser.me/api/portraits/women/67.jpg",
  },
  {
    name: "Nancy & Uche",
    message: "I was skeptical at first, but look at us now—2 years strong!",
    photo: "https://randomuser.me/api/portraits/women/58.jpg",
  },
  {
    name: "Ngozi & Ayoola",
    message: "True love found us here. Thank you!",
    photo: "https://randomuser.me/api/portraits/men/79.jpg",
  },
  {
    name: "Kelechi & Jane",
    message: "What an amazing journey from strangers to soulmates.",
    photo: "https://randomuser.me/api/portraits/men/60.jpg",
  },
  {
    name: "Amaka & Dan",
    message:
      "We connected because we shared values. Marriage was just a step away.",
    photo: "https://randomuser.me/api/portraits/women/59.jpg",
  },
  {
    name: "Sandra & Obi",
    message: "It started with a like, ended with a lifetime.",
    photo: "https://randomuser.me/api/portraits/women/62.jpg",
  },
  {
    name: "Fatima & Idris",
    message: "This app helped us build our love from friendship.",
    photo: "https://randomuser.me/api/portraits/women/63.jpg",
  },
  {
    name: "Vivian & Kelvin",
    message: "It brought light back into my heart after darkness.",
    photo: "https://randomuser.me/api/portraits/women/64.jpg",
  },
  {
    name: "Debby & Tayo",
    message: "From prayer partners to life partners. We owe you big time!",
    photo: "https://randomuser.me/api/portraits/men/65.jpg",
  },
  {
    name: "Joy & Chisom",
    message: "He came at the perfect time. Thanks to this platform.",
    photo: "https://randomuser.me/api/portraits/men/66.jpg",
  },
  {
    name: "Tope & Amina",
    message: "It only took one message to change our lives forever.",
    photo: "https://randomuser.me/api/portraits/women/66.jpg",
  },
  {
    name: "Angela & Jide",
    message: "Never thought dating online could feel this real.",
    photo: "https://randomuser.me/api/portraits/women/70.jpg",
  },
  {
    name: "Rita & Samuel",
    message: "This app restored my faith in love.",
    photo: "https://randomuser.me/api/portraits/men/69.jpg",
  },
  {
    name: "Esther & Alex",
    message: "Thank you for helping us build something beautiful!",
    photo: "https://randomuser.me/api/portraits/women/71.jpg",
  },
];

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Testimony = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // true if screen < 600px
  const CARDS_TO_SHOW = isMobile ? 4 : 8;

  const [shuffledTestimonies, setShuffledTestimonies] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const shuffled = shuffleArray(testimonies);
    setShuffledTestimonies(shuffled);
    setVisibleIndex(0); // Reset on load
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex((prev) =>
        prev + CARDS_TO_SHOW >= testimonies.length ? 0 : prev + CARDS_TO_SHOW
      );
    }, 7000); // 7 seconds
    return () => clearInterval(interval);
  }, [shuffledTestimonies, CARDS_TO_SHOW]);

  const handleExpandClick = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, #181c2b 0%, #232526 40%, #414345 80%, #b993d6 100%)",
        height: "100vh",
        width: "100vw",
        overflow: "auto",
        px: { xs: 2, sm: 4 },
        py: 6,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
        <FavoriteIcon sx={{ color: "#ec4899", fontSize: 32, mr: 1 }} />
        <Typography variant="h4" fontWeight="bold" color="#fff">
          TESTIMONIES ❤️
        </Typography>
      </Box>

      <Fade in timeout={1200}>
        <Grid container spacing={3} justifyContent="center">
          {shuffledTestimonies
            .slice(visibleIndex, visibleIndex + CARDS_TO_SHOW)
            .map((t, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card
                  sx={{
                    borderRadius: 5,
                    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.25)",
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)",
                    border: "1.5px solid rgba(236,72,153,0.18)",
                    maxWidth: 240,
                    height: "auto",
                    p: 0,
                    mx: "auto",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={t.photo}
                    alt={t.name}
                    sx={{
                      height: 210,
                      objectFit: "cover",
                      borderRadius: "18px 18px 0 0",
                      borderBottom: "2px solid #ec4899",
                    }}
                  />
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      p: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="#ec4899"
                      fontWeight="bold"
                      gutterBottom
                      align="center"
                    >
                      {t.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: "italic",
                        color: "#e5e7eb",
                        textAlign: "center",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        WebkitLineClamp: expanded[index] ? "unset" : 2,
                        textOverflow: "ellipsis",
                        maxHeight: expanded[index] ? "none" : "4.6em",
                      }}
                    >
                      {t.message}
                    </Typography>

                    <Button
                      size="small"
                      sx={{
                        color: "#ec4899",
                        textTransform: "none",
                        mt: 1,
                      }}
                      onClick={() => handleExpandClick(index)}
                      endIcon={<ExpandMoreIcon />}
                    >
                      {expanded[index] ? "Read Less" : "Read More"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Fade>
    </Box>
  );
};

export default Testimony;
