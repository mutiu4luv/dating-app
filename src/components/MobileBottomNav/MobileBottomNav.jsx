import { useEffect, useMemo, useState } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ChatIcon from "@mui/icons-material/Chat";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import { useLocation, useNavigate } from "react-router-dom";
import { getStoredIsAdmin } from "../../utility/authState";

const hiddenPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/unauthorized",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/safetyTips",
  "/contact",
  "/about",
];

const moreItems = [
  {
    label: "Profile",
    path: "/profile",
    icon: <PersonIcon />,
  },
  {
    label: "Learning Hub",
    path: "/coming-soon/learning-hub",
    icon: <SchoolIcon />,
  },
  {
    label: "Dating Safety Tips",
    path: "/coming-soon/dating-safety-tips",
    icon: <HealthAndSafetyIcon />,
  },
  {
    label: "Contact Us",
    path: "/coming-soon/contact-us",
    icon: <ContactSupportIcon />,
  },
];

const MobileBottomNav = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const [authState, setAuthState] = useState({
    token: localStorage.getItem("token"),
    userId: localStorage.getItem("userId"),
    isAdmin: getStoredIsAdmin(),
  });

  useEffect(() => {
    const syncAuthState = () => {
      setAuthState({
        token: localStorage.getItem("token"),
        userId: localStorage.getItem("userId"),
        isAdmin: getStoredIsAdmin(),
      });
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("authChanged", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("authChanged", syncAuthState);
    };
  }, [location.pathname]);

  const { token, userId, isAdmin } = authState;

  const items = useMemo(() => {
    const baseItems = [
      {
        label: isAdmin ? "Dashboard" : "Home",
        value: isAdmin ? "dashboard" : "home",
        path: isAdmin ? "/admin" : "/",
        icon: isAdmin ? <DashboardIcon /> : <HomeIcon />,
      },
      {
        label: "Subscription",
        value: "subscription",
        path: `/merge/${userId}/upgrade`,
        icon: <WorkspacePremiumIcon />,
      },
      {
        label: "Chat",
        value: "chat",
        path: "/messages",
        icon: <ChatIcon />,
      },
      {
        label: "Merge",
        value: "merge",
        path: `/members/${userId}`,
        icon: <FavoriteIcon />,
      },
      {
        label: "More",
        value: "more",
        path: "",
        icon: <MoreHorizIcon />,
      },
    ];

    return baseItems;
  }, [isAdmin, userId]);

  if (
    !isMobile ||
    !token ||
    !userId ||
    hiddenPaths.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password")
  ) {
    return null;
  }

  const currentValue =
    items.find((item) => {
      if (item.value === "merge") {
        return location.pathname.startsWith("/members/");
      }
      if (item.value === "subscription") {
        return location.pathname === item.path;
      }
      if (item.value === "chat") {
        return (
          location.pathname === "/messages" || location.pathname.startsWith("/chat/")
        );
      }
      if (item.value === "more") {
        return (
          location.pathname === "/profile" ||
          location.pathname.startsWith("/coming-soon/")
        );
      }
      return location.pathname === item.path;
    })?.value || false;

  return (
    <>
      <Drawer
        anchor="bottom"
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "18px 18px 0 0",
            pb: "env(safe-area-inset-bottom)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography fontWeight={950} color="#2d0052" mb={1}>
            More
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <List disablePadding>
            {moreItems.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => {
                  setMoreOpen(false);
                  navigate(item.path);
                }}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemIcon sx={{ color: "#2d0052", minWidth: 42 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: 800,
                    color: "#2d0052",
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Paper
        elevation={10}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          borderTop: "1px solid rgba(45, 0, 82, 0.12)",
          background: "#fff",
          pb: "env(safe-area-inset-bottom)",
        }}
      >
        <BottomNavigation
          showLabels
          value={currentValue}
          onChange={(_, value) => {
            const item = items.find((navItem) => navItem.value === value);
            if (!item) return;
            if (item.value === "more") {
              setMoreOpen(true);
              return;
            }
            navigate(item.path);
          }}
          sx={{
            height: 68,
            "& .MuiBottomNavigationAction-root": {
              color: "#6b4679",
              minWidth: 0,
              px: 0.5,
            },
            "& .Mui-selected": {
              color: "#2d0052",
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.66rem",
              fontWeight: 700,
              whiteSpace: "nowrap",
            },
          }}
        >
          {items.map((item) => (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              value={item.value}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </>
  );
};

export default MobileBottomNav;
