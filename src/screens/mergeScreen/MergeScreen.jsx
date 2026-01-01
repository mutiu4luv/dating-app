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

const MERGE_EXPIRY_DAYS = 30;

const MergeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [isMerged, setIsMerged] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [mergeExpired, setMergeExpired] = useState(false);

  // const [mergeExpired, setMergeExpired] = useState(
  //   JSON.parse(localStorage.getItem("mergeExpired")) || false
  // );
  const canChat = hasPaid || isMerged;

  const navigate = useNavigate();
  const location = useLocation();
  const { userId: member1, member2 } = useParams();

  // const { userId: member1, member2 } = useParams();
  const isUpgradeOnly = member2 === "upgrade";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const subscriptionPlans = {
    Free: {
      label: "Free Plan",
      amount: 0,
      description: "Access 1 merge per month. Great for exploring!",
      icon: <FavoriteBorderIcon sx={{ fontSize: 32, color: "#22c55e" }} />,
    },
    Basic: {
      label: "Basic Plan",
      amount: 1000,
      description: "Access 10 merges per month for casual users.",
      icon: <StarIcon sx={{ fontSize: 32, color: "#3b82f6" }} />,
    },
    Standard: {
      label: "Standard Plan",
      amount: 3000,
      description: "30 merges/month. Best for serious users.",
      icon: <WorkspacePremiumIcon sx={{ fontSize: 32, color: "#f59e0b" }} />,
    },
    Premium: {
      label: "Premium Plan",
      amount: 5000,
      description: "Unlimited merges. Full experience unlocked.",
      icon: <DiamondIcon sx={{ fontSize: 32, color: "#a855f7" }} />,
    },
  };

  // Helper to check if merge has expired (not used, backend is source of truth)
  const checkMergeExpiry = (paidAt) => {
    if (!paidAt) return true;
    const now = Date.now();
    const expiry = paidAt + MERGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    return now > expiry;
  };
  // console.log("🔍 useParams:", useParams());

  useEffect(() => {
    if (isUpgradeOnly) {
      setLoading(false);
      return;
    }
    if (!member1 || member1 === "upgrade") {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      // console.log("🟢 MergeScreen mounted", {
      //   member1,
      //   member2,
      //   isUpgradeOnly,
      //   location: window.location.href,
      // });
      try {
        // console.log("🟠 About to call /merge/status");

        const res = await api.get(
          `/merge/status?member1=${member1}&member2=${member2}`
        );
        // console.log("🟢 merge status response", res);

        setIsMerged(res.data.isMerged);
        setHasPaid(res.data.hasPaid);
        setMergeExpired(res.data.expired);

        setUserEmail(
          res.data.email ||
            localStorage.getItem("email") ||
            JSON.parse(localStorage.getItem("user"))?.email ||
            ""
        );
      } catch (err) {
        console.error("🔴 merge status failed", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
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

        if (!isUpgradeOnly) {
          const mergeRes = await api.post(
            "/merge",
            { memberId1: member1, memberId2: member2, plan: selectedPlan },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (mergeRes.data.match) {
            navigate(`/chat/${member1}/${member2}`);
          }
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error("❌ Payment callback failed:", err);
        setErrorMessage(
          "Payment succeeded but activation failed. Contact support."
        );
      }
    };

    afterPayment();
  }, [location.search, member1, member2, isUpgradeOnly, navigate]);

  const handlePlanClick = async (planKey) => {
    setErrorMessage("");

    // ✅ PAID USER → OPEN CHAT ONLY
    if (canChat) {
      navigate(`/chat/${member1}/${member2}`);
      return;
    }

    const plan = subscriptionPlans[planKey];

    // ✅ FREE PLAN
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
          navigate(`/merge/success/${member2}`);
        }
      } catch (err) {
        setErrorMessage(err?.response?.data?.message || "Free merge failed.");
      }
      return;
    }

    // ✅ PAID PLAN → START PAYMENT
    try {
      const email =
        userEmail ||
        localStorage.getItem("email") ||
        JSON.parse(localStorage.getItem("user"))?.email;

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
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      sessionStorage.setItem("selectedPlan", planKey);
      window.location.href = paymentRes.data.authorization_url;
    } catch {
      setErrorMessage("Payment initiation failed.");
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
      {/* {!isUpgradeOnly && (
        <Typography variant="h5" fontWeight="bold" mb={2} textAlign="center">
          Merge with Your Match
        </Typography>
      )} */}

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
          {/* {mergeExpired
            ? "Your subscription has expired. Please renew to continue chatting."
            : canChat
            ? "Your subscription is active. You can chat with this match."
            : "Choose a subscription plan to unlock chat access."} */}

          {canChat
            ? "Your subscription is active. You can chat with this match."
            : "Choose a subscription plan to unlock chat access."}
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
            sx={{
              maxWidth: 1100,
              width: "100%",
              px: isMobile ? 1 : 3,
              mt: 2, // Add margin top to the grid container
            }}
          >
            {Object.entries(subscriptionPlans).map(([key, plan]) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                key={key}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "stretch",
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    width: "100%",
                    maxWidth: 320,
                    borderRadius: 4,
                    border: "1px solid #ddd",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textAlign: "center",
                    minHeight: 340,
                    mt: 2,
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
                    fullWidth
                    disabled={canChat}
                    variant={key === "Free" ? "outlined" : "contained"}
                    color={key === "Free" ? "success" : "primary"}
                    sx={{
                      mt: 2,
                      fontWeight: "bold",
                      borderRadius: 3,
                      py: 1,
                    }}
                    onClick={() => handlePlanClick(key)}
                  >
                    {canChat
                      ? "Open Chat"
                      : key === "Free"
                      ? "Continue Free"
                      : mergeExpired
                      ? "Renew"
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
