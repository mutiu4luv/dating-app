import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
} from "@mui/material";
import { Facebook, Instagram, Email, Favorite } from "@mui/icons-material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: "linear-gradient(90deg, #db2777 0%, #ec4899 100%)",
        color: "#fff",
        py: 6,
        mt: 10,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Tagline */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              LoveDating ❤️
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
              <Link href="#" underline="hover" color="inherit">
                Home
              </Link>
              <Link href="#" underline="hover" color="inherit">
                About Us
              </Link>
              <Link href="#" underline="hover" color="inherit">
                Stories
              </Link>
              <Link href="#" underline="hover" color="inherit">
                Contact
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
                href="https://facebook.com"
                target="_blank"
                sx={{ color: "#fff" }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                href="https://instagram.com"
                target="_blank"
                sx={{ color: "#fff" }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                href="mailto:support@lovedating.com"
                sx={{ color: "#fff" }}
              >
                <Email />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ mt: 2 }}>
              support@lovedating.com
            </Typography>
          </Grid>
        </Grid>

        {/* Bottom Line */}
        <Box
          sx={{
            textAlign: "center",
            mt: 6,
            borderTop: "1px solid #ffffff44",
            pt: 3,
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} LoveDating. Made with{" "}
            <Favorite
              sx={{ color: "#fff", fontSize: 16, verticalAlign: "middle" }}
            />{" "}
            for true love.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
