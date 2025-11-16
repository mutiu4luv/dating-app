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
  const [isMerged, setIsMerged] = useState(
    JSON.parse(localStorage.getItem("isMerged")) || false
  );
  const [userEmail, setUserEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [mergeExpired, setMergeExpired] = useState(
    JSON.parse(localStorage.getItem("mergeExpired")) || false
  );

  const navigate = useNavigate();
  const location = useLocation();
  const { userId: member1, member2 } = useParams();

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

  useEffect(() => {
    const fetchStatus = async () => {
      if (!member1 || !member2) return;
      try {
        console.log("Fetching merge status...");
        const res = await api.get(
          `/merge/status?member1=${member1}&member2=${member2}`
        );
        console.log("Merge status response:", res.data);
        setIsMerged(res.data.isMerged);
        setUserEmail(res.data.email || localStorage.getItem("email") || "");
        setHasPaid(res.data.hasPaid);
        setMergeExpired(res.data.expired); // Use backend expired status

        // Save to localStorage
        localStorage.setItem("isMerged", JSON.stringify(res.data.isMerged));
        localStorage.setItem("mergeExpired", JSON.stringify(res.data.expired));
      } catch (err) {
        console.error("Error fetching merge status:", err);
        alert("Could not verify merge/payment status.");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [member1, member2]);

  // useEffect(() => {
  //   const urlParams = new URLSearchParams(location.search);
  //   const reference = urlParams.get("reference");
  //   const mergeAfterPayment = async () => {
  //     if (!reference || !member1 || !member2) return;
  //     const selectedPlan = sessionStorage.getItem("selectedPlan") || "Free";
  //     try {
  //       // 1. Confirm subscription payment (activate subscription)
  //       console.log("🔹 Sending subscription confirmation request...");
  //       const confirmRes = await api.post(
  //         "/subscription/confirm",
  //         {
  //           memberId: member1,
  //           plan: selectedPlan,
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           },
  //         }
  //       );
  //       console.log("✅ Subscription confirmed successfully!");
  //       console.log("Subscription response:", confirmRes.data);

  //       // 2. Merge users
  //       console.log("🔹 Sending merge request...");
  //       const res = await api.post(
  //         "/merge",
  //         {
  //           memberId1: member1,
  //           memberId2: member2,
  //           plan: selectedPlan,
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           },
  //         }
  //       );
  //       console.log("✅ Merge response:", res.data);

  //       if (res.data.match) {
  //         setIsMerged(true);
  //         setHasPaid(true);
  //         setUserEmail(res.data.email || localStorage.getItem("email") || "");
  //         setMergeExpired(false);

  //         // Save to localStorage
  //         localStorage.setItem("isMerged", JSON.stringify(true));
  //         localStorage.setItem("mergeExpired", JSON.stringify(false));

  //         navigate(`/merge/success/${member2}`);
  //       } else {
  //         setErrorMessage(res.data.message || "Merge failed.");
  //       }
  //     } catch (err) {
  //       const msg =
  //         err?.response?.data?.message || "Merge failed after payment.";
  //       if (
  //         err.response?.status === 403 &&
  //         msg.toLowerCase().includes("monthly limit")
  //       ) {
  //         setHasPaid(false);
  //         setErrorMessage(
  //           "Free plan limit exceeded. Please choose a higher plan to continue."
  //         );
  //         return;
  //       }
  //       setErrorMessage(msg);
  //       console.error("❌ Error during merge after payment:", err);
  //       if (err.response) {
  //         console.error("Error response data:", err.response.data);
  //       }
  //     }
  //   };
  //   mergeAfterPayment();
  //   // eslint-disable-next-line
  // }, [location.search, member1, member2, navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const reference = urlParams.get("reference");
    console.log("mergeAfterPayment effect running", {
      reference,
      member1,
      member2,
    });

    const mergeAfterPayment = async () => {
      if (!reference || !member1 || !member2) {
        console.log("mergeAfterPayment: missing reference or member1/member2", {
          reference,
          member1,
          member2,
        });
        return;
      }
      const selectedPlan = sessionStorage.getItem("selectedPlan") || "Free";
      try {
        // 1. Confirm subscription payment (activate subscription)
        console.log("🔹 Sending subscription confirmation request...");
        const confirmRes = await api.post(
          "/subscription/confirm",
          {
            memberId: member1,
            plan: selectedPlan,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("✅ Subscription confirmed successfully!");
        console.log("Subscription response:", confirmRes.data);

        // 2. Merge users
        console.log("🔹 Sending merge request...");
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
        console.log("✅ Merge response:", res.data);

        if (res.data.match) {
          setIsMerged(true);
          setHasPaid(true);
          setUserEmail(res.data.email || localStorage.getItem("email") || "");
          setMergeExpired(false);

          // Save to localStorage
          localStorage.setItem("isMerged", JSON.stringify(true));
          localStorage.setItem("mergeExpired", JSON.stringify(false));

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
        console.error("❌ Error during merge after payment:", err);
        if (err.response) {
          console.error("Error response data:", err.response.data);
        }
      }
    };
    mergeAfterPayment();
    // eslint-disable-next-line
  }, [location.search, member1, member2, navigate]);
  const handlePlanClick = async (planKey) => {
    const plan = subscriptionPlans[planKey];
    setErrorMessage("");
    console.log("handlePlanClick called with:", planKey);
    console.log("Current state:", { isMerged, hasPaid, mergeExpired });

    if (!userEmail) {
      alert("Email missing. Please log in again.");
      return;
    }

    // Only block Free plan if expired
    if (mergeExpired && plan.amount === 0) {
      setErrorMessage(
        "Your subscription has expired. Please subscribe to continue."
      );
      return;
    }

    // Only allow opening chat if merged AND paid AND not expired
    if (isMerged && hasPaid && !mergeExpired) {
      // Save to localStorage for consistency
      localStorage.setItem("isMerged", JSON.stringify(true));
      localStorage.setItem("mergeExpired", JSON.stringify(false));
      console.log("Navigating to chat:", `/chat/${member1}/${member2}`);
      navigate(`/chat/${member1}/${member2}`);
      return;
    }

    // If already paid for this plan and not expired, finalize merge
    if (hasPaid && plan.amount > 0 && !mergeExpired) {
      try {
        console.log("Finalizing merge for paid plan...");
        const res = await api.post(
          "/merge",
          { memberId1: member1, memberId2: member2, plan: planKey },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Merge response:", res.data);
        if (res.data.match) {
          setMergeExpired(false);

          // Save to localStorage
          localStorage.setItem("isMerged", JSON.stringify(true));
          localStorage.setItem("mergeExpired", JSON.stringify(false));

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

    // Free plan logic
    if (plan.amount === 0) {
      try {
        console.log("Trying free plan merge...");
        const res = await api.post(
          "/merge",
          { memberId1: member1, memberId2: member2, plan: planKey },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Free plan merge response:", res.data);
        if (res.data.match) {
          setMergeExpired(false);

          // Save to localStorage
          localStorage.setItem("isMerged", JSON.stringify(true));
          localStorage.setItem("mergeExpired", JSON.stringify(false));

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

    // For paid plans, initiate payment
    try {
      console.log("Initiating payment for plan:", planKey);
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
      console.log("Payment initiation response:", paymentRes.data);
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
          {mergeExpired
            ? "Your subscription has expired. Choose a subscription plan to unlock chat access."
            : isMerged && hasPaid && !mergeExpired
            ? "You are already merged! Click a plan below to chat."
            : hasPaid
            ? "Subscription active. Click to finalize your merge."
            : "Choose a subscription plan to unlock chat access."}
        </Typography>
        {/* {hasPaid && !mergeExpired && (
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
        )} */}
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
                  mt: 2, // Add margin top to each card
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
                  disabled={mergeExpired && plan.amount === 0}
                >
                  {plan.amount === 0
                    ? "Use Free Plan"
                    : mergeExpired
                    ? "Subscribe & Merge"
                    : isMerged && hasPaid && !mergeExpired
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
