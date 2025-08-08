import React from "react";
import { Box, Typography, Container, Divider } from "@mui/material";

const TermsAndConditions = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="#a78bfa">
          TERMS AND CONDITIONS
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          Effective Date: September 1, 2025
        </Typography>

        <Typography variant="body1" paragraph>
          Welcome to Find Your Match (the “Site”), accessible via
          https://findyourmatch.com. These Terms and Conditions (the “Terms”)
          govern your use of the Site, including any content, features,
          functionality, and services offered through it (collectively, the
          “Service”).
        </Typography>

        <Typography variant="body1" paragraph>
          By using our Service, you confirm that you have read, understood, and
          agree to be bound by these Terms. If you do not agree, please do not
          access or use the Service.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {[
          {
            title: "1. Our Mission and Community Ethos",
            body: "Find Your Match is built on respect, safety, authenticity, and cultural sensitivity. We are committed to creating a scam-free, inclusive, and lawful environment where individuals can connect meaningfully. Any attempt to deceive, defraud, harass, or exploit others will result in immediate suspension or legal action.",
          },
          {
            title: "2. Changes to These Terms",
            body: "We may update these Terms from time to time. If changes are material, we will notify you through the Site or via email at least 30 days before they take effect. By continuing to use the Service after any changes, you accept the revised Terms. If you do not agree, you must discontinue use.",
          },
          {
            title: "3. Eligibility (Minimum Age Requirement)",
            body: `This Service is intended for users 18 years and older. By accessing the Site, you confirm that:
            \u2022 You are at least 18 years of age.\n\u2022 You are legally capable of entering into a binding contract in your jurisdiction.\n\u2022 You are not barred from using online dating services under any applicable law.`,
          },
          {
            title: "4. Access to the Service",
            body: `We reserve the right to modify or discontinue any part of the Service without notice. Users are responsible for:\n\u2022 Ensuring stable internet access.\n\u2022 Ensuring that all persons accessing the Site through their connection comply with these Terms.`,
          },
          {
            title: "5. User Accounts and Conduct",
            body:
              `When creating an account:\n\u2022 You agree to provide accurate, current, and complete information.\n\u2022 You must not impersonate others or use offensive or misleading usernames.\n\u2022 You are solely responsible for activity under your account and must keep your login credentials secure.` +
              `\n\nProhibited behavior includes but is not limited to:\n\u2022 Scams, fraud, catfishing, or identity theft.\n\u2022 Soliciting money or sensitive information from other users.\n\u2022 Harassment, threats, or sexually explicit conduct.\n\u2022 Use of fake profiles or stolen images.\n\u2022 Attempting to bypass security features or gain unauthorized access.`,
          },
          {
            title: "6. Respectful and Lawful Use",
            body: `You agree to use the Service for lawful, respectful, and personal purposes only. You must not upload, share, or distribute content that is:\n\u2022 Illegal, harmful, abusive, pornographic, or defamatory.\n\u2022 Violates privacy or intellectual property rights.\n\u2022 Promotes discrimination, violence, or self-harm.\n\u2022 Contains viruses, malware, or phishing links.\n\u2022 Involves multi-level marketing, spamming, or unauthorized advertising.`,
          },
          {
            title: "7. User-Generated Content",
            body:
              `You retain ownership of content you post but grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute that content in connection with the Service.` +
              `\n\nYou confirm that:\n\u2022 You own or have rights to the content you upload.\n\u2022 Your content does not violate any laws or third-party rights.`,
          },
          {
            title: "8. Intellectual Property",
            body: "All original content and features of the Service are the property of Find Your Match and its licensors and are protected under copyright, trademark, and other laws. You may not copy, distribute, reverse engineer, or use any material without prior written consent.",
          },
          {
            title: "9. Third-Party Links",
            body: "Our Service may contain links to third-party websites or services. We do not control or endorse these websites and are not responsible for their content or practices. Your use of third-party sites is at your own risk.",
          },
          {
            title: "10. Limitation of Liability",
            body:
              `To the fullest extent permitted by law, Find Your Match, its founders, affiliates, and partners are not liable for any:\n\u2022 Indirect or consequential damages,\n\u2022 Emotional distress or disappointment from failed matches,\n\u2022 Loss of data or personal harm caused by another user,\n\u2022 Issues arising from third-party links or services.` +
              `\n\nOur total liability will not exceed the amount paid (if any) for your use of the Service.`,
          },
          {
            title: "11. Indemnification",
            body: `You agree to indemnify and hold harmless Find Your Match, its owners, directors, and affiliates against all claims, damages, and legal fees arising from your:\n\u2022 Violation of these Terms,\n\u2022 Misuse of the Service,\n\u2022 Infringement of rights or applicable laws.`,
          },
          {
            title: "12. Governing Law and Jurisdiction",
            body: "These Terms are governed by the laws of the Federal Republic of Nigeria, irrespective of conflict of law principles. All disputes will be resolved under the jurisdiction of the appropriate courts in Nigeria, unless otherwise agreed in writing.",
          },
          {
            title: "13. Waiver of Class Action",
            body: "You agree that any dispute will be resolved individually, not as part of a class action. You waive your right to participate in any class or representative legal proceeding against us.",
          },
          {
            title: "14. Termination",
            body: "We reserve the right to suspend or terminate your account without notice for any violation of these Terms or behavior that undermines the safety and integrity of the community.",
          },
          {
            title: "15. Contact Information",
            body: `\u2709 support@findyourmatch.com\n\ud83d\udccd Lagos, Nigeria (HQ)`,
          },
        ].map(({ title, body }, index) => (
          <Box key={index}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body1" paragraph whiteSpace="pre-line">
              {body}
            </Typography>
            <Divider sx={{ my: 3 }} />
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default TermsAndConditions;
