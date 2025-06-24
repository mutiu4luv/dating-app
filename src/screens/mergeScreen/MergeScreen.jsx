import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Grid,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../components/api/Api";
import Navbar from "../../components/Navbar/Navbar";
import StarIcon from "@mui/icons-material/Star";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import DiamondIcon from "@mui/icons-material/Diamond";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const MergeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [isMerged, setIsMerged] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // 🔴 Error message state

  const navigate = useNavigate();
  const location = useLocation();
  const { userId: member1, member2 } = useParams();

  const subscriptionPlans = {
    free: {
      label: "Free Plan",
      amount: 0,
      description: "Access 3 merges per month. Great for exploring!",
      icon: <FavoriteBorderIcon sx={{ fontSize: 40, color: "#22c55e" }} />,
    },
    basic: {
      label: "Basic Plan",
      amount: 2000,
      description: "10 merges/month for casual users.",
      icon: <StarIcon sx={{ fontSize: 40, color: "#3b82f6" }} />,
    },
    standard: {
      label: "Standard Plan",
      amount: 3000,
      description: "20 merges/month. Best for serious users.",
      icon: <WorkspacePremiumIcon sx={{ fontSize: 40, color: "#f59e0b" }} />,
    },
    premium: {
      label: "Premium Plan",
      amount: 5000,
      description: "Unlimited merges. Full experience unlocked.",
      icon: <DiamondIcon sx={{ fontSize: 40, color: "#a855f7" }} />,
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
        setIsMerged(res.data.isMerged);
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
          setErrorMessage(res.data.message || "Merge failed.");
        }
      } catch (err) {
        console.error("Error during merge after payment:", err);
        setErrorMessage("Something went wrong after payment.");
      }
    };

    mergeAfterPayment();
  }, [location.search, member1, member2, navigate]);

  const handlePlanClick = async (planKey) => {
    const plan = subscriptionPlans[planKey];
    setErrorMessage(""); // 🔄 Reset error on each click

    if (!userEmail) {
      alert("Email missing. Please log in again.");
      return;
    }

    if (isMerged) {
      return navigate(`/chat/${member1}/${member2}`);
    }

    if (hasPaid && plan.amount > 0) {
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
          setErrorMessage(res.data.message || "Merge failed.");
        }
      } catch (err) {
        console.error("Error finalizing merge:", err);
        setErrorMessage("Failed to finalize merge.");
      }
      return;
    }

    if (plan.amount === 0) {
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
          setErrorMessage(res.data.message || "Merge failed.");
        }
      } catch (err) {
        console.error("Error using free plan:", err);
        setErrorMessage(
          err.response?.data?.message || "Merge failed. Try again."
        );
      }
      return;
    }

    try {
      const paymentRes = await api.post(
        "/subscription/initiate",
        {
          email: userEmail,
          amount: plan.amount * 100,
          member1,
          member2,
          plan: planKey,
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
        setErrorMessage("Failed to generate payment link.");
      }
    } catch (err) {
      console.error("Error initiating payment:", err);
      setErrorMessage("Something went wrong during payment setup.");
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
      <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Merge with Your Match
        </Typography>
        <Typography variant="body1" mb={2}>
          {isMerged
            ? "You are already merged! Click a plan below to chat."
            : hasPaid
            ? "Payment received. Click to finalize your merge."
            : "Choose a subscription plan to unlock chat access."}
        </Typography>

        {errorMessage && (
          <Typography
            variant="body1"
            color="error"
            mb={3}
            fontWeight="bold"
            textAlign="center"
          >
            {errorMessage}
          </Typography>
        )}

        <Grid
          container
          spacing={3}
          justifyContent="center"
          sx={{ maxWidth: 1100 }}
        >
          {Object.entries(subscriptionPlans).map(([key, plan]) => (
            <Grid item xs={12} sm={6} md={3} key={key}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid #ddd",
                  textAlign: "center",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box mb={2}>{plan.icon}</Box>
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  {plan.label}
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                  {plan.description}
                </Typography>
                <Typography variant="h6" color="primary" mb={2}>
                  ₦{plan.amount.toLocaleString()}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handlePlanClick(key)}
                  sx={{
                    mt: "auto",
                    borderRadius: 6,
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                  }}
                >
                  {plan.amount === 0
                    ? "Use Free Plan"
                    : isMerged
                    ? "Open Chat"
                    : hasPaid
                    ? "Finalize Merge"
                    : "Subscribe & Merge"}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default MergeScreen;
