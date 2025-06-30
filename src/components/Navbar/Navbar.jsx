import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Badge,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { useNavigate, useLocation, Link } from "react-router-dom";
import io from "socket.io-client";
import api from "../../components/api/Api";

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:7000");

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) localStorage.clear();
    setIsLoggedIn(!!token);
    setUsername(localStorage.getItem("username") || "");
  }, [location.pathname]);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/chat/unread/count/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        console.error("Failed to fetch unread count", err);
      }
    };

    if (userId) {
      fetchUnreadMessages();
      socket.emit("join_room", userId);
    }

    socket.on("receive_message", (data) => {
      if (data.receiverId === userId) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [userId]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleMenuClick = async (item) => {
    handleMenuClose();
    switch (item) {
      case "Logout":
        try {
          const token = localStorage.getItem("token");
          await api.post(
            "/user/logout",
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } catch (err) {
          console.error("Logout failed", err);
        } finally {
          localStorage.clear();
          setIsLoggedIn(false);
          setUsername("");
          navigate("/");
        }
        break;
      case "Home":
        navigate("/");
        break;
      case "Matches":
        navigate(`/members/${userId}`);
        break;
      case "Messages":
        try {
          const token = localStorage.getItem("token");
          await api.put(
            `/chat/read/${userId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUnreadCount(0);
        } catch (err) {
          console.error("Failed to mark messages as read", err);
        }
        navigate("/messages");
        break;
      case "Profile":
        navigate("/profile");
        break;
      case "Login/SignIn":
        navigate("/login");
        break;
      default:
        break;
    }
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#D9A4F0" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center">
          <FavoriteIcon sx={{ mr: 1, color: "#2d0052" }} />
          <Link to="/" style={{ textDecoration: "none" }}>
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: "bold", color: "#2d0052" }}
            >
              FindYourMatch{" "}
            </Typography>
          </Link>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {isLoggedIn && username ? (
            <>
              <IconButton
                color="inherit"
                onClick={() => handleMenuClick("Messages")}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  max={9}
                  invisible={unreadCount === 0}
                >
                  <ChatIcon />
                </Badge>
              </IconButton>
              <Button
                color="inherit"
                startIcon={
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: "#b993d6",
                      color: "#2d0052",
                      fontWeight: "bold",
                    }}
                  >
                    {username[0]?.toUpperCase()}
                  </Avatar>
                }
                endIcon={<ArrowDropDownIcon />}
                onClick={handleMenuOpen}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  color: "#2d0052",
                  ml: 1,
                }}
              >
                {username.split(" ")[0]}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                  elevation: 4,
                  sx: {
                    borderRadius: 2,
                    minWidth: 180,
                    mt: 1,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                    "& .MuiMenuItem-root": {
                      fontWeight: 500,
                      fontSize: 15,
                      "&:hover": {
                        backgroundColor: "#2d0052",
                        color: "#a21caf",
                      },
                    },
                  },
                }}
              >
                <MenuItem onClick={() => handleMenuClick("Home")}>
                  {" "}
                  <HomeIcon sx={{ mr: 1, color: "#2d0052" }} /> Home{" "}
                </MenuItem>
                <MenuItem onClick={() => handleMenuClick("Matches")}>
                  {" "}
                  <PeopleIcon sx={{ mr: 1, color: "#2d0052" }} /> Matches{" "}
                </MenuItem>
                <MenuItem onClick={() => handleMenuClick("Messages")}>
                  {" "}
                  <ChatIcon sx={{ mr: 1, color: "#2d0052" }} /> Messages{" "}
                </MenuItem>
                <MenuItem onClick={() => handleMenuClick("Profile")}>
                  {" "}
                  <PersonIcon sx={{ mr: 1, color: "#2d0052" }} /> Profile{" "}
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={() => handleMenuClick("Logout")}>
                  {" "}
                  <LogoutIcon sx={{ mr: 1, color: "#2d0052" }} /> Logout{" "}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              sx={{ color: "#2d0052", fontWeight: "600" }}
              startIcon={<LoginIcon />}
              onClick={() => handleMenuClick("Login/SignIn")}
            >
              Login/SignIn
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
