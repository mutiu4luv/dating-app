import { Route, Routes } from "react-router-dom";
import LandingPage from "./landingPage/LandingPage";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import Members from "./screens/MembersScreen";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import Chat from "./screens/chat/Chat";
import MergeScreen from "./screens/mergeScreen/MergeScreen";
function App() {
  const currentUserId = localStorage.getItem("userId");
  if (!currentUserId) {
    console.error("User ID not found in localStorage");
    return <div>Error: User ID not found</div>;
  }
  console.log("Current User ID:", currentUserId);

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
        <Route
          path="/chat/:matchId"
          element={
            <ProtectedRoute>
              <Chat />
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
