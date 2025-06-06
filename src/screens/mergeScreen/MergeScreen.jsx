import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PaystackButton } from "react-paystack";
import api from "../../components/api/Api";

const VITE_PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const MergeScreen = ({ userId, matchId }) => {
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [showPaystack, setShowPaystack] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  //   useEffect(() => {
  //     const fetchStatus = async () => {
  //       try {
  //         const res = await api.get(
  //           `/merge/status?userId=${userId}&matchId=${matchId}`
  //         );
  //         setHasPaid(res.data.hasPaid);
  //         setUserEmail(res.data.email);
  //       } catch (err) {
  //         alert("Error fetching payment status");
  //       }
  //       setLoading(false);
  //     };
  //     fetchStatus();
  //   }, [userId, matchId]);

  const paystackConfig = {
    email: userEmail,
    amount: 2000 * 100,
    publicKey: VITE_PAYSTACK_PUBLIC_KEY,
    metadata: { userId, matchId },
  };

  const onSuccess = async (reference) => {
    try {
      await api.post("/api/merge", {
        userId,
        matchId,
        reference: reference.reference,
      });
      setHasPaid(true);
      setShowPaystack(false);
      alert("Payment successful! You can now chat.");
    } catch (err) {
      alert("Payment verification failed. Please contact support.");
    }
  };

  const onClose = () => setShowPaystack(false);

  const handleMerge = () => {
    if (hasPaid) {
      navigate(`/chat/${matchId}`);
    } else {
      setShowPaystack(true);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Paper sx={{ p: 4, borderRadius: 3, minWidth: 320, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Merge with your Match
        </Typography>
        <Typography variant="body1" mb={3}>
          {hasPaid
            ? "You have already paid for this merge. Click below to start chatting!"
            : "To merge and start chatting, please complete your payment."}
        </Typography>
        <Button
          variant="contained"
          color={hasPaid ? "success" : "primary"}
          size="large"
          onClick={handleMerge}
          sx={{ borderRadius: 8, px: 5, py: 1.5, fontWeight: 600 }}
        >
          {hasPaid ? "Open Chat" : "Merge (Pay to Unlock)"}
        </Button>
        {showPaystack && (
          <Box mt={3}>
            <PaystackButton
              {...paystackConfig}
              text="Pay with Paystack"
              onSuccess={onSuccess}
              onClose={onClose}
              className="paystack-button"
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default MergeScreen;
