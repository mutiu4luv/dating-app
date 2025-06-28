import { Route, Routes } from "react-router-dom";
import LandingPage from "./landingPage/LandingPage";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import Members from "./screens/MembersScreen";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import Chat from "./screens/chat/Chat";
import MergeScreen from "./screens/mergeScreen/MergeScreen";
import { useEffect } from "react";
import PaymentSuccess from "./components/payment/PaymentScreen";
import MergeSuccess from "./screens/mergeSuceessScreen/MergeSucess";
import MessagesScreen from "./screens/messages/MessagesScreen";
import { io } from "socket.io-client";
import UpdateProfileScreen from "./screens/UpdateProfileScreen";
import OtpScreen from "./screens/OtpScreen";
import ForgotPassword from "./screens/forgotPasswordScreen/ForgotPassword";
import ResetPassword from "./screens/forgotPasswordScreen/ResetPasswordScreen";
function App() {
  const currentUserId = localStorage.getItem("userId");

  console.log("Current User ID:", currentUserId);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.clear(); // Clear everything
    }
  }, []);

  // const socket = io("http://localhost:7000");

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
        {/* <Route path="/chat/:matchId" element={<Chat />} /> */}
        {/* <Route path="/matches" element={<Matches />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} /> */}
        {/* <Route path="/members/:userId" element={<Members />} /> */}
        <Route
          path="/members/:matchId"
          element={
            <ProtectedRoute>
              <Members userId={currentUserId} />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/chat/:member2"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route path="/payment-success" element={<PaymentSuccess />} /> */}
        <Route path="/merge/success/:member2" element={<PaymentSuccess />} />
        {/* <Route path="/merge/success/:member2" element={<MergeSuccess />} /> */}

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
        <Route path="/verify-registration" element={<OtpScreen />} />
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
