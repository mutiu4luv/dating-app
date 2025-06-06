import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";

const data = [
  { label: "Serious Relationship", image: "/images/serious.jpg" },
  {
    label: (
      <>
        F<span style={{ color: "red" }}>u</span>n & Friendship
      </>
    ),
    image: "/images/fun.jpg",
  },
  { label: "Male Friends", image: "/images/male.jpg" },
  { label: "Female Friends", image: "/images/female.jpg" },
];

const CardBox = ({ image, label }) => (
  <Paper
    elevation={6}
    sx={{
      borderRadius: 4,
      background: "rgba(30,30,30,0.95)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      aspectRatio: "1 / 1",
      width: "100%",
      height: { xs: 150, sm: 180, md: 200 }, // Increased size on xs
      p: 1.5,
      mt: { xs: 2, sm: 3 },
      transition: "transform 0.2s",
      "&:hover": {
        transform: "translateY(-6px) scale(1.03)",
        boxShadow: "0 8px 32px 0 rgba(236,72,153,0.25)",
      },
    }}
  >
    <Box
      component="img"
      src={image}
      alt="card"
      sx={{
        width: { xs: 60, sm: 70, md: 90 }, // Increased image size on xs
        height: { xs: 60, sm: 70, md: 90 },
        borderRadius: "50%",
        objectFit: "cover",
        mb: 1.5,
        border: "2px solid #fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        background: "#fff",
      }}
    />
    <Typography
      variant="subtitle2"
      sx={{
        color: "#fff",
        fontWeight: 600,
        textAlign: "center",
        fontSize: { xs: 14, sm: 15, md: 16 }, // Slightly larger text on xs
        mt: 1,
      }}
    >
      {label}
    </Typography>
  </Paper>
);

const CategoryGrid = () => (
  <Box sx={{ backgroundColor: "#18181b", minHeight: "100vh", py: 4 }}>
    <Grid
      container
      spacing={{ xs: 2, sm: 3 }}
      sx={{
        maxWidth: { xs: 320, sm: 400, md: 500 }, // Slightly wider on xs
        width: "100%",
        mx: "auto",
      }}
      justifyContent="center"
      alignItems="stretch"
    >
      {data.map((item, index) => (
        <Grid item xs={6} key={index}>
          <CardBox image={item.image} label={item.label} />
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default CategoryGrid;
