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
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../components/api/Api";
import Navbar from "../../components/Navbar/Navbar";

const MergeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [isMerged, setIsMerged] = useState(false); // ✅ New state
  const [userEmail, setUserEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("basic");

  const navigate = useNavigate();
  const location = useLocation();
  const { userId: member1, member2 } = useParams();

  const subscriptionPlans = {
    basic: { label: "Basic - ₦2000 (5 merges for one month)", amount: 2000 },
    standard: {
      label: "Standard - ₦5000 (10 merges for one month)",
      amount: 5000,
    },
    premium: { label: "Premium - ₦10000 (unlimited)", amount: 10000 },
  };

  // Step 1: Check existing merge/payment status
  useEffect(() => {
    const fetchStatus = async () => {
      if (!member1 || !member2) return;
      try {
        const res = await api.get(
          `/merge/status?member1=${member1}&member2=${member2}`
        );
        setHasPaid(res.data.hasPaid);
        setIsMerged(res.data.isMerged); // ✅ store isMerged from backend
        setUserEmail(res.data.email || localStorage.getItem("email") || "");
      } catch (err) {
        console.error("Error fetching merge status:", err);
        alert("Could not verify merge/payment status.");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [member1, member2]);

  // Step 2: Merge after Paystack redirects with reference
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const reference = urlParams.get("reference");

    const mergeAfterPayment = async () => {
      if (!reference || !member1 || !member2) return;

      try {
        const res = await api.post(
          "/merge",
          { memberId1: member1, memberId2: member2 },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.match) {
          navigate(`/merge/success/${member2}`);
        } else {
          alert("Merge failed: " + res.data.message);
        }
      } catch (err) {
        console.error("Error during merge after payment:", err);
        alert("Something went wrong after payment.");
      }
    };

    mergeAfterPayment();
  }, [location.search, member1, member2, navigate]);

  // Step 3: Handle payment initiation
  const handleMerge = async () => {
    if (!userEmail) {
      alert("Email missing. Please log in again.");
      return;
    }

    if (isMerged) {
      return navigate(`/chat/${member1}/${member2}`);
    }

    if (hasPaid) {
      // Paid but not merged, so finalize merge
      try {
        const res = await api.post(
          "/merge",
          { memberId1: member1, memberId2: member2 },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.match) {
          navigate(`/merge/success/${member2}`);
        } else {
          alert("Merge failed: " + res.data.message);
        }
      } catch (err) {
        console.error("Error finalizing merge:", err);
        alert("Failed to finalize merge.");
      }
      return;
    }

    // Initiate payment
    try {
      const paymentRes = await api.post(
        "/subscription/initiate",
        {
          email: userEmail,
          amount: subscriptionPlans[selectedPlan].amount * 100,
          member1,
          member2,
          plan: selectedPlan,
          redirect_url: `${window.location.origin}/merge/${member1}/${member2}`,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const { authorization_url } = paymentRes.data;
      if (authorization_url) {
        window.location.href = authorization_url;
      } else {
        alert("Failed to generate payment link.");
      }
    } catch (err) {
      console.error("Error initiating payment:", err);
      alert("Something went wrong during payment setup.");
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
            {isMerged
              ? "You are already merged! Click below to chat."
              : hasPaid
              ? "Payment received. Finalize your merge below."
              : "Please complete payment to unlock chat access."}
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
            color={isMerged ? "success" : hasPaid ? "primary" : "warning"}
            size="large"
            onClick={handleMerge}
            sx={{ borderRadius: 8, px: 5, py: 1.5, fontWeight: 600 }}
          >
            {isMerged
              ? "Open Chat"
              : hasPaid
              ? "Finalize Merge"
              : "Merge (Pay to Unlock)"}
          </Button>
        </Paper>
      </Box>
    </>
  );
};

export default MergeScreen;
