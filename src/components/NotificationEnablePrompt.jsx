import { useEffect, useState } from "react";
import { Alert, Box, Button, Collapse, Paper, Typography } from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { requestNotificationPermission } from "../utility/notifications";

const NotificationEnablePrompt = () => {
  const [visible, setVisible] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const checkPermission = () => {
      const token = localStorage.getItem("token");
      if (!token || !("Notification" in window)) {
        setVisible(false);
        return;
      }

      const dismissed = localStorage.getItem("notificationPromptDismissed");
      setBlocked(Notification.permission === "denied");
      setVisible(Notification.permission !== "granted" && dismissed !== "true");
    };

    checkPermission();
    window.addEventListener("authChanged", checkPermission);
    window.addEventListener("storage", checkPermission);

    return () => {
      window.removeEventListener("authChanged", checkPermission);
      window.removeEventListener("storage", checkPermission);
    };
  }, []);

  const handleEnable = async () => {
    const permission = await requestNotificationPermission();
    setBlocked(permission === "denied");
    setVisible(permission !== "granted");
  };

  const handleLater = () => {
    localStorage.setItem("notificationPromptDismissed", "true");
    setVisible(false);
  };

  return (
    <Collapse in={visible}>
      <Paper
        elevation={12}
        sx={{
          position: "fixed",
          left: { xs: 12, sm: "auto" },
          right: 12,
          bottom: { xs: 86, sm: 18 },
          zIndex: 1600,
          width: { xs: "calc(100% - 24px)", sm: 390 },
          borderRadius: 2,
          border: "1px solid rgba(45,0,82,0.14)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, bgcolor: "#fff" }}>
          <Box display="flex" gap={1.5} alignItems="flex-start">
            <NotificationsActiveIcon sx={{ color: "#2d0052", mt: 0.3 }} />
            <Box flex={1}>
              <Typography fontWeight={900} color="#2d0052">
                Enable message alerts
              </Typography>
              <Typography fontSize={13} color="#6b4679" mt={0.4}>
                Turn on browser notifications so new unread messages can pop up
                whenever your phone data is on and this browser can receive them.
              </Typography>
            </Box>
          </Box>

          {blocked && (
            <Alert severity="warning" sx={{ mt: 1.5 }}>
              Notifications are blocked in this browser. Open site settings and
              allow notifications for this website.
            </Alert>
          )}

          <Box display="flex" gap={1} justifyContent="flex-end" mt={2}>
            <Button onClick={handleLater} sx={{ color: "#6b4679" }}>
              Later
            </Button>
            <Button
              variant="contained"
              onClick={handleEnable}
              sx={{
                bgcolor: "#2d0052",
                fontWeight: 900,
                "&:hover": { bgcolor: "#4b087c" },
              }}
            >
              Enable
            </Button>
          </Box>
        </Box>
      </Paper>
    </Collapse>
  );
};

export default NotificationEnablePrompt;
