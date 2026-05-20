import { useEffect, useMemo, useState } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ChatIcon from "@mui/icons-material/Chat";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
import { useLocation, useNavigate } from "react-router-dom";

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

const MobileBottomNav = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  const [authState, setAuthState] = useState({
    token: localStorage.getItem("token"),
    userId: localStorage.getItem("userId"),
    isAdmin: localStorage.getItem("isAdmin") === "true",
  });

  useEffect(() => {
    const syncAuthState = () => {
      setAuthState({
        token: localStorage.getItem("token"),
        userId: localStorage.getItem("userId"),
        isAdmin: localStorage.getItem("isAdmin") === "true",
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
        label: "Profile",
        value: "profile",
        path: "/profile",
        icon: <PersonIcon />,
      },
    ];

    if (!isAdmin) return baseItems;

    return [
      {
        label: "Dashboard",
        value: "dashboard",
        path: "/admin",
        icon: <DashboardIcon />,
      },
      ...baseItems,
    ];
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
      return location.pathname === item.path;
    })?.value || false;

  return (
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
          if (item) navigate(item.path);
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
            fontSize: "0.68rem",
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
  );
};

export default MobileBottomNav;
