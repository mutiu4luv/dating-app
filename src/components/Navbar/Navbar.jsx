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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.clear(); // Just in case
    }
    setIsLoggedIn(!!token);
    setUsername(localStorage.getItem("username") || "");
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setUsername(localStorage.getItem("username") || "");
  }, [location.pathname]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleMenuClick = (item) => {
    handleMenuClose();
    if (item === "Logout") {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      setIsLoggedIn(false);
      setUsername("");
      navigate("/");
    } else if (item === "Home") {
      navigate("/");
    } else if (item === "Matches") {
      navigate(`/members/${userId} `, { replace: true });
    } else if (item === "Messages") {
      navigate("/messages");
    } else if (item === "Profile") {
      navigate("/profile");
    } else if (item === "Login/SignIn") {
      navigate("/login");
    }
  };
  // return
  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#ec4899" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center">
          <FavoriteIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            LoveLink
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {isLoggedIn && username ? (
            <>
              <Button
                color="inherit"
                startIcon={
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: "#b993d6",
                      color: "#fff",
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
                  color: "#fff",
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
                        backgroundColor: "#f3e8ff",
                        color: "#a21caf",
                      },
                    },
                  },
                }}
              >
                <MenuItem onClick={() => handleMenuClick("Home")}>
                  <HomeIcon sx={{ mr: 1, color: "#ec4899" }} /> Home
                </MenuItem>
                <MenuItem onClick={() => handleMenuClick("Matches")}>
                  <PeopleIcon sx={{ mr: 1, color: "#ec4899" }} /> Matches
                </MenuItem>
                <MenuItem onClick={() => handleMenuClick("Messages")}>
                  <ChatIcon sx={{ mr: 1, color: "#ec4899" }} /> Messages
                </MenuItem>
                <MenuItem onClick={() => handleMenuClick("Profile")}>
                  <PersonIcon sx={{ mr: 1, color: "#ec4899" }} /> Profile
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={() => handleMenuClick("Logout")}>
                  <LogoutIcon sx={{ mr: 1, color: "#ef4444" }} /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                sx={{ color: "#fff", fontWeight: "600" }}
                startIcon={<LoginIcon />}
                onClick={() => handleMenuClick("Login/SignIn")}
              >
                Login/SignIn
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
