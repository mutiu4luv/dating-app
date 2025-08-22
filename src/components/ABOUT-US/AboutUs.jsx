import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Stack,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PeopleIcon from "@mui/icons-material/People";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import BookIcon from "@mui/icons-material/Book";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

const values = [
  {
    icon: <VerifiedUserIcon color="primary" />,
    label: "Authenticity",
    desc: "Be yourself, and let your true personality shine. No scamming is allowed.",
  },
  {
    icon: <FavoriteIcon color="error" />,
    label: "Respect",
    desc: "Treat others with kindness, empathy, and understanding.",
  },
  {
    icon: <PeopleIcon color="success" />,
    label: "Connection",
    desc: "Build genuine relationships based on shared interests and values.",
  },
  {
    icon: <GroupWorkIcon color="secondary" />,
    label: "Inclusivity",
    desc: "Everyone deserves love and connection, regardless of background or identity.",
  },
];

const benefits = [
  {
    icon: <EmojiEventsIcon color="warning" />,
    text: "Meet new people beyond your social circle.",
  },
  {
    icon: <FavoriteIcon color="error" />,
    text: "Our algorithm suggests compatible matches based on your preferences.",
  },
  {
    icon: <BookIcon color="primary" />,
    text: "Access free relationship and marriage ebooks after signup.",
  },
  {
    icon: <GroupWorkIcon color="secondary" />,
    text: "Option to pay for expert relationship coaching.",
  },
  {
    icon: <WhatsAppIcon sx={{ color: "#25D366" }} />,
    text: "Join our Whatsapp community forums for advice and support.",
  },
  {
    icon: <MonetizationOnIcon color="success" />,
    text: "Earn massively when you refer friends or family to join.",
  },
];

const AboutUs = () => (
  <Container maxWidth="md" sx={{ py: 8 }}>
    <Paper
      elevation={8}
      sx={{
        p: { xs: 2, sm: 4 },
        borderRadius: 4,
        background: "linear-gradient(135deg, #fdf6f9 0%, #D9A4F0 100%)",
        color: "#232946",
      }}
    >
      <Box textAlign="center" sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight="bold" color="#a78bfa" gutterBottom>
          Welcome to TrueMatchUp
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Connecting singles worldwide for meaningful relationships and love.
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" fontWeight="bold" color="#a78bfa" gutterBottom>
        Our Values
      </Typography>
      <List>
        {values.map((v, i) => (
          <ListItem key={i} alignItems="flex-start">
            <ListItemIcon>{v.icon}</ListItemIcon>
            <ListItemText
              primary={<strong>{v.label}</strong>}
              secondary={v.desc}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" fontWeight="bold" color="#a78bfa" gutterBottom>
        Our Goal
      </Typography>
      <Typography variant="body1" paragraph>
        We're committed to helping you find that special someone, whether it's a
        casual friendship or a lifelong partner. Our platform is designed to be
        user-friendly, safe, secure, and enjoyable for everyone.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" fontWeight="bold" color="#a78bfa" gutterBottom>
        Benefits
      </Typography>
      <List>
        {benefits.map((b, i) => (
          <ListItem key={i}>
            <ListItemIcon>{b.icon}</ListItemIcon>
            <ListItemText primary={b.text} />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 3 }} />

      <Box textAlign="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold" color="#a78bfa" gutterBottom>
          Join Our Community Today!
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Sign up now and start exploring profiles, connecting with others, and
          potentially finding the love of your life.
        </Typography>
        <Stack direction="row" justifyContent="center">
          <Button
            href="/register"
            variant="contained"
            sx={{
              background: "linear-gradient(90deg, #a78bfa 60%, #b993d6 100%)",
              fontWeight: "bold",
              fontSize: 18,
              px: 4,
              py: 1.5,
              boxShadow: "0 2px 8px rgba(167,139,250,0.15)",
              "&:hover": {
                background: "linear-gradient(90deg, #db2777 60%, #a78bfa 100%)",
              },
            }}
          >
            Sign Up
          </Button>
        </Stack>
      </Box>
    </Paper>
  </Container>
);

export default AboutUs;
