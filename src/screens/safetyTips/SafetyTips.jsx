import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import LockIcon from "@mui/icons-material/Lock";
import ReportIcon from "@mui/icons-material/Report";
import SecurityIcon from "@mui/icons-material/Security";
import VideocamIcon from "@mui/icons-material/Videocam";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import { useNavigate } from "react-router-dom";

const safetyTips = [
  "Do not feel pressured to meet immediately.",
  "Take time to get to know someone online before rushing into physical meetings.",
  "Use video calls to verify the person's appearance and communication style.",
  "If you meet in person, choose a public place and tell a friend or family member where you are going and who you are meeting.",
  "Review their social media profiles, where available, and look out for inconsistencies or red flags.",
  "Share personal information gradually, only when you feel comfortable and trust has been built.",
  "Do not share personal or financial information too early.",
  "Set clear boundaries and expectations.",
  "Watch for pushy, aggressive, controlling, or manipulative behavior.",
  "Avoid sharing nude photos or videos.",
  "Choose public places for first dates and meet during daylight hours.",
  "Keep your phone charged and accessible.",
  "If something feels wrong or makes you uncomfortable, end the conversation or meeting.",
  "No matter how emotional their story sounds, do not send money to someone you just connected with.",
  "Date for some time and get to know each other properly before making long-term commitments.",
  "Report anyone behaving suspiciously or inappropriately to the dating platform.",
];

const quickRules = [
  {
    title: "Protect Your Privacy",
    body: "Keep your address, finances, passwords, and private documents away from early conversations.",
    icon: <LockIcon />,
    color: "#2d0052",
    bg: "#f3e8ff",
  },
  {
    title: "Verify Before Meeting",
    body: "Use video calls and careful questions to confirm that the person is who they claim to be.",
    icon: <VideocamIcon />,
    color: "#075985",
    bg: "#e0f2fe",
  },
  {
    title: "Meet Safely",
    body: "Choose open public places, meet during the day, and let someone you trust know your plans.",
    icon: <WbSunnyIcon />,
    color: "#92400e",
    bg: "#fef3c7",
  },
  {
    title: "Trust Red Flags",
    body: "Pressure, secrecy, money requests, and controlling behavior are serious warning signs.",
    icon: <WarningAmberIcon />,
    color: "#991b1b",
    bg: "#fee2e2",
  },
];

const SafetyTips = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fbf7ff",
        color: "#20122f",
        pb: { xs: 10, md: 6 },
      }}
    >
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #2d0052 0%, #6d1b8f 52%, #D9A4F0 100%)",
          color: "#fff",
          py: { xs: 5, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              mb: 3,
              color: "#fff",
              borderColor: "rgba(255,255,255,0.44)",
              fontWeight: 900,
            }}
            variant="outlined"
          >
            Back
          </Button>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<SecurityIcon />}
                  label="Dating Safety"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.16)",
                    color: "#fff",
                    fontWeight: 900,
                    "& .MuiChip-icon": { color: "#fff" },
                  }}
                />
              </Stack>
              <Typography
                variant="h3"
                fontWeight={950}
                mt={2}
                sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.04 }}
              >
                Tips on Online Safety for Dating Apps
              </Typography>
              <Typography
                mt={2}
                fontSize={{ xs: 16, md: 18 }}
                lineHeight={1.8}
                color="rgba(255,255,255,0.88)"
                maxWidth={820}
              >
                Prioritize your safety while searching for love online. Build
                trust slowly, protect your private information, and verify
                people before meeting in person.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.24)",
                  color: "#fff",
                }}
              >
                <Typography fontWeight={950} fontSize={22}>
                  Safety first, always.
                </Typography>
                <Typography mt={1.2} color="rgba(255,255,255,0.84)">
                  If someone pressures you, asks for money, or makes you feel
                  unsafe, pause the conversation and report the account.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -3, md: -4 } }}>
        <Grid container spacing={2.5}>
          {quickRules.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid rgba(45,0,82,0.08)",
                  boxShadow: "0 18px 42px rgba(31,18,47,0.08)",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      color: item.color,
                      bgcolor: item.bg,
                      mb: 2,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography fontWeight={950} color="#2d0052">
                    {item.title}
                  </Typography>
                  <Typography mt={1} color="#6b4679" fontSize={14}>
                    {item.body}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid rgba(45,0,82,0.08)",
            boxShadow: "0 18px 42px rgba(31,18,47,0.06)",
            bgcolor: "#fff",
          }}
        >
          <Typography fontWeight={950} fontSize={{ xs: 24, md: 30 }} color="#2d0052">
            Practical safety checklist
          </Typography>
          <Typography mt={1} color="#6b4679" lineHeight={1.8}>
            Online dating can help you meet meaningful people, but your safety
            should lead every step. Keep sensitive information private, use
            strong passwords, verify identities, and allow trust to build
            naturally.
          </Typography>

          <List sx={{ mt: 2 }}>
            {safetyTips.map((tip, index) => {
              const isWarning =
                tip.toLowerCase().includes("red flag") ||
                tip.toLowerCase().includes("money") ||
                tip.toLowerCase().includes("nude");
              const isReport = tip.toLowerCase().includes("report");

              return (
                <ListItem
                  key={tip}
                  alignItems="flex-start"
                  sx={{
                    px: { xs: 0, sm: 1 },
                    py: 1.2,
                    borderBottom:
                      index === safetyTips.length - 1
                        ? "none"
                        : "1px solid #f1e7f6",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 42, mt: 0.2 }}>
                    {isReport ? (
                      <ReportIcon sx={{ color: "#2d0052" }} />
                    ) : isWarning ? (
                      <WarningAmberIcon sx={{ color: "#b45309" }} />
                    ) : (
                      <CheckCircleIcon sx={{ color: "#7c3aed" }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${index + 1}. ${tip}`}
                    primaryTypographyProps={{
                      color: "#271638",
                      fontWeight: 750,
                      lineHeight: 1.55,
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: { xs: 2.2, md: 3 },
            borderRadius: 3,
            bgcolor: "#2d0052",
            color: "#fff",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography fontWeight={950} fontSize={22}>
                Report suspicious behaviour
              </Typography>
              <Typography mt={0.8} color="rgba(255,255,255,0.78)">
                If someone behaves suspiciously or inappropriately, report them
                to the dating platform and stop engaging with them.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<ContactSupportIcon />}
              onClick={() => navigate("/contact")}
              sx={{
                bgcolor: "#D9A4F0",
                color: "#2d0052",
                fontWeight: 950,
                borderRadius: 2,
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: "#c886e7" },
              }}
            >
              Contact Us
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default SafetyTips;
