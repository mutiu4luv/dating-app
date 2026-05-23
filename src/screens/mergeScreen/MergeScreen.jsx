import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  LinearProgress,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DiamondIcon from "@mui/icons-material/Diamond";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarIcon from "@mui/icons-material/Star";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import api from "../../components/api/Api";
import Navbar from "../../components/Navbar/Navbar";

const MergeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [canChat, setCanChat] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { userId: member1, member2 } = useParams();
  const isUpgradeOnly = member2 === "upgrade";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const subscriptionPlans = useMemo(
    () => ({
      Free: {
        label: "Free Plan",
        amount: 0,
        description: "Access 10 merges per month and chat with those matches.",
        icon: <FavoriteBorderIcon sx={{ fontSize: 32, color: "#22c55e" }} />,
      },
      Basic: {
        label: "Basic Plan",
        amount: 1000,
        description: "Access 20 merges per month for casual users.",
        icon: <StarIcon sx={{ fontSize: 32, color: "#3b82f6" }} />,
      },
      Standard: {
        label: "Standard Plan",
        amount: 3000,
        description: "Access 30 merges per month. Best for serious users.",
        icon: (
          <WorkspacePremiumIcon sx={{ fontSize: 32, color: "#f59e0b" }} />
        ),
      },
      Premium: {
        label: "Premium Plan",
        amount: 5000,
        description: "Unlimited merges every month. Full experience unlocked.",
        icon: <DiamondIcon sx={{ fontSize: 32, color: "#a855f7" }} />,
      },
    }),
    []
  );

  useEffect(() => {
    if (isUpgradeOnly || !member1) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const res = await api.get(
          `/merge/status?member1=${member1}&member2=${member2}`
        );

        if (cancelled) return;
        setCanChat(Boolean(res.data.canChat));
        setUserEmail(
          res.data.email ||
            localStorage.getItem("email") ||
            JSON.parse(localStorage.getItem("user") || "{}")?.email ||
            ""
        );
      } catch (err) {
        console.error("Merge status error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, [member1, member2, isUpgradeOnly]);

  useEffect(() => {
    const reference = new URLSearchParams(location.search).get("reference");
    if (!reference || !member1 || !member2 || member2 === "upgrade") return;

    const selectedPlan = sessionStorage.getItem("selectedPlan") || "Free";

    const afterPayment = async () => {
      try {
        await api.post(
          "/subscription/confirm",
          { memberId: member1, plan: selectedPlan, reference },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const mergeRes = await api.post(
          "/merge",
          { memberId1: member1, memberId2: member2, plan: selectedPlan },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (mergeRes.data.match) navigate(`/chat/${member1}/${member2}`);
      } catch (err) {
        console.error("Payment callback error:", err);
        setErrorMessage(
          "Payment succeeded but activation failed. Contact support."
        );
      }
    };

    afterPayment();
  }, [location.search, member1, member2, navigate]);

  const handlePlanClick = async (planKey) => {
    setErrorMessage("");

    if (loading) return;

    if (canChat) {
      navigate(`/chat/${member1}/${member2}`);
      return;
    }

    const plan = subscriptionPlans[planKey];

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
          setCanChat(Boolean(res.data.canChat));
          if (res.data.canChat) navigate(`/chat/${member1}/${member2}`);
        }
      } catch (err) {
        setErrorMessage(err?.response?.data?.message || "Free merge failed.");
      }
      return;
    }

    try {
      const email =
        userEmail ||
        localStorage.getItem("email") ||
        JSON.parse(localStorage.getItem("user") || "{}")?.email;

      const paymentRes = await api.post(
        "/subscription/initiate",
        {
          email,
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

      sessionStorage.setItem("selectedPlan", planKey);
      window.location.href = paymentRes.data.authorization_url;
    } catch {
      setErrorMessage("Payment initiation failed.");
    }
  };

  return (
    <>
      <Navbar />

      {loading && (
        <LinearProgress
          sx={{
            "& .MuiLinearProgress-bar": {
              background: "linear-gradient(90deg, #ec4899, #8b3ba8)",
            },
          }}
        />
      )}

      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2}>
        {isUpgradeOnly ? "Upgrade Subscription" : "Merge with Your Match"}
      </Typography>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mt={4}
        px={isMobile ? 2 : 4}
      >
        <Typography textAlign="center" mb={2}>
          {canChat
            ? "You can chat with this match."
            : loading
            ? "Checking your access in the background. The plans are ready."
            : "Continue Free to merge and chat with this match, or upgrade for more monthly access."}
        </Typography>

        {errorMessage && (
          <Typography color="error" textAlign="center" mb={2}>
            {errorMessage}
          </Typography>
        )}

        {canChat && (
          <Box mb={4}>
            <Button
              variant="contained"
              size="large"
              sx={{ px: 6, py: 1.5, fontWeight: "bold" }}
              onClick={() => navigate(`/chat/${member1}/${member2}`)}
              disabled={loading}
            >
              Open Chat
            </Button>
          </Box>
        )}

        {!canChat && (
          <Grid
            container
            spacing={3}
            justifyContent="center"
            sx={{ maxWidth: 1100, width: "100%" }}
          >
            {Object.entries(subscriptionPlans).map(([key, plan]) => (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    textAlign: "center",
                    minHeight: 340,
                  }}
                >
                  <Box mb={2}>{plan.icon}</Box>
                  <Typography variant="h6" fontWeight="bold">
                    {plan.label}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    {plan.description}
                  </Typography>
                  <Typography variant="h6" color="primary" mb={2}>
                    ₦{plan.amount.toLocaleString()}
                  </Typography>
                  <Button
                    fullWidth
                    disabled={loading}
                    variant={key === "Free" ? "outlined" : "contained"}
                    onClick={() => handlePlanClick(key)}
                  >
                    {loading
                      ? "Checking..."
                      : key === "Free"
                      ? "Continue Free"
                      : "Upgrade"}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
};

export default MergeScreen;
