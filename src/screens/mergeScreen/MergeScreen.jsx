import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Skeleton,
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

const BRAND_DARK = "#2d0052";
const BRAND_PINK = "#D9A4F0";
const BRAND_SOFT = "#fbf5ff";

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
        icon: <FavoriteBorderIcon sx={{ fontSize: 32, color: "#8b3ba8" }} />,
      },
      Basic: {
        label: "Basic Plan",
        amount: 1000,
        description: "Access 20 merges per month for casual users.",
        icon: <StarIcon sx={{ fontSize: 32, color: "#2d0052" }} />,
      },
      Standard: {
        label: "Standard Plan",
        amount: 3000,
        description: "Access 30 merges per month. Best for serious users.",
        icon: (
          <WorkspacePremiumIcon sx={{ fontSize: 32, color: "#b36bd0" }} />
        ),
      },
      Premium: {
        label: "Premium Plan",
        amount: 5000,
        description: "Unlimited merges every month. Full experience unlocked.",
        icon: <DiamondIcon sx={{ fontSize: 32, color: BRAND_DARK }} />,
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

  const renderPlanSkeletons = () => (
    <Grid
      container
      spacing={3}
      justifyContent="center"
      sx={{ maxWidth: 1100, width: "100%" }}
      aria-busy="true"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              textAlign: "center",
              minHeight: 340,
              border: "1px solid rgba(45,0,82,0.08)",
              boxShadow: "0 18px 36px rgba(45,0,82,0.06)",
            }}
          >
            <Skeleton
              variant="circular"
              width={48}
              height={48}
              sx={{ mx: "auto", mb: 2 }}
            />
            <Skeleton width="62%" height={30} sx={{ mx: "auto" }} />
            <Skeleton width="90%" sx={{ mx: "auto", mt: 2 }} />
            <Skeleton width="82%" sx={{ mx: "auto" }} />
            <Skeleton width="52%" height={32} sx={{ mx: "auto", mt: 2 }} />
            <Skeleton
              variant="rounded"
              width="100%"
              height={42}
              sx={{ borderRadius: 2, mt: 3 }}
            />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <>
      <Navbar />

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
        sx={{
          px: isMobile ? 2 : 4,
          py: { xs: 4, md: 6 },
          background:
            "linear-gradient(135deg, #fff 0%, #fbf5ff 48%, #f0ddff 100%)",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 980,
            mb: 3,
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            textAlign: "center",
            border: "1px solid rgba(217,164,240,0.45)",
            background: "rgba(255,255,255,0.88)",
            boxShadow: "0 24px 70px rgba(45,0,82,0.12)",
          }}
        >
          <Typography
            variant={isMobile ? "h5" : "h4"}
            fontWeight={900}
            color={BRAND_DARK}
          >
            {isUpgradeOnly ? "Upgrade Subscription" : "Merge with Your Match"}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              maxWidth: 680,
              mx: "auto",
              mt: 1,
              lineHeight: 1.7,
            }}
          >
            Choose the monthly access level that matches how actively you want
            to connect.
          </Typography>
        </Paper>

        {loading ? (
          <Box width="100%" maxWidth={560} mb={3}>
            <Skeleton height={28} width="92%" sx={{ mx: "auto" }} />
            <Skeleton height={24} width="72%" sx={{ mx: "auto" }} />
          </Box>
        ) : (
          <Typography textAlign="center" mb={2}>
            {canChat
              ? "You can chat with this match."
              : "Continue Free to merge and chat with this match, or upgrade for more monthly access."}
          </Typography>
        )}

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
              sx={{
                px: 6,
                py: 1.5,
                fontWeight: 900,
                textTransform: "none",
                borderRadius: 2,
                bgcolor: BRAND_DARK,
                boxShadow: "0 16px 36px rgba(45,0,82,0.22)",
                "&:hover": { bgcolor: "#4b087c" },
              }}
              onClick={() => navigate(`/chat/${member1}/${member2}`)}
              disabled={loading}
            >
              Open Chat
            </Button>
          </Box>
        )}

        {loading ? (
          renderPlanSkeletons()
        ) : !canChat ? (
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
                    border: "1px solid rgba(217,164,240,0.42)",
                    background:
                      key === "Premium"
                        ? "linear-gradient(180deg, #fff 0%, #fbf5ff 100%)"
                        : "#fff",
                    boxShadow:
                      key === "Premium"
                        ? "0 24px 60px rgba(45,0,82,0.18)"
                        : "0 18px 42px rgba(45,0,82,0.09)",
                    transition: "transform 160ms ease, box-shadow 160ms ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 28px 70px rgba(45,0,82,0.18)",
                    },
                  }}
                >
                  <Box
                    mb={2}
                    sx={{
                      width: 62,
                      height: 62,
                      borderRadius: "50%",
                      mx: "auto",
                      display: "grid",
                      placeItems: "center",
                      background: BRAND_SOFT,
                      border: "1px solid rgba(217,164,240,0.55)",
                    }}
                  >
                    {plan.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={900} color={BRAND_DARK}>
                    {plan.label}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    {plan.description}
                  </Typography>
                  <Typography
                    variant="h6"
                    color={BRAND_DARK}
                    fontWeight={900}
                    mb={2}
                  >
                    ₦{plan.amount.toLocaleString()}
                  </Typography>
                  <Button
                    fullWidth
                    disabled={loading}
                    variant={key === "Free" ? "outlined" : "contained"}
                    onClick={() => handlePlanClick(key)}
                    sx={{
                      borderRadius: 2,
                      py: 1.1,
                      fontWeight: 900,
                      textTransform: "none",
                      borderColor: BRAND_PINK,
                      color: key === "Free" ? BRAND_DARK : "#fff",
                      bgcolor: key === "Free" ? "transparent" : BRAND_DARK,
                      "&:hover": {
                        borderColor: BRAND_DARK,
                        bgcolor: key === "Free" ? BRAND_SOFT : "#4b087c",
                      },
                    }}
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
        ) : null}
      </Box>
    </>
  );
};

export default MergeScreen;
