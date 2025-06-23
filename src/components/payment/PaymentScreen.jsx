import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Typography, Box, Paper } from "@mui/material";
import Navbar from "../Navbar/Navbar";

const PaymentSuccess = () => {
  const { member2 } = useParams();
  const member1 = localStorage.getItem("userId");
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Paper
          sx={{ p: 4, borderRadius: 3, textAlign: "center", maxWidth: 400 }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            ✅ Payment Successful!
          </Typography>
          <Typography variant="body1" gutterBottom>
            You have been successfully merged with your match.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={() => navigate(`/chat/${member1}/${member2}`)}
          >
            Go to Chat
          </Button>
        </Paper>
      </Box>
    </>
  );
};

export default PaymentSuccess;
