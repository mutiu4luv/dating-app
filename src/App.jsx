import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./landingPage/LandingPage";
import Login from "./screens/Login";
import Members from "./screens/MembersScreen";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import Chat from "./screens/chat/Chat";
import MergeScreen from "./screens/mergeScreen/MergeScreen";
import { useEffect } from "react";
import PaymentSuccess from "./components/payment/PaymentScreen";
import MessagesScreen from "./screens/messages/MessagesScreen";
import UpdateProfileScreen from "./screens/UpdateProfileScreen";
import OtpScreen from "./screens/OtpScreen";
import ForgotPassword from "./screens/forgotPasswordScreen/ForgotPassword";
import ResetPassword from "./screens/forgotPasswordScreen/ResetPasswordScreen";
import CompleteRegistration from "./screens/completeRegistration/CompleteRegistration";
import AdminScreen from "./screens/adminScreen/AdminScreen";
import Unauthorized from "./components/Unauthorized";
import DisclaimerScreen from "./screens/DisclaimerScreen/Disclaimer";
import PrivacyPolicy from "./screens/PrivacyPolicyScreen/PrivacyPolicy";
import TermsAndConditions from "./screens/Terms&condition/Terms&condition";
import Signup from "./screens/Signup";
import SafetyTips from "./screens/safetyTips/SafetyTips";
import ContactUs from "./components/CONTACTuS/ContactUs";
import AboutUs from "./components/ABOUT-US/AboutUs";
import MobileBottomNav from "./components/MobileBottomNav/MobileBottomNav";
import AgeGate from "./components/AgeGate/AgeGate";
import { getStoredIsAdmin } from "./utility/authState";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  if (!getStoredIsAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.clear(); // Clear everything if no token
    }
  }, []);

  return (
    <>
      <AgeGate />
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/members/:matchId"
            element={
              <ProtectedRoute>
                <Members />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminScreen />
              </AdminRoute>
            }
          />

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/disclaimer" element={<DisclaimerScreen />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/merge/success/:member2" element={<PaymentSuccess />} />

          <Route
            path="/chat/:member1/:member2"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UpdateProfileScreen />
              </ProtectedRoute>
            }
          />

          <Route
            path="/merge/:userId/:member2"
            element={
              <ProtectedRoute>
                <MergeScreen />
              </ProtectedRoute>
            }
          />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/safetyTips" element={<SafetyTips />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />
          {/* <Route path="/register" element={<OtpScreen />} /> */}
          {/* <Route
          path="/complete-registration"
          element={<CompleteRegistration />}
        /> */}

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesScreen />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <MobileBottomNav />
    </>
  );
}

export default App;
