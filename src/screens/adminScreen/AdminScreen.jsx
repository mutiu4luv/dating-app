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
  Checkbox,
  FormControlLabel,
  Snackbar,
  TextField,
  Pagination,
  useMediaQuery,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import api from "../../components/api/Api";

const tiers = ["Free", "Basic", "Standard", "Premium"];
const menuItems = [
  { key: "users", label: " Users" },
  { key: "subscribers", label: " Subscribers" },
];

const Alert = React.forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

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
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const isSmallScreen = useMediaQuery("(max-width:768px)");
  const rowsPerPage = isSmallScreen ? 20 : 50;

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  useEffect(() => {
    setLoading(true);
    if (selectedMenu === "users") {
      api
        .get(`${BASE_URL}/api/user/`)
        .then((res) => {
          setUsers(res.data);
          console.log("Fetched users:", res.data);
        })
        .catch((err) => console.error("Fetch users failed:", err))
        .finally(() => setLoading(false));
    }
    if (selectedMenu === "subscribers") {
      api
        .get(`${BASE_URL}/api/subscription`)
        .then((res) => setSubscribers(res.data.data))
        .catch((err) => console.error("Fetch subscribers failed:", err))
        .finally(() => setLoading(false));
    }
  }, [selectedMenu]);

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      await api.delete(`${BASE_URL}/api/user/${deleteUserId}`);
      setUsers((prev) => prev.filter((u) => u._id !== deleteUserId));
      setShowDeleteModal(false);
      setDeleteUserId(null);
      setToast({
        open: true,
        message: "User deleted successfully",
        severity: "success",
      });
    } catch (err) {
      setToast({ open: true, message: "Delete failed", severity: "error" });
    }
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
        subscriptionTier: editTier,
        hasPaid: editHasPaid,
        isAdmin: editIsAdmin,
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
      setToast({
        open: true,
        message: "User updated successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Update failed:", err);
      setToast({ open: true, message: "Update failed", severity: "error" });
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

        <TextField
          label="Search by name or email"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : selectedMenu === "users" ? (
          <>
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
                    <TableCell>IsAdmin</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.map((user) => (
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
                      <TableCell>{user.isAdmin ? "Yes" : "No"}</TableCell>
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
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={Math.ceil(filteredUsers.length / rowsPerPage)}
                page={page}
                onChange={(e, val) => setPage(val)}
                color="primary"
              />
            </Box>
          </>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {/* <TableCell>Name</TableCell> */}
                  <TableCell>Email</TableCell>
                  {/* <TableCell>Phone</TableCell> */}
                  {/* <TableCell>Age</TableCell> */}
                  {/* <TableCell>Location</TableCell> */}
                  <TableCell>Tier</TableCell>
                  <TableCell>Has Paid</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscribers.map((sub) => (
                  <TableRow key={sub._id} hover>
                    {/* <TableCell>{sub.name}</TableCell> */}
                    <TableCell>{sub.email}</TableCell>
                    {/* <TableCell>{sub.phoneNumber || "-"}</TableCell> */}
                    {/* <TableCell>{sub.age || "-"}</TableCell> */}
                    {/* <TableCell>{sub.location || "-"}</TableCell> */}
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

        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tier</InputLabel>
              <Select
                value={editTier}
                label="Tier"
                onChange={(e) => setEditTier(e.target.value)}
              >
                {tiers.map((tier) => (
                  <MenuItem key={tier} value={tier}>
                    {tier}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={editHasPaid}
                  onChange={(e) => setEditHasPaid(e.target.checked)}
                />
              }
              label="Has Paid"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={editIsAdmin}
                  onChange={(e) => setEditIsAdmin(e.target.checked)}
                />
              }
              label="Is Admin"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogActions>
            <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={() => setToast({ ...toast, open: false })}
        >
          <Alert severity={toast.severity}>{toast.message}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AdminScreen;
