import React from "react";
import HeroPage from "../components/HeroPage/HeroPage";
import Navbar from "../components/Navbar/Navbar";
import LoveStory from "../components/LoveStory/LoveStory";
import HowItWorks from "../components/HowItWorks/HowItWorks";
import Footer from "../components/Footer/Footer";
import CategoryGrid from "../components/CategoryGrid/CategoryGrid";

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <HeroPage />
      <LoveStory />
      <CategoryGrid />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default LandingPage;
