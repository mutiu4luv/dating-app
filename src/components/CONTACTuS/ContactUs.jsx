import React from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Stack,
  Link,
  Paper,
} from "@mui/material";
import { Facebook, LinkedIn, WhatsApp, Email } from "@mui/icons-material";
import { FaTiktok } from "react-icons/fa";

const ContactUs = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg, #fdf6f9 0%, #D9A4F0 100%)",
          color: "#232946",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          color="#a78bfa"
          textAlign="center"
        >
          Contact Us
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 3 }}>
          We'd love to hear from you! Reach out to us on any of our platforms
          below, or send us an email. Our team is always ready to help you find
          love and stay safe online.
        </Typography>
        <Stack
          direction="row"
          justifyContent="center"
          spacing={3}
          sx={{ mb: 2 }}
        >
          <IconButton
            href="https://www.facebook.com/share/19ZNVaxr8S/"
            target="_blank"
            sx={{ color: "#4267B2" }}
            aria-label="Facebook"
          >
            <Facebook fontSize="large" />
          </IconButton>
          <IconButton
            href="https://wa.me/2347050605491"
            target="_blank"
            sx={{ color: "#25D366" }}
            aria-label="WhatsApp"
          >
            <WhatsApp fontSize="large" />
          </IconButton>
          <IconButton
            href="https://www.linkedin.com/company/find-yourr-match/"
            target="_blank"
            sx={{ color: "#0A66C2" }}
            aria-label="LinkedIn"
          >
            <LinkedIn fontSize="large" />
          </IconButton>
          <IconButton
            href="https://tiktok.com/@findyourmatch01"
            target="_blank"
            sx={{ color: "#000" }}
            aria-label="TikTok"
          >
            <FaTiktok size={32} />
          </IconButton>
          <IconButton
            href="mailto:support@lovedating.com"
            sx={{ color: "#a78bfa" }}
            aria-label="Email"
          >
            <Email fontSize="large" />
          </IconButton>
        </Stack>
        <Box textAlign="center" sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Email:</strong>{" "}
            <Link
              href="mailto:support@lovedating.com"
              underline="hover"
              color="inherit"
            >
              support@lovedating.com
            </Link>
          </Typography>
          <Typography variant="body2">
            <strong>WhatsApp:</strong>{" "}
            <Link
              href="https://wa.me/2347050605491"
              underline="hover"
              color="inherit"
              target="_blank"
            >
              +234 705 060 5491
            </Link>
          </Typography>
        </Box>
        <Box textAlign="center" sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Lagos, Nigeria (HQ)
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ContactUs;
