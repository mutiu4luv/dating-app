import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import MobileBottomNav from "./components/MobileBottomNav/MobileBottomNav";
import AgeGate from "./components/AgeGate/AgeGate";
import { getStoredIsAdmin } from "./utility/authState";
import GlobalMessageNotifications from "./components/GlobalMessageNotifications";
import NotificationEnablePrompt from "./components/NotificationEnablePrompt";

const LandingPage = lazy(() => import("./landingPage/LandingPage"));
const Login = lazy(() => import("./screens/Login"));
const Members = lazy(() => import("./screens/MembersScreen"));
const MemberProfilePreview = lazy(() => import("./screens/MemberProfilePreview"));
const Chat = lazy(() => import("./screens/chat/Chat"));
const MergeScreen = lazy(() => import("./screens/mergeScreen/MergeScreen"));
const PaymentSuccess = lazy(() => import("./components/payment/PaymentScreen"));
const MessagesScreen = lazy(() => import("./screens/messages/MessagesScreen"));
const UpdateProfileScreen = lazy(() => import("./screens/UpdateProfileScreen"));
const ForgotPassword = lazy(() => import("./screens/forgotPasswordScreen/ForgotPassword"));
const ResetPassword = lazy(() => import("./screens/forgotPasswordScreen/ResetPasswordScreen"));
const AdminScreen = lazy(() => import("./screens/adminScreen/AdminScreen"));
const Unauthorized = lazy(() => import("./components/Unauthorized"));
const DisclaimerScreen = lazy(() => import("./screens/DisclaimerScreen/Disclaimer"));
const PrivacyPolicy = lazy(() => import("./screens/PrivacyPolicyScreen/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./screens/Terms&condition/Terms&condition"));
const Signup = lazy(() => import("./screens/Signup"));
const SafetyTips = lazy(() => import("./screens/safetyTips/SafetyTips"));
const ContactUs = lazy(() => import("./components/CONTACTuS/ContactUs"));
const AboutUs = lazy(() => import("./components/ABOUT-US/AboutUs"));
const ComingSoon = lazy(() => import("./screens/ComingSoon"));
const ChangePasswordScreen = lazy(() => import("./screens/ChangePasswordScreen"));

const RouteFallback = () => (
  <div
    style={{
      minHeight: "60vh",
      display: "grid",
      placeItems: "center",
      background: "#181c2b",
      color: "#fff",
      fontWeight: 800,
    }}
  >
    Loading page...
  </div>
);

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
      <GlobalMessageNotifications />
      <NotificationEnablePrompt />
      <div className="app-shell">
        <Suspense fallback={<RouteFallback />}>
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
            path="/member-profile/:memberId"
            element={
              <ProtectedRoute>
                <MemberProfilePreview />
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
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordScreen />
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
          <Route
            path="/coming-soon/:page"
            element={
              <ProtectedRoute>
                <ComingSoon />
              </ProtectedRoute>
            }
          />
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
        </Suspense>
      </div>
      <MobileBottomNav />
    </>
  );
}

export default App;
