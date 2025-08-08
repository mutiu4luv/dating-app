import React from "react";
import {
  Box,
  Typography,
  Divider,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";

const DisclaimerScreen = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const Section = ({ title, children }) => (
    <Box mt={5}>
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{ color: " #b993d6", mb: 1 }}
      >
        {title}
      </Typography>
      <Divider sx={{ borderColor: "#FBCFE8", mb: 2 }} />
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ whiteSpace: "pre-line" }}
      >
        {children}
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        fontWeight="bold"
        align="center"
        color=" #b993d6"
        gutterBottom
      >
        DISCLAIMER
      </Typography>

      <Typography
        variant="subtitle1"
        color="text.secondary"
        align="center"
        gutterBottom
      >
        Effective Date: September 1, 2025
      </Typography>

      <Section title="General Information">
        This website (https://findyourmatch.com) is owned and operated by Find
        Your Match (“Company”, “we”, “us”, or “our”). The content provided on
        this website is for informational, educational, and entertainment
        purposes only and is not intended as professional advice of any kind,
        including but not limited to medical, mental health, legal, or
        counselling services. Any views or content shared are general in nature
        and do not replace tailored advice from licensed professionals. By using
        this Site, you agree to be bound by this Disclaimer, along with our
        Terms and Conditions and Privacy Policy. If you do not agree, please do
        not use the Site.
      </Section>

      <Section title="No Medical, Legal, or Psychological Advice">
        This platform is not a medical, mental health, or legal service. We do
        not offer diagnosis, therapy, legal counsel, or crisis support. Any
        suggestions, tips, or resources shared are not substitutes for
        professional advice or treatment. Always consult with a qualified
        healthcare provider, therapist, or legal professional for your specific
        needs.
      </Section>

      <Section title="No Automatic Coaching or Counselling Relationship">
        While the co-founders of Find Your Match are certified relationship
        coaches, your use of this website does not automatically create a
        coaching, counselling, or professional relationship with either of them.
        We may offer coaching services, educational resources, or books through
        this platform, but: • Such services are only available upon direct
        request and mutual agreement, formalised through a separate written or
        digital contract. • Coaching is not a substitute for psychotherapy,
        counselling, or mental health treatment. • Coaching engagements are
        future-focused, goal-oriented, and intended for personal development and
        relationship growth. If you are interested in coaching, you must
        initiate contact and complete the required steps to formally engage our
        services.
      </Section>

      <Section title="No Guarantees or Matchmaking Guarantees">
        Find Your Match does not guarantee compatibility, matches,
        relationships, or success in your dating journey. Outcomes depend on
        many variables including user interaction, honesty, compatibility, and
        personal efforts. While we strive to maintain a safe and respectful
        platform, we cannot verify every detail provided by users and are not
        responsible for false representations, scams, or misconduct by third
        parties. Please use your best judgment and take appropriate safety
        precautions when interacting online or meeting in person.
      </Section>

      <Section title="Warranties and Representations">
        This Site and all content are provided on an “as is” and “as available”
        basis without any express or implied warranties. We do not warrant: •
        That the Site will always be available or free of errors or
        interruptions • That profiles or user-generated content are accurate,
        truthful, or lawful • That our systems are free from viruses or other
        harmful components Use of the Site is at your own risk.
      </Section>

      <Section title="Limitation of Liability">
        Under no circumstances shall we, our team, affiliates, or partners be
        held liable for any direct, indirect, incidental, consequential, or
        punitive damages arising out of your use of the Site or reliance on its
        content. This includes, but is not limited to: • Emotional distress •
        Financial loss • Identity theft • Harm caused by interactions with other
        users You accept full responsibility for your actions and decisions.
      </Section>

      <Section title="External Links">
        The Site may contain links to third-party websites for your convenience
        or education. We do not endorse or control these sites and are not
        responsible for their content, practices, or policies. Visiting external
        sites is done at your own discretion.
      </Section>

      <Section title="Intellectual Property">
        All content on this website—including text, design, graphics, logos, and
        original resources—is protected by copyright and intellectual property
        laws. You may not reproduce, distribute, modify, or commercially exploit
        any part of the Site without prior written consent.
      </Section>

      <Section title="Governing Law">
        This Disclaimer is governed by the laws of the Federal Republic of
        Nigeria, and any disputes arising from this Disclaimer shall be subject
        to the jurisdiction of the appropriate Nigerian courts, unless otherwise
        agreed in writing.
      </Section>

      <Section title="Changes to This Disclaimer">
        We reserve the right to update or revise this Disclaimer at any time.
        Any changes will take effect immediately upon posting. Your continued
        use of the Site constitutes your acceptance of the updated Disclaimer.
      </Section>

      <Section title="Contact Us">
        For questions, feedback, or concerns about this Disclaimer, please
        contact us: 📧 Email: support@findyourmatch.com 📱 WhatsApp: [Insert
        number if applicable] 🔗 LinkedIn: [Insert our page or profile URL] 📍
        Head Office: Lagos, Nigeria
      </Section>
    </Container>
  );
};

export default DisclaimerScreen;
