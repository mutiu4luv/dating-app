import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Skeleton,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/Chat";
import PeopleIcon from "@mui/icons-material/People";
import CallIcon from "@mui/icons-material/Call";
import CallMissedIcon from "@mui/icons-material/CallMissed";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import api from "../../components/api/Api";
import Navbar from "../../components/Navbar/Navbar";
import {
  getIdValue,
  requestNotificationPermission,
} from "../../utility/notifications";

const conversationCacheKey = (userId) => `chatConversations_${userId}`;
const chatDirectoryCacheKey = (userId) => `chatDirectoryAllUsers_${userId}_v2`;
const conversationTimeoutMs = 6500;
const membersTimeoutMs = 6500;
const membersBatchSize = 35;
const socketUrl =
  import.meta.env.VITE_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:7000";

const getLastSeenDate = (lastSeen) => {
  if (!lastSeen) return null;
  const rawDate =
    typeof lastSeen === "string"
      ? lastSeen
      : lastSeen.date || lastSeen.exact || lastSeen.value || null;
  if (!rawDate) return null;
  const parsedDate = new Date(rawDate);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getActivityLabel = (item) => {
  if (item?.isOnline) return "Online now";

  const lastSeenDate = getLastSeenDate(item?.lastSeen);
  if (!lastSeenDate) return "Not active recently";

  const elapsedHours = (Date.now() - lastSeenDate.getTime()) / (1000 * 60 * 60);
  const elapsedDays = elapsedHours / 24;
  if (elapsedHours <= 48) return "Recently online";
  if (elapsedDays <= 14) return "Active this week";
  return "Not active recently";
};

const getActivityChipSx = (item) =>
  item?.isOnline
    ? {
        bgcolor: "#dcfce7",
        color: "#166534",
      }
    : {
        bgcolor: "#f3f4f6",
        color: "#6b7280",
      };

const MessagesScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [members, setMembers] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingCallLogs, setLoadingCallLogs] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [tab, setTab] = useState("conversations");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleMembersCount, setVisibleMembersCount] =
    useState(membersBatchSize);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const loadCallLogs = useCallback(async () => {
    if (!token) return;
    setLoadingCallLogs(true);
    try {
      const res = await api.get("/calls/logs", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 12000,
      });
      setCallLogs(res.data?.logs || []);
    } catch (err) {
      console.error("Failed to load call logs:", err);
    } finally {
      setLoadingCallLogs(false);
    }
  }, [token]);

  useEffect(() => {
    if (!userId || !token) return;

    const headers = { Authorization: `Bearer ${token}` };
    let cancelled = false;
    const cached = sessionStorage.getItem(conversationCacheKey(userId));

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          setLoadingConversations(false);
        }
      } catch {
        sessionStorage.removeItem(conversationCacheKey(userId));
      }
    }

    const fetchConversations = async () => {
      try {
        const conversationRes = await api.get(`/chat/conversations/${userId}`, {
          headers,
          timeout: 12000,
        });
        const rows = Array.isArray(conversationRes.data)
          ? conversationRes.data
          : [];

        if (!cancelled) {
          setConversations(rows);
          if (rows.length > 0) {
            sessionStorage.setItem(
              conversationCacheKey(userId),
              JSON.stringify(rows)
            );
          }
          setLoadingConversations(false);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        if (!cancelled) setLoadingConversations(false);
      }
    };

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setLoadingConversations(false);
    }, conversationTimeoutMs);

    fetchConversations();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [userId, token]);

  const loadAllUsers = useCallback(async () => {
    if (!userId || !token) return;
    const headers = { Authorization: `Bearer ${token}` };

    setLoadingMembers(true);
    setMembersError("");

    try {
      const allUsersRes = await api.get("/user/", {
        headers,
        timeout: 12000,
      });
      let rows = (Array.isArray(allUsersRes.data) ? allUsersRes.data : [])
        .filter((member) => member._id !== userId)
        .map((member) => ({
          _id: member._id,
          photo: member.photo,
          name: member.name,
          username: member.username,
          age: member.age,
          gender: member.gender,
          location: member.location,
          occupation: member.occupation,
          relationshipType: member.relationshipType,
          description: member.description,
          isOnline: member.isOnline,
          lastSeen: member.lastSeen,
        }));

      if (rows.length === 0) {
        const fallbackRes = await api.get("/user/chat-directory", {
          headers,
          timeout: 12000,
        });
        rows = fallbackRes.data.members || [];
      }

      const sortedRows = [...rows].sort((a, b) => {
        if (Boolean(a.isOnline) !== Boolean(b.isOnline)) {
          return a.isOnline ? -1 : 1;
        }
        return (
          new Date(b.lastSeen || 0).getTime() -
          new Date(a.lastSeen || 0).getTime()
        );
      });

      setMembers(sortedRows);
      setVisibleMembersCount(membersBatchSize);
      if (rows.length > 0) {
        sessionStorage.setItem(
          chatDirectoryCacheKey(userId),
          JSON.stringify(sortedRows)
        );
      } else {
        setMembersError("No users were returned from the server.");
      }
    } catch (err) {
      console.error("Failed to load all users:", err);
      setMembersError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load all users."
      );
    } finally {
      setLoadingMembers(false);
    }
  }, [token, userId]);

  useEffect(() => {
    if (!userId || !token || members.length > 0) return;

    const cached = sessionStorage.getItem(chatDirectoryCacheKey(userId));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
          setVisibleMembersCount(membersBatchSize);
          setLoadingMembers(false);
          return;
        }
      } catch {
        sessionStorage.removeItem(chatDirectoryCacheKey(userId));
      }
    }

    const timeoutId = window.setTimeout(() => {
      setLoadingMembers(false);
    }, membersTimeoutMs);

    loadAllUsers().finally(() => window.clearTimeout(timeoutId));

    return () => window.clearTimeout(timeoutId);
  }, [loadAllUsers, members.length, token, userId]);

  useEffect(() => {
    if (!userId) return;

    const socket = io(socketUrl, { transports: ["websocket", "polling"] });

    socket.emit("register_user", userId);

    const handlePresenceUpdate = ({ userId: changedUserId, isOnline, lastSeen }) => {
      setMembers((prev) =>
        prev
          .map((member) =>
            member._id === changedUserId
              ? { ...member, isOnline, lastSeen }
              : member
          )
          .sort((a, b) => {
            if (Boolean(a.isOnline) !== Boolean(b.isOnline)) {
              return a.isOnline ? -1 : 1;
            }
            return (
              new Date(b.lastSeen || 0).getTime() -
              new Date(a.lastSeen || 0).getTime()
            );
          })
      );
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.matchId === changedUserId
            ? { ...conversation, isOnline, lastSeen }
            : conversation
        )
      );
    };

    const handleReceiveMessage = (data) => {
      const receiverId = getIdValue(data.receiverId);
      const senderId = getIdValue(data.senderId);

      if (receiverId === userId) {
        setConversations((prev) => {
          const timestamp = data.createdAt || new Date().toISOString();
          const updated = prev.map((conversation) =>
            conversation.matchId === senderId
              ? {
                  ...conversation,
                  lastMessage: data.content || "Photo",
                  timestamp,
                  unreadCount: (conversation.unreadCount || 0) + 1,
                  unread: true,
                }
              : conversation
          );

          const exists = updated.some(
            (conversation) => conversation.matchId === senderId
          );
          const next = exists
            ? updated
            : [
                {
                  matchId: senderId,
                  username:
                    data.senderId?.username || data.senderId?.name || "New chat",
                  photo: data.senderId?.photo || "",
                  isOnline: true,
                  lastMessage: data.content || "Photo",
                  timestamp,
                  unreadCount: 1,
                  unread: true,
                },
                ...updated,
              ];

          sessionStorage.setItem(
            conversationCacheKey(userId),
            JSON.stringify(next)
          );
          return next.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
        });
        setLoadingConversations(false);
      }
    };

    const askForNotifications = () => {
      requestNotificationPermission();
    };

    socket.on("presence_update", handlePresenceUpdate);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("voice_call_offer", loadCallLogs);
    socket.on("voice_call_log_updated", loadCallLogs);
    socket.on("voice_call_missed", loadCallLogs);
    socket.on("voice_call_ended", loadCallLogs);
    socket.on("voice_call_rejected", loadCallLogs);
    socket.on("voice_call_unavailable", loadCallLogs);
    window.addEventListener("click", askForNotifications, { once: true });
    window.addEventListener("touchstart", askForNotifications, { once: true });

    return () => {
      socket.off("presence_update", handlePresenceUpdate);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("voice_call_offer", loadCallLogs);
      socket.off("voice_call_log_updated", loadCallLogs);
      socket.off("voice_call_missed", loadCallLogs);
      socket.off("voice_call_ended", loadCallLogs);
      socket.off("voice_call_rejected", loadCallLogs);
      socket.off("voice_call_unavailable", loadCallLogs);
      window.removeEventListener("click", askForNotifications);
      window.removeEventListener("touchstart", askForNotifications);
      socket.disconnect();
    };
  }, [loadCallLogs, userId]);

  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return members;

    return members.filter((member) =>
      [
        member.name,
        member.username,
        member.location,
        member.occupation,
        member.relationshipType,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [members, searchTerm]);

  const visibleMembers = useMemo(
    () => filteredMembers.slice(0, visibleMembersCount),
    [filteredMembers, visibleMembersCount]
  );

  useEffect(() => {
    setVisibleMembersCount(membersBatchSize);
  }, [searchTerm]);

  const handleChatOpen = (member) => {
    const memberId = typeof member === "string" ? member : member?._id || member?.matchId;
    navigate(`/chat/${userId}/${memberId}`, {
      state: {
        member: typeof member === "string" ? null : member,
      },
    });
  };

  const formatCallTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCallDuration = (seconds = 0) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getCallPartner = (log) => {
    const callerId = getIdValue(log.callerId);
    return callerId === userId ? log.receiverId : log.callerId;
  };

  const getCallLabel = (log) => {
    const callerId = getIdValue(log.callerId);
    const isOutgoing = callerId === userId;

    if (log.status === "missed") {
      return isOutgoing ? "No answer" : "Missed voice call";
    }
    if (log.status === "declined") {
      return isOutgoing ? "Call declined" : "You declined this call";
    }
    if (log.status === "ringing") return isOutgoing ? "Ringing" : "Incoming call";
    return `${isOutgoing ? "Outgoing" : "Incoming"} voice call${
      log.durationSeconds ? ` - ${formatCallDuration(log.durationSeconds)}` : ""
    }`;
  };

  const renderAvatar = (name, photo, isOnline = false) => (
    <Badge
      color={isOnline ? "success" : "default"}
      variant="dot"
      overlap="circular"
      invisible={!isOnline}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Avatar
        src={photo || ""}
        imgProps={{ loading: "lazy" }}
        sx={{
          bgcolor: "#D9A4F0",
          color: "#2d0052",
          fontWeight: 800,
        }}
      >
        {name?.[0]?.toUpperCase()}
      </Avatar>
    </Badge>
  );

  const renderMessageSkeletons = () => (
    <List disablePadding>
      {Array.from({ length: 6 }).map((_, index) => (
        <ListItem key={index} sx={{ py: 1.4 }}>
          <ListItemAvatar>
            <Skeleton variant="circular" width={44} height={44} />
          </ListItemAvatar>
          <ListItemText
            primary={<Skeleton width={index % 2 ? "46%" : "62%"} />}
            secondary={<Skeleton width={index % 2 ? "70%" : "84%"} />}
          />
        </ListItem>
      ))}
    </List>
  );

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #fdf2f8 0%, #ffffff 42%, #f3e8ff 100%)",
          py: { xs: 3, sm: 5 },
          px: 2,
        }}
      >
        <Box maxWidth="md" mx="auto">
          <Box mb={3}>
            <Typography variant="h4" fontWeight={900} color="#2d0052">
              Chat
            </Typography>
            <Typography color="#6b4679" mt={0.5}>
              Continue conversations or start a new chat with any member.
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(45, 0, 82, 0.1)",
              overflow: "hidden",
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, value) => {
                setTab(value);
                if (value === "members" && members.length === 0) {
                  loadAllUsers();
                }
                if (value === "calls" && callLogs.length === 0) {
                  loadCallLogs();
                }
              }}
              variant="fullWidth"
              sx={{
                bgcolor: "#fff",
                borderBottom: "1px solid rgba(45, 0, 82, 0.1)",
                "& .MuiTab-root": {
                  color: "#6b4679",
                  fontWeight: 800,
                  textTransform: "none",
                },
                "& .Mui-selected": { color: "#2d0052" },
                "& .MuiTabs-indicator": { bgcolor: "#D9A4F0", height: 3 },
              }}
            >
              <Tab
                value="conversations"
                icon={<ChatIcon />}
                iconPosition="start"
                label="Conversations"
              />
              <Tab
                value="members"
                icon={<PeopleIcon />}
                iconPosition="start"
                label="All Users"
              />
              <Tab
                value="calls"
                icon={<CallIcon />}
                iconPosition="start"
                label="Calls"
              />
            </Tabs>

            {tab === "conversations" ? (
              <Box sx={{ bgcolor: "#fff", p: { xs: 1, sm: 2 } }}>
                {loadingConversations && conversations.length === 0 ? (
                  renderMessageSkeletons()
                ) : conversations.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <Typography color="#6b4679">
                      No conversations loaded yet. Open All Users to start a
                      chat, or refresh this page if you already have messages.
                    </Typography>
                    <Button
                      onClick={() => window.location.reload()}
                      sx={{
                        mt: 1.5,
                        color: "#2d0052",
                        fontWeight: 900,
                        textTransform: "none",
                      }}
                    >
                      Refresh chats
                    </Button>
                  </Box>
                ) : (
                  <List disablePadding>
                    {conversations.map((chat) => {
                      const unreadCount = chat.unreadCount ?? 0;
                      const isUnread = chat.unread === true;

                      return (
                        <ListItemButton
                          key={chat.matchId}
                          onClick={() =>
                            handleChatOpen({
                              _id: chat.matchId,
                              username: chat.name,
                              name: chat.name,
                              photo: chat.photo,
                              isOnline: chat.isOnline,
                              lastSeen: chat.lastSeen,
                            })
                          }
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            py: 1.5,
                            backgroundColor: isUnread ? "#fdf2f8" : "#fff",
                            "&:hover": { backgroundColor: "#fce7f3" },
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              badgeContent={unreadCount}
                              color="error"
                              invisible={!isUnread}
                              overlap="circular"
                            >
                              <Avatar
                                src={chat.photo || ""}
                                sx={{
                                  bgcolor: "#D9A4F0",
                                  color: "#2d0052",
                                  fontWeight: 800,
                                }}
                              >
                                {chat.username?.[0]?.toUpperCase()}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography fontWeight={isUnread ? 800 : 700}>
                                  {chat.username}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: chat.isOnline ? "#166534" : "#6b7280",
                                    fontWeight: 800,
                                  }}
                                >
                                  {getActivityLabel(chat)}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                                noWrap
                                fontWeight={isUnread ? 700 : 400}
                                color={isUnread ? "#2d0052" : "#6b4679"}
                              >
                                {chat.lastMessage || "Say hi..."}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                )}
              </Box>
            ) : tab === "members" ? (
              <Box sx={{ bgcolor: "#fff", p: { xs: 1.5, sm: 2 } }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by name, location, occupation, or relationship type"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      bgcolor: "#fdf2f8",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#6b4679" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {loadingMembers ? (
                  renderMessageSkeletons()
                ) : membersError ? (
                  <Box textAlign="center" py={6}>
                    <Typography color="#6b4679">{membersError}</Typography>
                    <Button
                      onClick={loadAllUsers}
                      sx={{
                        mt: 1.5,
                        color: "#2d0052",
                        fontWeight: 900,
                        textTransform: "none",
                      }}
                    >
                      Retry all users
                    </Button>
                  </Box>
                ) : filteredMembers.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <Typography color="#6b4679">
                      No users match your search.
                    </Typography>
                  </Box>
                ) : (
                  <>
                  <List disablePadding>
                    {visibleMembers.map((member) => (
                      <ListItemButton
                        key={member._id}
                        onClick={() => handleChatOpen(member)}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          py: 1.5,
                          "&:hover": { backgroundColor: "#fce7f3" },
                        }}
                      >
                        <ListItemAvatar>
                          {renderAvatar(
                            member.username || member.name,
                            member.photo,
                            member.isOnline
                          )}
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                              flexWrap="wrap"
                            >
                              <Typography fontWeight={800} color="#2d0052">
                                {member.username || member.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  ...getActivityChipSx(member),
                                  px: 1,
                                  borderRadius: 99,
                                  fontWeight: 800,
                                }}
                              >
                                {getActivityLabel(member)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="#6b4679" noWrap>
                              {[member.location, member.occupation]
                                .filter(Boolean)
                                .join(" - ") || "Start a conversation"}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                  {visibleMembers.length < filteredMembers.length && (
                    <Box display="flex" justifyContent="center" py={2}>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          setVisibleMembersCount((count) =>
                            Math.min(count + membersBatchSize, filteredMembers.length)
                          )
                        }
                        sx={{
                          borderColor: "#2d0052",
                          color: "#2d0052",
                          fontWeight: 900,
                          borderRadius: 2,
                          textTransform: "none",
                        }}
                      >
                        Load more users ({filteredMembers.length - visibleMembers.length} left)
                      </Button>
                    </Box>
                  )}
                  </>
                )}
              </Box>
            ) : (
              <Box sx={{ bgcolor: "#fff", p: { xs: 1, sm: 2 } }}>
                {loadingCallLogs && callLogs.length === 0 ? (
                  renderMessageSkeletons()
                ) : callLogs.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <Typography color="#6b4679">
                      No voice call history yet.
                    </Typography>
                    <Button
                      onClick={loadCallLogs}
                      sx={{
                        mt: 1.5,
                        color: "#2d0052",
                        fontWeight: 900,
                        textTransform: "none",
                      }}
                    >
                      Refresh call logs
                    </Button>
                  </Box>
                ) : (
                  <List disablePadding>
                    {callLogs.map((log) => {
                      const partner = getCallPartner(log) || {};
                      const missed = log.status === "missed";

                      return (
                        <ListItemButton
                          key={log._id}
                          onClick={() =>
                            handleChatOpen({
                              _id: getIdValue(partner),
                              username: partner.username || partner.name,
                              name: partner.name,
                              photo: partner.photo,
                            })
                          }
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            py: 1.5,
                            "&:hover": { backgroundColor: "#fce7f3" },
                          }}
                        >
                          <ListItemAvatar>
                            {renderAvatar(
                              partner.username || partner.name,
                              partner.photo,
                              false
                            )}
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography fontWeight={900} color="#2d0052">
                                  {partner.username || partner.name || "Member"}
                                </Typography>
                                {missed ? (
                                  <CallMissedIcon
                                    fontSize="small"
                                    sx={{ color: "#dc2626" }}
                                  />
                                ) : (
                                  <CallIcon
                                    fontSize="small"
                                    sx={{ color: "#16a34a" }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                                color={missed ? "#dc2626" : "#6b4679"}
                                noWrap
                              >
                                {getCallLabel(log)} - {formatCallTime(log.createdAt)}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default MessagesScreen;
