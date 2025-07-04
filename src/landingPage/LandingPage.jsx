import React from "react";
import HeroPage from "../components/HeroPage/HeroPage";
import Navbar from "../components/Navbar/Navbar";
import LoveStory from "../components/LoveStory/LoveStory";
import HowItWorks from "../components/HowItWorks/HowItWorks";
import Footer from "../components/Footer/Footer";
import CategoryGrid from "../components/CategoryGrid/CategoryGrid";
import EbookAdvert from "../components/E-book/EbookAdvert";
import TestimonyScreen from "../components/testimony/Testimony";

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <HeroPage />
      <LoveStory />
      <CategoryGrid />
      <HowItWorks />
      <TestimonyScreen />
      <EbookAdvert />
      <Footer />
    </div>
  );
};

export default LandingPage;
