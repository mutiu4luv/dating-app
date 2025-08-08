import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Facebook,
  Instagram,
  Email,
  Favorite,
  LinkedIn,
  WhatsApp,
} from "@mui/icons-material";
import { FaTiktok } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: "linear-gradient(90deg, #fdf6f9 0%, #D9A4F0 100%)",
        color: "#111",
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Tagline */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              FindYourMatch ❤️
            </Typography>
            <Typography variant="body2">
              Find love, make memories, and share your story with someone
              special.
            </Typography>
          </Grid>

          {/* Navigation Links */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link href="/" underline="hover" color="inherit">
                Home
              </Link>
              <Link href="/about" underline="hover" color="inherit">
                About Us
              </Link>
              <Link href="/contact" underline="hover" color="inherit">
                Contact
              </Link>
              <Link
                component={RouterLink}
                to="/disclaimer"
                underline="hover"
                color="inherit"
              >
                Disclaimer
              </Link>
              <Link
                component={RouterLink}
                to="/privacy  "
                underline="hover"
                color="inherit"
              >
                Privacy Policy
              </Link>
              <Link
                component={RouterLink}
                to="/terms"
                underline="hover"
                color="inherit"
              >
                Terms and Conditions
              </Link>
            </Box>
          </Grid>

          {/* Contact and Social */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Connect with Us
            </Typography>
            <Box>
              <IconButton
                href="https://www.facebook.com/share/19ZNVaxr8S/"
                target="_blank"
                sx={{ color: " #a78bfa" }}
              >
                <Facebook />
              </IconButton>
              {/* <IconButton
                href="https://instagram.com"
                target="_blank"
                sx={{ color: "#a78bfa" }}
              >
                <Instagram />
              </IconButton> */}
              <IconButton
                href="mailto:support@lovedating.com"
                sx={{ color: "#a78bfa" }}
              >
                <Email />
              </IconButton>
              <IconButton
                href="https://www.linkedin.com/company/find-yourr-match/"
                target="_blank"
                sx={{ color: "#a78bfa" }}
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                href="https://wa.me/2347050605491"
                target="_blank"
                sx={{ color: "#a78bfa" }}
              >
                <WhatsApp />
              </IconButton>
              <IconButton
                href="https://tiktok.com/@findyourmatch01"
                target="_blank"
                sx={{ color: "#a78bfa" }}
              >
                <FaTiktok />
              </IconButton>
            </Box>

            <Typography variant="body2" sx={{ mt: 2 }}>
              <Link
                href="mailto:support@lovedating.com"
                underline="hover"
                color="inherit"
              >
                support@lovedating.com
              </Link>
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: "#ec489966" }} />

        {/* Designer Info */}
        <Box textAlign="center" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="medium">
            Designed by <strong>Madu Chibueze Emmanuel</strong>
          </Typography>
          <Typography variant="body2">
            <Link
              href="mailto:chidiemmamadu@gmail.com"
              underline="hover"
              color="inherit"
            >
              chidiemmamadu@gmail.com
            </Link>{" "}
            |{" "}
            <Link href="tel:+2347031911306" underline="hover" color="inherit">
              +2347031911306
            </Link>
          </Typography>
        </Box>

        {/* Bottom Line */}
        <Box
          sx={{
            textAlign: "center",
            borderTop: "1px solid #ec489933",
            pt: 3,
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} FindYourMatch. Made with{" "}
            <Favorite
              sx={{ color: "#ec4899", fontSize: 16, verticalAlign: "middle" }}
            />{" "}
            for true love.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
