import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/Chat";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import api from "../../components/api/Api";
import Navbar from "../../components/Navbar/Navbar";
import { requestNotificationPermission } from "../../utility/notifications";

const MessagesScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("conversations");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const fetchChatHub = async () => {
      try {
        const [conversationRes, membersRes] = await Promise.all([
          api.get(`/chat/conversations/${userId}`, { headers }),
          api.get("/user/chat-directory", { headers }),
        ]);

        setConversations(conversationRes.data || []);
        setMembers(membersRes.data.members || []);
      } catch (err) {
        console.error("Failed to load chat hub:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHub();
  }, [userId, token]);

  useEffect(() => {
    if (!userId) return;

    const socket = io(
      import.meta.env.VITE_BACKEND_URL ||
        import.meta.env.VITE_BASE_URL ||
        "http://localhost:7000",
      { transports: ["websocket"] }
    );

    socket.emit("register_user", userId);

    const handlePresenceUpdate = ({ userId: changedUserId, isOnline, lastSeen }) => {
      setMembers((prev) =>
        prev.map((member) =>
          member._id === changedUserId
            ? { ...member, isOnline, lastSeen }
            : member
        )
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
      if (data.receiverId === userId) {
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.matchId === data.senderId
              ? {
                  ...conversation,
                  lastMessage: data.content || "Photo",
                  timestamp: data.createdAt || new Date().toISOString(),
                  unreadCount: (conversation.unreadCount || 0) + 1,
                  unread: true,
                }
              : conversation
          )
        );
      }
    };

    const askForNotifications = () => {
      requestNotificationPermission();
    };

    socket.on("presence_update", handlePresenceUpdate);
    socket.on("receive_message", handleReceiveMessage);
    window.addEventListener("click", askForNotifications, { once: true });
    window.addEventListener("touchstart", askForNotifications, { once: true });

    return () => {
      socket.off("presence_update", handlePresenceUpdate);
      socket.off("receive_message", handleReceiveMessage);
      window.removeEventListener("click", askForNotifications);
      window.removeEventListener("touchstart", askForNotifications);
      socket.disconnect();
    };
  }, [userId]);

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

  const handleChatOpen = (memberId) => {
    navigate(`/chat/${userId}/${memberId}`);
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

  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress color="secondary" />
        <Typography mt={2} color="textSecondary">
          Loading chat...
        </Typography>
      </Box>
    );
  }

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
              onChange={(_, value) => setTab(value)}
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
            </Tabs>

            {tab === "conversations" ? (
              <Box sx={{ bgcolor: "#fff", p: { xs: 1, sm: 2 } }}>
                {conversations.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <Typography color="#6b4679">
                      No conversations yet. Open All Users to start chatting.
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {conversations.map((chat) => {
                      const unreadCount = chat.unreadCount ?? 0;
                      const isUnread = chat.unread === true;

                      return (
                        <ListItem
                          key={chat.matchId}
                          button
                          onClick={() => handleChatOpen(chat.matchId)}
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
                                  {chat.isOnline ? "Online" : "Offline"}
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
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Box>
            ) : (
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

                {filteredMembers.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <Typography color="#6b4679">
                      No users match your search.
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {filteredMembers.map((member) => (
                      <ListItem
                        key={member._id}
                        button
                        onClick={() => handleChatOpen(member._id)}
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
                              {member.isOnline && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    bgcolor: "#dcfce7",
                                    color: "#166534",
                                    px: 1,
                                    borderRadius: 99,
                                    fontWeight: 800,
                                  }}
                                >
                                  Online
                                </Typography>
                              )}
                              {!member.isOnline && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    bgcolor: "#f3f4f6",
                                    color: "#6b7280",
                                    px: 1,
                                    borderRadius: 99,
                                    fontWeight: 800,
                                  }}
                                >
                                  Offline
                                </Typography>
                              )}
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
                      </ListItem>
                    ))}
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
