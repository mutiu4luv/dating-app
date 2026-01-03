// import React, { useEffect, useState } from "react";
// import {
//   List,
//   ListItem,
//   ListItemText,
//   ListItemAvatar,
//   Avatar,
//   Typography,
//   CircularProgress,
//   Badge,
//   Box,
//   Paper,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import api from "../../components/api/Api";
// import Navbar from "../../components/Navbar/Navbar";

// const MessagesScreen = () => {
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();
//   const userId = localStorage.getItem("userId");
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchConversations = async () => {
//       try {
//         const res = await api.get(`/chat/conversations/${userId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setConversations(res.data);
//       } catch (err) {
//         console.error("❌ Failed to load conversations:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const markAllAsRead = async () => {
//       try {
//         await api.put(
//           `/chat/read/${userId}`,
//           {},
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         // ✅ Notify Navbar to update unread count using custom event
//         window.dispatchEvent(new CustomEvent("unreadReset"));
//       } catch (err) {
//         console.error("❌ Failed to mark messages as read:", err);
//       }
//     };

//     if (userId && token) {
//       fetchConversations();
//       markAllAsRead();
//     }
//   }, [userId, token]);

//   const handleClick = (matchId) => {
//     navigate(`/chat/${userId}/${matchId}`);
//   };

//   if (loading) {
//     return (
//       <Box textAlign="center" mt={8}>
//         <CircularProgress color="secondary" />
//         <Typography mt={2} color="textSecondary">
//           Loading conversations...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <>
//       <Navbar />
//       <Box maxWidth="sm" mx="auto" mt={4} px={2}>
//         <Typography
//           variant="h5"
//           fontWeight="bold"
//           gutterBottom
//           sx={{ color: "#db2777" }}
//         >
//           Conversations
//         </Typography>

//         {conversations.length === 0 ? (
//           <Typography color="textSecondary" mt={4} textAlign="center">
//             You don’t have any messages yet.
//           </Typography>
//         ) : (
//           <Paper elevation={2} sx={{ borderRadius: 3, p: 1 }}>
//             <List>
//               {conversations.map((chat) => (
//                 <ListItem
//                   key={chat.matchId}
//                   button
//                   onClick={() => handleClick(chat.matchId)}
//                   sx={{
//                     borderRadius: 2,
//                     mb: 1,
//                     py: 2,
//                     px: 2,
//                     transition: "0.3s",
//                     backgroundColor: chat.unread ? "#fdf2f8" : "#fff",
//                     "&:hover": {
//                       backgroundColor: "#fce7f3",
//                     },
//                   }}
//                 >
//                   <ListItemAvatar>
//                     <Badge
//                       variant="dot"
//                       color="error"
//                       invisible={!chat.unread}
//                       overlap="circular"
//                     >
//                       <Avatar
//                         sx={{
//                           bgcolor: "#ec4899",
//                           color: "white",
//                           fontWeight: "bold",
//                         }}
//                       >
//                         {chat.username?.[0]?.toUpperCase()}
//                       </Avatar>
//                     </Badge>
//                   </ListItemAvatar>
//                   <ListItemText
//                     primary={
//                       <Typography
//                         fontWeight={chat.unread ? 700 : 500}
//                         fontSize="1rem"
//                       >
//                         {chat.username}
//                       </Typography>
//                     }
//                     secondary={
//                       <Typography variant="body2" color="textSecondary" noWrap>
//                         {chat.lastMessage || "Say hi..."}
//                       </Typography>
//                     }
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           </Paper>
//         )}
//       </Box>
//     </>
//   );
// };

// export default MessagesScreen;
import { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  CircularProgress,
  Badge,
  Box,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../components/api/Api";
import Navbar from "../../components/Navbar/Navbar";

const MessagesScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) return;

    const fetchConversations = async () => {
      try {
        const res = await api.get(`/chat/conversations/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(res.data);
      } catch (err) {
        console.error("❌ Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId, token]);

  const handleClick = (matchId) => {
    navigate(`/chat/${userId}/${matchId}`);
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress color="secondary" />
        <Typography mt={2} color="textSecondary">
          Loading conversations...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Box maxWidth="sm" mx="auto" mt={4} px={2}>
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "#db2777" }}
        >
          Conversations
        </Typography>

        {conversations.length === 0 ? (
          <Typography color="textSecondary" mt={4} textAlign="center">
            You don’t have any messages yet.
          </Typography>
        ) : (
          <Paper elevation={2} sx={{ borderRadius: 3, p: 1 }}>
            <List>
              {conversations.map((chat) => {
                // const unreadCount = chat.unreadCount || 0;
                // const isUnread = unreadCount > 0;
                const unreadCount = chat.unreadCount ?? 0;
                const isUnread = chat.unread === true;

                return (
                  <ListItem
                    key={chat.matchId}
                    button
                    onClick={() => handleClick(chat.matchId)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      py: 2,
                      px: 2,
                      backgroundColor: isUnread ? "#fdf2f8" : "#fff",
                      "&:hover": {
                        backgroundColor: "#fce7f3",
                      },
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
                          sx={{
                            bgcolor: "#ec4899",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          {chat.username?.[0]?.toUpperCase()}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Typography
                          fontWeight={isUnread ? 700 : 500}
                          fontSize="1rem"
                        >
                          {chat.username}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          noWrap
                          fontWeight={isUnread ? 600 : 400}
                          color={isUnread ? "textPrimary" : "textSecondary"}
                        >
                          {chat.lastMessage || "Say hi..."}
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        )}
      </Box>
    </>
  );
};

export default MessagesScreen;
