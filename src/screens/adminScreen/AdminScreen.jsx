import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import api from "../../components/api/Api";

const tiers = ["Free", "Basic", "Standard", "Premium"];
const menuItems = [
  { key: "users", label: "Get All Users" },
  // { key: "tier", label: "Update Subscription Tier" },
  { key: "subscribers", label: "Get All Subscribers" },
];

const AdminScreen = () => {
  const [users, setUsers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState("users");
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTier, setEditTier] = useState("");
  const [editHasPaid, setEditHasPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    setLoading(true);
    if (selectedMenu === "users" || selectedMenu === "tier") {
      api
        .get(`${BASE_URL}/api/user/`)
        .then((res) => setUsers(res.data))
        .catch((err) => console.error("Fetch users failed:", err))
        .finally(() => setLoading(false));
    }
    if (selectedMenu === "subscribers") {
      api
        .get(`${BASE_URL}/api/subscribers`)
        .then((res) => setSubscribers(res.data))
        .catch((err) => console.error("Fetch subscribers failed:", err))
        .finally(() => setLoading(false));
    }
  }, [selectedMenu]);

  const handleDelete = async () => {
    if (!deleteUserId) return;
    await api.delete(`${BASE_URL}/api/user/${deleteUserId}`);
    setUsers((prev) => prev.filter((u) => u._id !== deleteUserId));
    setShowDeleteModal(false);
    setDeleteUserId(null);
    if (selectedUser && selectedUser._id === deleteUserId)
      setSelectedUser(null);
  };

  const openDeleteModal = (userId) => {
    setDeleteUserId(userId);
    setShowDeleteModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditTier(user.tier || user.subscriptionTier || "Free");
    setEditHasPaid(user.hasPaid || false);
    setEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      const updated = {
        tier: editTier,
        hasPaid: editHasPaid,
      };
      await api.put(`${BASE_URL}/api/user/${selectedUser._id}`, updated);
      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUser._id ? { ...u, ...updated } : u))
      );
      setSubscribers((prev) =>
        prev.map((u) => (u._id === selectedUser._id ? { ...u, ...updated } : u))
      );
      setEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f7f7fa" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 220,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 220,
            boxSizing: "border-box",
            background: "#232946",
            color: "#fff",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" fontWeight="bold" color="#fff" mb={2}>
            Admin Panel
          </Typography>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.key} disablePadding>
              <ListItemButton
                selected={selectedMenu === item.key}
                onClick={() => setSelectedMenu(item.key)}
                sx={{
                  "&.Mui-selected": {
                    background: "#d9a4f0",
                    color: "#232946",
                  },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="bold" mb={3} color="#232946">
          {menuItems.find((m) => m.key === selectedMenu)?.label}
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : selectedMenu === "users" || selectedMenu === "tier" ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>Has Paid</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber || "-"}</TableCell>
                    <TableCell>{user.age || "-"}</TableCell>
                    <TableCell>{user.location || "-"}</TableCell>
                    <TableCell>
                      {user.subscriptionTier || user.tier || "-"}
                    </TableCell>
                    <TableCell>{user.hasPaid ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => openEditModal(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => openDeleteModal(user._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>Has Paid</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscribers.map((sub) => (
                  <TableRow key={sub._id} hover>
                    <TableCell>{sub.name}</TableCell>
                    <TableCell>{sub.email}</TableCell>
                    <TableCell>{sub.phoneNumber || "-"}</TableCell>
                    <TableCell>{sub.age || "-"}</TableCell>
                    <TableCell>{sub.location || "-"}</TableCell>
                    <TableCell>
                      {sub.subscriptionTier || sub.tier || "-"}
                    </TableCell>
                    <TableCell>{sub.hasPaid ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Dialogs for Edit and Delete remain unchanged */}
        {/* ... You can keep the previous Dialog JSX for editing and deleting here ... */}
      </Box>
    </Box>
  );
};

export default AdminScreen;
