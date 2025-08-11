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
import { io } from "socket.io-client";
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

function App() {
  const currentUserId = localStorage.getItem("userId");
  const user = JSON.parse(localStorage.getItem("user"));

  console.log("Current User ID:", currentUserId);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.clear(); // Clear everything if no token
    }
  }, []);

  const socket = io(
    import.meta.env.VITE_BACKEND_URL || "http://localhost:7000",
    {
      transports: ["websocket"],
    }
  );

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      socket.emit("user_connected", userId);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
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

        {/* Admin Route - Reads isAdmin fresh from localStorage */}
        <Route
          path="/admin"
          element={
            localStorage.getItem("isAdmin") === "true" ? (
              <AdminScreen />
            ) : (
              <Navigate to="/unauthorized" />
            )
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
        <Route path="/register" element={<OtpScreen />} />
        <Route
          path="/complete-registration"
          element={<CompleteRegistration />}
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesScreen />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
