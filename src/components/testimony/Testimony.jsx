import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  useMediaQuery,
  Fade,
  Collapse,
  Button,
  CardMedia,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const testimonies = [
  // [Same array of 20 testimonies as before]
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

const CARDS_TO_SHOW = 8;
const AUTO_SCROLL_INTERVAL = 7000;

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Testimony = () => {
  const [shuffledTestimonies, setShuffledTestimonies] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [expanded, setExpanded] = useState({});
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    setShuffledTestimonies(shuffleArray(testimonies));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex((prev) =>
        prev + CARDS_TO_SHOW >= testimonies.length ? 0 : prev + CARDS_TO_SHOW
      );
    }, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleExpandClick = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, #fdf2f8 0%, #ffe4e6 50%, #fbcfe8 100%)",
        minHeight: "100vh",
        px: { xs: 2, sm: 4 },
        py: 6,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
        <FavoriteIcon sx={{ color: "#ec4899", fontSize: 32, mr: 1 }} />
        <Typography variant="h4" fontWeight="bold" color="#db2777">
          Real Love Stories ❤️
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
                    width: "100%",
                    height: 380,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderRadius: 4,
                    boxShadow: "0 8px 24px rgba(236, 72, 153, 0.2)",
                    border: "1.5px solid #f472b6",
                    overflow: "hidden",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={t.photo}
                    alt={t.name}
                    sx={{
                      width: "100%",
                      height: 180,
                      objectFit: "cover",
                    }}
                  />
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "center",
                      textAlign: "center",
                      px: 2,
                      py: 1,
                      flex: 1,
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="#ec4899"
                      gutterBottom
                    >
                      {t.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontStyle: "italic", color: "#4b5563" }}
                      noWrap={!expanded[index]}
                    >
                      "{t.message}"
                    </Typography>
                    <Collapse in={expanded[index]} timeout="auto" unmountOnExit>
                      <Typography
                        variant="body2"
                        sx={{ color: "#4b5563", mt: 1 }}
                      >
                        {t.message}
                      </Typography>
                    </Collapse>
                    <Button
                      size="small"
                      onClick={() => handleExpandClick(index)}
                      endIcon={<ExpandMoreIcon />}
                      sx={{ mt: 1, color: "#ec4899" }}
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
