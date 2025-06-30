import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  useMediaQuery,
  useTheme,
  Fade,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteIcon from "@mui/icons-material/Favorite";

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
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const CARDS_TO_SHOW = isSmallScreen ? 4 : 8;

  const [shuffledTestimonies, setShuffledTestimonies] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    setShuffledTestimonies(shuffleArray(testimonies));
  }, []);

  const handleExpandClick = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Container>
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        sx={{ color: "#ec4899", textAlign: "center", paddingTop: "70px" }}
      >
        TESTIMONIES ❤️
      </Typography>

      <Grid container spacing={3}>
        {shuffledTestimonies.slice(0, CARDS_TO_SHOW).map((review, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#fdfdfd",
                boxShadow: 3,
                borderRadius: 2,
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={review.photo}
                alt={review.name}
              />
              <CardContent>
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  sx={{ color: "#ec4899" }}
                >
                  {review.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: "italic",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    WebkitLineClamp: expanded[index] ? "unset" : 3,
                    textOverflow: "ellipsis",
                  }}
                >
                  {review.message}
                </Typography>
                <Button
                  onClick={() => handleExpandClick(index)}
                  endIcon={<ExpandMoreIcon />}
                  sx={{ mt: 1, textTransform: "none", color: "#ec4899" }}
                  size="small"
                >
                  {expanded[index] ? "Read Less" : "Read More"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Testimony;
