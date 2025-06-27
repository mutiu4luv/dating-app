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
import jwtDecode from "jwt-decode";

const MergeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("basic");

  const navigate = useNavigate();
  const location = useLocation();
  const { member1, member2 } = useParams();

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
        console.error("❌ Error fetching merge status:", err);
        alert("Could not verify merge/payment status.");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [member1, member2]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      localStorage.clear();
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000; // in seconds
      if (decoded.exp < now) {
        console.warn("🔐 Token expired. Logging out...");
        localStorage.clear();
        navigate("/login");
      }
    } catch (err) {
      console.warn("🔐 Invalid token format. Logging out...");
      localStorage.clear();
      navigate("/login");
    }
  }, []);

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
        console.error("❌ Error during merge after payment:", err);
        alert("Something went wrong after payment.");
      }
    };

    mergeAfterPayment();
  }, [location.search, member1, member2, navigate]);

  const handleMerge = async () => {
    if (!userEmail) {
      alert("Email missing. Please log in again.");
      return;
    }

    if (hasPaid) {
      return navigate(`/chat/${member1}/${member2}`);
    }

    try {
      const paymentRes = await api.post(
        "/subscription/initiates",
        {
          email: userEmail,
          amount: subscriptionPlans[selectedPlan].amount * 100,
          member1,
          member2,
          plan: selectedPlan,
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
      console.error("❌ Error initiating payment:", err);
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
            {hasPaid
              ? "You have already paid. Click below to start chatting!"
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
