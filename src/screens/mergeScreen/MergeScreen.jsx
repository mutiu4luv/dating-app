import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../components/api/Api";
import Navbar from "../../components/Navbar/Navbar";

const MergeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("basic");

  const navigate = useNavigate();
  const { member2 } = useParams();
  const member1 = localStorage.getItem("userId");

  const subscriptionPlans = {
    basic: { label: "Basic - ₦2,000 (5 merges for one month)", amount: 2000 },
    standard: {
      label: "Standard - ₦5,000 (10 merges for one month)",
      amount: 5000,
    },
    premium: { label: "Premium - ₦10,000 (unlimited)", amount: 10000 },
  };

  useEffect(() => {
    const fetchStatus = async () => {
      if (!member1 || !member2) return;
      try {
        const res = await api.get(
          `/merge/status?member1=${member1}&member2=${member2}`
        );
        setHasPaid(res.data.hasPaid);
        setUserEmail(res.data.email || localStorage.getItem("email") || "");
      } catch (err) {
        console.error("❌ Error fetching payment status", err);
        alert("Error checking status.");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [member1, member2]);

  const handleMerge = async () => {
    if (!userEmail) {
      alert("Email missing. Please log in again.");
      return;
    }

    if (hasPaid) {
      return navigate(`/chat/${member1}/${member2}`);
    }

    try {
      const res = await api.post(
        "/subscription/initiate",
        {
          email: userEmail,
          amount: subscriptionPlans[selectedPlan].amount * 100,
          member1,
          member2,
          plan: selectedPlan,
          redirect_url: `${window.location.origin}/merge/success/${member2}`,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const { authorization_url } = res.data;
      if (authorization_url) {
        window.location.href = authorization_url;
      } else {
        alert("Failed to initialize payment.");
      }
    } catch (err) {
      console.error("❌ Error initiating payment:", err);
      alert("Payment initiation failed.");
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
    <>
      <Navbar />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Paper
          sx={{ p: 4, borderRadius: 3, minWidth: 320, textAlign: "center" }}
        >
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Merge with your Match
          </Typography>
          <Typography variant="body1" mb={3}>
            {hasPaid
              ? "You have already paid. Click below to start chatting!"
              : "Please complete payment to start chatting."}
          </Typography>

          {!hasPaid && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="plan-select-label">
                Choose Subscription Plan
              </InputLabel>
              <Select
                labelId="plan-select-label"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                label="Choose Subscription Plan"
              >
                {Object.entries(subscriptionPlans).map(([key, plan]) => (
                  <MenuItem key={key} value={key}>
                    {plan.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button
            variant="contained"
            color={hasPaid ? "success" : "primary"}
            size="large"
            onClick={handleMerge}
            sx={{ borderRadius: 8, px: 5, py: 1.5, fontWeight: 600 }}
          >
            {hasPaid ? "Open Chat" : "Merge (Pay to Unlock)"}
          </Button>
        </Paper>
      </Box>
    </>
  );
};

export default MergeScreen;
