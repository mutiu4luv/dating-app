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
import account from "../../assets/images/account.jpg";
import ceo from "../../assets/images/ceo.jpg";
import img from "../../assets/images/img.jpg";

const testimonies = [
  {
    image: account,
    name: "Sarah & Daniel",
    text: "We met in the most unexpected way — and now we're inseparable.",
  },
  {
    image: ceo,
    name: "Jade & Michael",
    text: "Love found us when we least expected it!",
  },
  {
    image: img,
    name: "Lily & James",
    text: "A perfect match! We've never been happier.",
  },
  {
    image: ceo,
    name: "Ava & Noah",
    text: "This app brought us together, forever grateful.",
  },
  {
    image: account,
    name: "Sophia & Ethan",
    text: "What started as a chat turned into a forever.",
  },
  {
    image: img,
    name: "Emily & Liam",
    text: "We built something beautiful, together.",
  },
];

const LoveStory = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Show only 3 items on small screens
  const visibleTestimonies = isSmallScreen
    ? testimonies.slice(0, 3)
    : testimonies;

  return (
    <Box sx={{ bgcolor: "#fff0f5", py: 8 }}>
      <Container>
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 6 }}
        >
          ❤️ Real Love Stories
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {visibleTestimonies.map((story, index) => (
            <Grid item xs={12} sm={4} md={4} key={index}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Card
                  sx={{
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    overflow: "hidden",
                    boxShadow: 4,
                    mb: 2,
                    transition: "transform 0.3s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={story.image}
                    alt={story.name}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Card>
                <CardContent sx={{ p: 0, maxWidth: 240 }}>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {story.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {story.text}
                  </Typography>
                </CardContent>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 5,
              py: 1.5,
              backgroundColor: "#D9A4F0",
              color: "#2d0052",
              fontWeight: "bold",
              borderRadius: "30px",
              fontSize: "1rem",
              ":hover": { backgroundColor: "#D9A4F0" },
              boxShadow: 3,
            }}
          >
            Read More Testimonies
          </Button>
        </Box> */}
      </Container>
    </Box>
  );
};

export default LoveStory;
