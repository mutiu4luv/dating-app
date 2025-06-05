import { Route, Routes } from "react-router-dom";
import LandingPage from "./landingPage/LandingPage";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import Members from "./screens/MembersScreen";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/matches" element={<Matches />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} /> */}
        <Route path="/members/:userId" element={<Members />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
