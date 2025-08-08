import React from "react";
import { Box, Typography, Container, Divider, IconButton } from "@mui/material";
import { LinkedIn, WhatsApp } from "@mui/icons-material";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="#a78bfa">
          PRIVACY POLICY
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          Effective Date: September 1, 2025
        </Typography>

        <Typography variant="body1" paragraph>
          This Privacy Policy (“Policy”) explains how Find Your Match
          (“Company”, “we”, “us”, or “our”) collects, uses, protects, and shares
          information about you when you access our matchmaking platform at
          https://findyourmatch.com (the “Site”) and engage with our related
          services, including social media platforms and community forums (the
          “Service”).
        </Typography>

        <Typography variant="body1" paragraph>
          The term “you” refers to anyone who uses, visits, or interacts with
          the Site.
        </Typography>

        <Typography variant="body1" paragraph>
          By accessing the Site or using our Service, you consent to the
          practices described in this Policy. If you do not agree with this
          Policy, please do not use the Site.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          1. Information We Collect
        </Typography>

        <Typography variant="subtitle1" fontWeight="bold">
          a) Information You Provide
        </Typography>
        <Typography variant="body1" paragraph>
          • Name, email address, phone number
          <br />
          • Date of birth, gender, location, preferences
          <br />
          • Photos, profile content, and answers to matchmaking questions
          <br />• Communications you send via email, WhatsApp, or through our
          platform
        </Typography>

        <Typography variant="subtitle1" fontWeight="bold">
          b) Automatically Collected Information
        </Typography>
        <Typography variant="body1" paragraph>
          • IP address, browser type, device identifiers
          <br />
          • Access times, page views, referring URLs
          <br />• Usage and interaction data (clicks, time spent, errors)
        </Typography>

        <Typography variant="subtitle1" fontWeight="bold">
          c) Information from Third Parties
        </Typography>
        <Typography variant="body1" paragraph>
          • Social media platforms (Facebook, LinkedIn, Instagram, WhatsApp)
          <br />
          • Referral partners or advertising networks
          <br />• Verification and identity services (for safety screening)
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          2. Use of Information
        </Typography>
        <Typography variant="body1" paragraph>
          • Create and manage user profiles
          <br />
          • Match users based on preferences
          <br />
          • Send updates, newsletters, and relationship resources
          <br />
          • Maintain a safe, respectful, and scam-free community
          <br />• Comply with legal obligations and enforce our Terms
        </Typography>

        <Typography variant="body1" paragraph>
          We do not sell your personal information.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          3. Cookies and Tracking Technologies
        </Typography>
        <Typography variant="body1" paragraph>
          We use cookies and similar technologies (pixels, web beacons) to
          personalize your experience, understand site traffic and engagement,
          and improve our matchmaking algorithms. You can manage your cookie
          preferences via your browser settings. Disabling cookies may affect
          functionality.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          4. Comments, Forums & Social Media
        </Typography>
        <Typography variant="body1" paragraph>
          Your interactions on public forums and social platforms may be visible
          to others. We may collect usernames and content, but third-party
          platforms may collect your data separately.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          5. Third-Party Links
        </Typography>
        <Typography variant="body1" paragraph>
          Our Site may include links to external websites. Once you leave our
          platform, this Policy no longer applies. We encourage you to review
          third-party privacy policies.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          6. Email and WhatsApp Marketing
        </Typography>
        <Typography variant="body1" paragraph>
          By subscribing, you consent to receive messages via email or WhatsApp.
          You can unsubscribe any time via email links, messaging "STOP", or
          contacting us at support@findyourmatch.com.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          7. Your Rights Under GDPR & CCPA
        </Typography>
        <Typography variant="body1" paragraph>
          EU and California residents have the right to access, correct, delete,
          or restrict the processing of their data. Contact us to exercise your
          rights.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          8. Security of Your Data
        </Typography>
        <Typography variant="body1" paragraph>
          We implement SSL encryption, database restrictions, and 2FA for admin
          accounts. However, no system is 100% secure.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          9. Children's Privacy
        </Typography>
        <Typography variant="body1" paragraph>
          Our services are not intended for users under 18. If we learn a child
          has provided personal data, we will delete it.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          10. Updates to This Policy
        </Typography>
        <Typography variant="body1" paragraph>
          We may revise this Policy periodically. Continued use of the Site
          indicates your acceptance of any updates.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          11. Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          ✉ Email:{" "}
          <Link
            href="mailto:support@lovedating.com"
            underline="hover"
            color="inherit"
          >
            support@lovedating.com
          </Link>
          <br />
          📍 Office: Lagos, Nigeria
          <br />
          📞 WhatsApp:{" "}
          <IconButton
            href="https://wa.me/2347050605491"
            target="_blank"
            sx={{ color: "#a78bfa" }}
          >
            <WhatsApp />
          </IconButton>
          <br />
          🔗 LinkedIn:{" "}
          <IconButton
            href="https://www.linkedin.com/company/find-yourr-match/"
            target="_blank"
            sx={{ color: "#a78bfa" }}
          >
            <LinkedIn />
          </IconButton>
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;
