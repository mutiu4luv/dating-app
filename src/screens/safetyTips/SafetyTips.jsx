import React from "react";
import {
  Box,
  Typography,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Security";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PublicIcon from "@mui/icons-material/Public";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import ReportIcon from "@mui/icons-material/Report";

const tips = [
  "Don't feel pressured to meet immediately.",
  "Take time to get to know someone online before rushing into physical meetings.",
  "Consider video calls to verify the person's appearance and personality.",
  "If you decide to meet in person, meet in a public place and let a friend or family member know where you're going and who you're meeting before leaving the house.",
  "If the person has social media profiles, take some time to look at them and see if there are any discrepancies or red flags.",
  "Share personal information gradually, only when you feel comfortable and trust the other person.",
  "Don't share personal/financial info too early.",
  "Set clear boundaries and expectations.",
  "Watch for red flags (e.g., pushy, aggressive, or controlling behavior).",
  "Avoid sharing nude photos/videos.",
  "Choose public places for first date and meet during daylight hours.",
  "Keep phone charged and accessible.",
  "If something feels off or makes you uncomfortable, don't hesitate to end the conversation or meeting.",
  "No matter how touchy their story is, do not send money to anyone immediately you both connected.",
  "Date for some time to get to know each other before tying the knot.",
  "If you encounter someone behaving suspiciously or inappropriately, report them to the dating platform.",
];

const SafetyTips = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="#a78bfa">
          Tips on Online Safety for Dating Apps
        </Typography>
        <Typography variant="body1" paragraph>
          Ladies (and gents), it is important to prioritize your safety while in
          search of the love of your life on online dating apps.
        </Typography>
        <Typography variant="body1" paragraph>
          In today's digital age, online dating has revolutionized the way we
          meet potential partners. With just a few taps on our screens, we can
          connect with people from all walks of life, expanding our social
          circles and increasing our chances of finding that special someone.
          Dating apps and websites have made it easier than ever to spark
          meaningful relationships, breaking geographical barriers and offering
          a convenient way to navigate the world of love and relationships.
        </Typography>
        <Typography variant="body1" paragraph>
          When seeking love online, <strong>prioritize safety</strong> by
          keeping personal information private, using strong passwords, and
          verifying the identity of potential partners. Be cautious about
          sharing sensitive details and take things slow, allowing trust to
          build naturally.
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" fontWeight="bold" gutterBottom color="#a78bfa">
          Here are some tips to guide you:
        </Typography>
        <List>
          {tips.map((tip, idx) => (
            <ListItem key={idx} sx={{ alignItems: "flex-start" }}>
              <ListItemIcon>
                {tip.toLowerCase().includes("report") ? (
                  <ReportIcon color="error" />
                ) : tip.toLowerCase().includes("public") ? (
                  <PublicIcon color="primary" />
                ) : tip.toLowerCase().includes("phone") ? (
                  <PhoneAndroidIcon color="success" />
                ) : tip.toLowerCase().includes("verify") ? (
                  <VerifiedUserIcon color="info" />
                ) : tip.toLowerCase().includes("red flag") ? (
                  <WarningAmberIcon color="warning" />
                ) : (
                  <CheckCircleIcon color="secondary" />
                )}
              </ListItemIcon>
              <ListItemText primary={tip} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2" color="text.secondary">
          Stay safe, trust your instincts, and enjoy your journey to finding
          love!
        </Typography>
      </Box>
    </Container>
  );
};

export default SafetyTips;
