import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  useMediaQuery,
  useTheme,
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
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { userId: member1, member2 } = useParams();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const subscriptionPlans = {
    Free: {
      label: "Free Plan",
      amount: 0,
      description: "Access 3 merges per month. Great for exploring!",
      icon: <FavoriteBorderIcon sx={{ fontSize: 32, color: "#22c55e" }} />,
    },
    Basic: {
      label: "Basic Plan",
      amount: 2000,
      description: "Access 10 merges per month for casual users.",
      icon: <StarIcon sx={{ fontSize: 32, color: "#3b82f6" }} />,
    },
    Standard: {
      label: "Standard Plan",
      amount: 3000,
      description: "20 merges/month. Best for serious users.",
      icon: <WorkspacePremiumIcon sx={{ fontSize: 32, color: "#f59e0b" }} />,
    },
    Premium: {
      label: "Premium Plan",
      amount: 5000,
      description: "Unlimited merges. Full experience unlocked.",
      icon: <DiamondIcon sx={{ fontSize: 32, color: "#a855f7" }} />,
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
        if (res.data.hasPaid) {
          const hasPaid = localStorage.getItem("hasPaid") === "true";
        }
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
      const selectedPlan = sessionStorage.getItem("selectedPlan") || "Free";
      try {
        const res = await api.post(
          "/merge",
          {
            memberId1: member1,
            memberId2: member2,
            plan: selectedPlan,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.data.match) {
          setIsMerged(true);
          setHasPaid(true);
          setUserEmail(res.data.email || localStorage.getItem("email") || "");
          const userId = localStorage.getItem("userId");
          localStorage.setItem("hasPaid", "true");
          if (userId) {
            localStorage.setItem(`hasPaid_${userId}`, "true");
          }

          localStorage.setItem(
            `hasPaid_${member2}`,
            JSON.stringify({ status: true, paidAt: Date.now() })
          );

          navigate(`/merge/success/${member2}`);
        } else {
          setErrorMessage(res.data.message || "Merge failed.");
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message || "Merge failed after payment.";
        if (
          err.response?.status === 403 &&
          msg.toLowerCase().includes("monthly limit")
        ) {
          setHasPaid(false);
          setErrorMessage(
            "Free plan limit exceeded. Please choose a higher plan to continue."
          );
          return;
        }
        setErrorMessage(msg);
        console.error("Error during merge after payment:", err);
      }
    };
    mergeAfterPayment();
  }, [location.search, member1, member2, navigate]);

  useEffect(() => {
    const hasPaidData = localStorage.getItem(`hasPaid_${member2}`);
    if (hasPaidData) {
      const parsed = JSON.parse(hasPaidData);
      if (parsed.status) {
        setHasPaid(true);
      }
    }
  }, [member2]);

  const handlePlanClick = async (planKey) => {
    const plan = subscriptionPlans[planKey];
    setErrorMessage("");

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
          { memberId1: member1, memberId2: member2, plan: planKey },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.data.match) {
          localStorage.setItem(
            `hasPaid_${member2}`,
            JSON.stringify({ status: true, paidAt: Date.now() })
          );
          navigate(`/merge/success/${member2}`);
        } else {
          setErrorMessage(res.data.message || "Merge failed.");
          if (res.data.message?.toLowerCase().includes("monthly limit")) {
            setHasPaid(false);
          }
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          "Something went wrong. Try again or choose another plan.";
        setErrorMessage(msg);
        if (
          err.response?.status === 403 &&
          msg.toLowerCase().includes("monthly limit")
        ) {
          setHasPaid(false);
        }
        console.error("Error finalizing merge:", err);
      }
      return;
    }

    if (plan.amount === 0) {
      try {
        const res = await api.post(
          "/merge",
          { memberId1: member1, memberId2: member2, plan: planKey },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.data.match) {
          localStorage.setItem(
            `hasPaid_${member2}`,
            JSON.stringify({ status: true, paidAt: Date.now() })
          );
          navigate(`/merge/success/${member2}`);
        } else {
          setErrorMessage(res.data.message || "Merge failed.");
        }
      } catch (err) {
        const msg = err?.response?.data?.message || "Merge failed. Try again.";
        setErrorMessage(msg);
        if (
          err.response?.status === 403 &&
          msg.toLowerCase().includes("monthly limit")
        ) {
          setHasPaid(false);
        }
        console.error("Error using Free plan:", err);
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
        sessionStorage.setItem("selectedPlan", planKey);
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
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mt={4}
        px={isMobile ? 2 : 4}
      >
        <Typography variant="h5" fontWeight="bold" mb={2} textAlign="center">
          Merge with Your Match
        </Typography>
        <Typography variant="body1" mb={2} textAlign="center">
          {isMerged
            ? "You are already merged! Click a plan below to chat."
            : hasPaid
            ? "Payment received. Click to finalize your merge."
            : "Choose a subscription plan to unlock chat access."}
        </Typography>
        {hasPaid && (
          <Box mb={3}>
            <Button
              variant="outlined"
              color="secondary"
              href="/ebook/relationship-guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              📘 Open Relationship eBook
            </Button>
          </Box>
        )}
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
          sx={{ maxWidth: 1100, width: "100%", px: isMobile ? 1 : 3 }}
        >
          {Object.entries(subscriptionPlans).map(([key, plan]) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={key}
              sx={{ mt: isMobile ? 6 : 3, display: "flex" }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 4,
                  border: "1px solid #ddd",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textAlign: "center",
                  minHeight: 320,
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
                    background: "#D9A4F0",
                    borderRadius: 6,
                    fontWeight: 600,
                    px: 2,
                    py: 1.5,
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
