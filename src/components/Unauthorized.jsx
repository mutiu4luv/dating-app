import React from "react";
import { Box, Typography } from "@mui/material";
import Navbar from "./Navbar/Navbar";

const Unauthorized = () => {
  return (
    <>
      <Navbar />
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#000",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "red",
            fontWeight: "bold",
            animation: "blinker 1s linear infinite",
            "@keyframes blinker": {
              "50%": { opacity: 0 },
            },
          }}
        >
          🚫 ACCESS DENIED: ADMINS ONLY 🚫
        </Typography>
      </Box>
    </>
  );
};

export default Unauthorized;
