import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import {
  Chat as ChatIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  WorkspacePremium as PremiumIcon,
} from "@mui/icons-material";
import api from "../../components/api/Api";

const tiers = ["Free", "Basic", "Standard", "Premium"];
const rowsPerPage = 12;

const Alert = React.forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

const monthKey = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
  });

const safeIncludes = (value, query) =>
  String(value || "")
    .toLowerCase()
    .includes(query.toLowerCase());

const StatCard = ({ label, value, icon, accent, helper }) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      borderRadius: 2,
      border: "1px solid rgba(45,0,82,0.09)",
      bgcolor: "#fff",
    }}
  >
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            color: "#2d0052",
            bgcolor: accent,
          }}
        >
          {icon}
        </Box>
        <Box minWidth={0}>
          <Typography color="#6b4679" fontWeight={700} fontSize={13}>
            {label}
          </Typography>
          <Typography color="#2d0052" fontWeight={900} fontSize={28}>
            {value}
          </Typography>
          {helper && (
            <Typography color="#7c6f86" fontSize={12}>
              {helper}
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const AdminScreen = () => {
  const [users, setUsers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTier, setEditTier] = useState("");
  const [editHasPaid, setEditHasPaid] = useState(false);
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const isMobile = useMediaQuery("(max-width:768px)");
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const authHeaders = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }),
    []
  );

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, subscribersRes] = await Promise.all([
        api.get(`${BASE_URL}/api/user/`, authHeaders),
        api.get(`${BASE_URL}/api/subscription`, authHeaders),
      ]);

      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setSubscribers(subscribersRes.data?.data || []);
    } catch (err) {
      console.error("Admin fetch failed:", err);
      setToast({
        open: true,
        message: "Failed to load admin dashboard",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedTab, searchQuery]);

  const activeUsers = users.filter((user) => user.isOnline).length;
  const adminUsers = users.filter((user) => user.isAdmin).length;

  const tierCounts = useMemo(() => {
    return subscribers.reduce(
      (acc, sub) => {
        const tier = sub.subscriptionTier || "Free";
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      },
      { Basic: 0, Standard: 0, Premium: 0 }
    );
  }, [subscribers]);

  const monthlySubscribers = useMemo(() => {
    const monthMap = new Map();
    subscribers.forEach((sub) => {
      const key = monthKey(sub.createdAt || sub.subscriptionExpiresAt);
      monthMap.set(key, (monthMap.get(key) || 0) + 1);
    });

    return Array.from(monthMap.entries())
      .map(([label, count]) => ({ label, count }))
      .slice(-6);
  }, [subscribers]);

  const maxMonthlyCount = Math.max(
    1,
    ...monthlySubscribers.map((item) => item.count)
  );

  const filteredUsers = users.filter(
    (user) =>
      safeIncludes(user.name, searchQuery) ||
      safeIncludes(user.username, searchQuery) ||
      safeIncludes(user.email, searchQuery) ||
      safeIncludes(user.phoneNumber, searchQuery) ||
      safeIncludes(user.location, searchQuery)
  );

  const filteredSubscribers = subscribers.filter(
    (sub) =>
      safeIncludes(sub.name, searchQuery) ||
      safeIncludes(sub.username, searchQuery) ||
      safeIncludes(sub.email, searchQuery) ||
      safeIncludes(sub.phoneNumber, searchQuery) ||
      safeIncludes(sub.location, searchQuery) ||
      safeIncludes(sub.occupation, searchQuery) ||
      safeIncludes(sub.relationshipType, searchQuery) ||
      safeIncludes(sub.subscriptionTier, searchQuery)
  );

  const activeRows =
    selectedTab === "subscribers" ? filteredSubscribers : filteredUsers;
  const paginatedRows = activeRows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditTier(user.tier || user.subscriptionTier || "Free");
    setEditHasPaid(Boolean(user.hasPaid));
    setEditIsAdmin(Boolean(user.isAdmin));
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

      await api.put(
        `${BASE_URL}/api/user/${selectedUser._id}`,
        updated,
        authHeaders
      );

      setUsers((prev) =>
        prev.map((user) =>
          user._id === selectedUser._id ? { ...user, ...updated } : user
        )
      );
      setSubscribers((prev) =>
        prev.map((user) =>
          user._id === selectedUser._id ? { ...user, ...updated } : user
        )
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

  const handleDelete = async () => {
    if (!deleteUserId) return;

    try {
      await api.delete(`${BASE_URL}/api/user/${deleteUserId}`, authHeaders);
      setUsers((prev) => prev.filter((user) => user._id !== deleteUserId));
      setSubscribers((prev) =>
        prev.filter((user) => user._id !== deleteUserId)
      );
      setDeleteUserId(null);
      setToast({
        open: true,
        message: "User deleted successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Delete failed:", err);
      setToast({ open: true, message: "Delete failed", severity: "error" });
    }
  };

  const renderStatusChip = (isOnline) => (
    <Chip
      size="small"
      label={isOnline ? "Online" : "Offline"}
      sx={{
        bgcolor: isOnline ? "#dcfce7" : "#f3f4f6",
        color: isOnline ? "#166534" : "#6b7280",
        fontWeight: 800,
      }}
    />
  );

  const renderSubscriberTable = () => (
    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
      <Table size={isMobile ? "small" : "medium"}>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f8f3fb" }}>
            <TableCell>Name</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Age</TableCell>
            <TableCell>Gender</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Occupation</TableCell>
            <TableCell>Relationship</TableCell>
            <TableCell>Tier</TableCell>
            <TableCell>Expires</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedRows.map((sub) => (
            <TableRow key={sub._id} hover>
              <TableCell>{sub.name || "-"}</TableCell>
              <TableCell>{sub.username || "-"}</TableCell>
              <TableCell>{sub.email || "-"}</TableCell>
              <TableCell>{sub.phoneNumber || "-"}</TableCell>
              <TableCell>{sub.age || "-"}</TableCell>
              <TableCell>{sub.gender || "-"}</TableCell>
              <TableCell>{sub.location || "-"}</TableCell>
              <TableCell>{sub.occupation || "-"}</TableCell>
              <TableCell>{sub.relationshipType || "-"}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={sub.subscriptionTier || "-"}
                  sx={{ bgcolor: "#f3e8ff", color: "#2d0052", fontWeight: 800 }}
                />
              </TableCell>
              <TableCell>{formatDate(sub.subscriptionExpiresAt)}</TableCell>
              <TableCell>{renderStatusChip(sub.isOnline)}</TableCell>
              <TableCell align="right">
                <IconButton color="primary" onClick={() => openEditModal(sub)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => setDeleteUserId(sub._id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderUsersTable = () => (
    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
      <Table size={isMobile ? "small" : "medium"}>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f8f3fb" }}>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Tier</TableCell>
            <TableCell>Admin</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedRows.map((user) => (
            <TableRow key={user._id} hover>
              <TableCell>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar src={user.photo || ""}>
                    {user.username?.[0]?.toUpperCase() || user.name?.[0]}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={800}>{user.name || "-"}</Typography>
                    <Typography variant="caption" color="#6b4679">
                      {user.username || "-"}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell>{user.email || "-"}</TableCell>
              <TableCell>{user.phoneNumber || "-"}</TableCell>
              <TableCell>{user.location || "-"}</TableCell>
              <TableCell>{user.subscriptionTier || "-"}</TableCell>
              <TableCell>{user.isAdmin ? "Yes" : "No"}</TableCell>
              <TableCell>{renderStatusChip(user.isOnline)}</TableCell>
              <TableCell align="right">
                <IconButton color="primary" onClick={() => openEditModal(user)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => setDeleteUserId(user._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f7f2fb",
        color: "#2d0052",
        px: { xs: 1.5, sm: 3, lg: 4 },
        py: { xs: 2, md: 4 },
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight={950}>
            Admin Dashboard
          </Typography>
          <Typography color="#6b4679">
            Monitor users, subscriptions, activity, and account access.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={fetchAdminData}
          sx={{
            bgcolor: "#D9A4F0",
            color: "#2d0052",
            fontWeight: 900,
            borderRadius: 2,
            "&:hover": { bgcolor: "#c886e7" },
          }}
        >
          Refresh
        </Button>
      </Stack>

      {loading ? (
        <Box minHeight="60vh" display="grid" sx={{ placeItems: "center" }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <>
          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                label="Total Users"
                value={users.length}
                helper={`${activeUsers} currently online`}
                accent="#f3e8ff"
                icon={<GroupIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                label="Active Subscribers"
                value={subscribers.length}
                helper="Paid and not expired"
                accent="#fdf2f8"
                icon={<PremiumIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                label="Admins"
                value={adminUsers}
                helper="Accounts with admin access"
                accent="#e0f2fe"
                icon={<PersonAddIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                label="Conversion"
                value={`${users.length ? Math.round((subscribers.length / users.length) * 100) : 0}%`}
                helper="Subscribers vs total users"
                accent="#dcfce7"
                icon={<TrendingUpIcon />}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12} lg={8}>
              <Card elevation={0} sx={{ borderRadius: 2, height: "100%" }}>
                <CardContent>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    spacing={1}
                    mb={2}
                  >
                    <Box>
                      <Typography fontWeight={900} fontSize={18}>
                        Monthly Subscribers
                      </Typography>
                      <Typography color="#6b4679" fontSize={13}>
                        Active subscribers grouped by signup month.
                      </Typography>
                    </Box>
                    <Chip
                      label={`${subscribers.length} active`}
                      sx={{ bgcolor: "#f3e8ff", color: "#2d0052", fontWeight: 900 }}
                    />
                  </Stack>
                  <Box
                    sx={{
                      height: 260,
                      display: "flex",
                      alignItems: "end",
                      gap: { xs: 1, sm: 2 },
                      borderBottom: "1px solid #e9d5ff",
                      pt: 2,
                    }}
                  >
                    {monthlySubscribers.length === 0 ? (
                      <Box
                        width="100%"
                        height="100%"
                        display="grid"
                        sx={{ placeItems: "center" }}
                      >
                        <Typography color="#6b4679">
                          No active subscribers yet.
                        </Typography>
                      </Box>
                    ) : (
                      monthlySubscribers.map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            flex: 1,
                            minWidth: 42,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "end",
                            height: "100%",
                          }}
                        >
                          <Typography fontWeight={900} color="#2d0052">
                            {item.count}
                          </Typography>
                          <Box
                            sx={{
                              width: "100%",
                              maxWidth: 58,
                              height: `${Math.max(
                                14,
                                (item.count / maxMonthlyCount) * 190
                              )}px`,
                              borderRadius: "8px 8px 0 0",
                              bgcolor: "#D9A4F0",
                            }}
                          />
                          <Typography
                            mt={1}
                            color="#6b4679"
                            fontSize={12}
                            textAlign="center"
                          >
                            {item.label}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card elevation={0} sx={{ borderRadius: 2, height: "100%" }}>
                <CardContent>
                  <Typography fontWeight={900} fontSize={18} mb={2}>
                    Subscription Tier Mix
                  </Typography>
                  {["Basic", "Standard", "Premium"].map((tier) => {
                    const count = tierCounts[tier] || 0;
                    const percent = subscribers.length
                      ? Math.round((count / subscribers.length) * 100)
                      : 0;
                    return (
                      <Box key={tier} mb={2.5}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography fontWeight={800}>{tier}</Typography>
                          <Typography color="#6b4679">
                            {count} ({percent}%)
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            height: 10,
                            bgcolor: "#f3e8ff",
                            borderRadius: 99,
                            overflow: "hidden",
                            mt: 0.8,
                          }}
                        >
                          <Box
                            sx={{
                              width: `${percent}%`,
                              height: "100%",
                              bgcolor: "#D9A4F0",
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box
              p={{ xs: 1.5, md: 2 }}
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              gap={2}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              sx={{ borderBottom: "1px solid #eadcf0" }}
            >
              <Tabs
                value={selectedTab}
                onChange={(_, value) => setSelectedTab(value)}
                variant={isMobile ? "fullWidth" : "standard"}
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 900,
                    color: "#6b4679",
                  },
                  "& .Mui-selected": { color: "#2d0052" },
                  "& .MuiTabs-indicator": { bgcolor: "#D9A4F0" },
                }}
              >
                <Tab value="overview" label="All Users" />
                <Tab value="subscribers" label="Subscribed Users" />
              </Tabs>

              <TextField
                size="small"
                placeholder="Search name, email, phone, location..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                sx={{ minWidth: { xs: "100%", md: 360 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ overflowX: "auto" }}>
              {selectedTab === "subscribers"
                ? renderSubscriberTable()
                : renderUsersTable()}
            </Box>

            <Box display="flex" justifyContent="center" p={2}>
              <Pagination
                count={Math.max(1, Math.ceil(activeRows.length / rowsPerPage))}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="secondary"
              />
            </Box>
          </Paper>
        </>
      )}

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tier</InputLabel>
            <Select
              value={editTier}
              label="Tier"
              onChange={(event) => setEditTier(event.target.value)}
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
                onChange={(event) => setEditHasPaid(event.target.checked)}
              />
            }
            label="Has Paid"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={editIsAdmin}
                onChange={(event) => setEditIsAdmin(event.target.checked)}
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

      <Dialog open={Boolean(deleteUserId)} onClose={() => setDeleteUserId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteUserId(null)}>Cancel</Button>
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
  );
};

export default AdminScreen;
