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
import { PaystackButton } from "react-paystack";
import api from "../../components/api/Api";

const VITE_PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const MergeScreen = ({ member1: propmember1 }) => {
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [showPaystack, setShowPaystack] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("basic");

  const navigate = useNavigate();
  const { member2 } = useParams();
  const member1 = propmember1 || localStorage.getItem("userId");

  const subscriptionPlans = {
    basic: { label: "Basic - ₦2,000 (one month 5 merges)", amount: 2000 },
    standard: {
      label: "Standard - ₦5,000 (one month 10 merges)",
      amount: 5000,
    },
    premium: {
      label: "Premium - ₦10,000 (one month unlimited)",
      amount: 10000,
    },
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
        console.error("Error fetching payment status", err);
        alert("Error fetching payment status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [member1, member2]);

  if (!VITE_PAYSTACK_PUBLIC_KEY) {
    console.error("Missing Paystack public key");
    return null;
  }

  const handleMerge = () => {
    if (hasPaid) {
      navigate(`/chat/${member2}`);
    } else {
      if (!userEmail) {
        alert("Email is missing. Please log in again.");
        return;
      }
      setShowPaystack(true);
    }
  };

  const onSuccess = async (reference) => {
    try {
      await api.post("/api/merge", {
        member1,
        member2,
        reference: reference.reference,
        plan: selectedPlan,
      });
      setHasPaid(true);
      setShowPaystack(false);
      alert("Payment successful! You can now chat.");

      console.log("Navigating to /chat/" + member2); // ✅ Debug log
      navigate(`/chat/${member2}`);
    } catch (err) {
      console.error("Payment verification failed", err);
      alert("Payment verification failed. Please contact support.");
    }
  };

  const onClose = () => {
    setShowPaystack(false);
    console.log("Payment dialog closed");
  };

  const paystackConfig = {
    email: userEmail,
    amount: subscriptionPlans[selectedPlan].amount * 100,
    publicKey: VITE_PAYSTACK_PUBLIC_KEY,
    metadata: {
      member1,
      member2,
      plan: selectedPlan,
    },
    text: `Pay ₦${subscriptionPlans[selectedPlan].amount} with Paystack`,
    callback: onSuccess,
    onClose: onClose,
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

        {showPaystack && userEmail && (
          <Box mt={3}>
            <PaystackButton {...paystackConfig} className="paystack-button" />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default MergeScreen;
