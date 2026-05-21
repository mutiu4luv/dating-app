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
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import {
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon,
  Chat as ChatIcon,
  Dashboard as DashboardIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  Home as HomeIcon,
  PeopleAlt as PeopleAltIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Subscriptions as SubscriptionsIcon,
  TrendingUp as TrendingUpIcon,
  WorkspacePremium as PremiumIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
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

const monthValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const safeIncludes = (value, query) =>
  String(value || "")
    .toLowerCase()
    .includes(query.toLowerCase());

const isReallyOnline = (user) => {
  if (!user?.isOnline || !user?.lastSeen) return false;
  const lastSeenTime = new Date(user.lastSeen).getTime();
  if (Number.isNaN(lastSeenTime)) return false;
  return Date.now() - lastSeenTime < 2 * 60 * 1000;
};

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
  const navigate = useNavigate();
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
  const [selectedMonth, setSelectedMonth] = useState("all");
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
  }, [selectedTab, searchQuery, selectedMonth]);

  const monthOptions = useMemo(() => {
    const options = new Map();
    [...users, ...subscribers].forEach((item) => {
      const sourceDate =
        item.createdAt || item.updatedAt || item.subscriptionExpiresAt;
      const value = monthValue(sourceDate);
      if (value) options.set(value, monthKey(sourceDate));
    });

    return Array.from(options.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => b.value.localeCompare(a.value));
  }, [users, subscribers]);

  const monitoredUsers = useMemo(() => {
    if (selectedMonth === "all") return users;
    return users.filter((user) => monthValue(user.createdAt) === selectedMonth);
  }, [users, selectedMonth]);

  const monitoredSubscribers = useMemo(() => {
    if (selectedMonth === "all") return subscribers;
    return subscribers.filter((sub) => {
      const sourceDate = sub.createdAt || sub.updatedAt || sub.subscriptionExpiresAt;
      return monthValue(sourceDate) === selectedMonth;
    });
  }, [subscribers, selectedMonth]);

  const activeUsers = users.filter(isReallyOnline).length;
  const adminUsers = users.filter((user) => user.isAdmin).length;
  const activeSubscribers = subscribers.filter(
    (sub) => sub.subscriptionActive
  ).length;
  const expiredSubscribers = subscribers.filter(
    (sub) => sub.subscriptionStatus === "Expired"
  ).length;

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

  const monthlyActivity = useMemo(() => {
    const monthMap = new Map();

    users.forEach((user) => {
      const key = monthKey(user.createdAt);
      const current = monthMap.get(key) || {
        label: key,
        users: 0,
        subscribers: 0,
        online: 0,
      };
      current.users += 1;
      if (isReallyOnline(user)) current.online += 1;
      monthMap.set(key, current);
    });

    subscribers.forEach((sub) => {
      const key = monthKey(sub.createdAt || sub.updatedAt);
      const current = monthMap.get(key) || {
        label: key,
        users: 0,
        subscribers: 0,
        online: 0,
      };
      current.subscribers += 1;
      monthMap.set(key, current);
    });

    return Array.from(monthMap.values()).slice(-6);
  }, [users, subscribers]);

  const maxMonthlyCount = Math.max(
    1,
    ...monthlySubscribers.map((item) => item.count)
  );
  const maxActivityCount = Math.max(
    1,
    ...monthlyActivity.flatMap((item) => [
      item.users,
      item.subscribers,
      item.online,
    ])
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
    (sub) => {
      const sourceDate =
        sub.createdAt || sub.updatedAt || sub.subscriptionExpiresAt;
      const matchesMonth =
        selectedMonth === "all" || monthValue(sourceDate) === selectedMonth;
      const matchesSearch =
        safeIncludes(sub.name, searchQuery) ||
        safeIncludes(sub.username, searchQuery) ||
        safeIncludes(sub.email, searchQuery) ||
        safeIncludes(sub.phoneNumber, searchQuery) ||
        safeIncludes(sub.location, searchQuery) ||
        safeIncludes(sub.occupation, searchQuery) ||
        safeIncludes(sub.relationshipType, searchQuery) ||
        safeIncludes(sub.subscriptionTier, searchQuery);

      return matchesMonth && matchesSearch;
    }
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

  const navItems = [
    {
      value: "overview",
      label: "All Users",
      helper: `${users.length} accounts`,
      icon: <PeopleAltIcon />,
    },
    {
      value: "subscribers",
      label: "Subscriptions",
      helper: `${subscribers.length} paid before`,
      icon: <SubscriptionsIcon />,
    },
  ];

  const renderSidebar = () => (
    <Paper
      elevation={0}
      sx={{
        width: { xs: "100%", md: 248 },
        flexShrink: 0,
        borderRadius: 2,
        border: "1px solid rgba(45,0,82,0.08)",
        bgcolor: "#fff",
        p: 1.5,
        position: { md: "sticky" },
        top: { md: 24 },
        alignSelf: { md: "flex-start" },
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1.2} alignItems="center" px={1} py={1}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "#f3e8ff",
              color: "#2d0052",
            }}
          >
            <DashboardIcon />
          </Box>
          <Box>
            <Typography fontWeight={950} color="#2d0052">
              Admin Panel
            </Typography>
            <Typography fontSize={12} color="#6b4679">
              Monitor activity
            </Typography>
          </Box>
        </Stack>

        {navItems.map((item) => {
          const active = selectedTab === item.value;
          return (
            <Button
              key={item.value}
              fullWidth
              onClick={() => setSelectedTab(item.value)}
              startIcon={item.icon}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                borderRadius: 1.5,
                px: 1.4,
                py: 1.2,
                bgcolor: active ? "#2d0052" : "transparent",
                color: active ? "#fff" : "#2d0052",
                "&:hover": {
                  bgcolor: active ? "#2d0052" : "#f8f3fb",
                },
              }}
            >
              <Box textAlign="left">
                <Typography fontWeight={900} fontSize={14}>
                  {item.label}
                </Typography>
                <Typography
                  fontSize={11}
                  sx={{ color: active ? "rgba(255,255,255,0.72)" : "#7c6f86" }}
                >
                  {item.helper}
                </Typography>
              </Box>
            </Button>
          );
        })}

        <Box sx={{ borderTop: "1px solid #eadcf0", mt: 1, pt: 1.5 }}>
          <Typography
            px={1}
            mb={1}
            fontSize={12}
            fontWeight={900}
            color="#6b4679"
            textTransform="uppercase"
          >
            Quick View
          </Typography>
          <Stack direction={{ xs: "row", md: "column" }} spacing={1}>
            <Chip
              icon={<ChatIcon />}
              label={`${activeUsers} online now`}
              sx={{
                justifyContent: "flex-start",
                bgcolor: "#dcfce7",
                color: "#166534",
                fontWeight: 900,
              }}
            />
            <Chip
              icon={<BarChartIcon />}
              label={`${activeSubscribers} active plans`}
              sx={{
                justifyContent: "flex-start",
                bgcolor: "#f3e8ff",
                color: "#2d0052",
                fontWeight: 900,
              }}
            />
          </Stack>
        </Box>
      </Stack>
    </Paper>
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
            <TableCell>Subscription</TableCell>
            <TableCell>Expires</TableCell>
            <TableCell>Online</TableCell>
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
              <TableCell>
                <Chip
                  size="small"
                  label={sub.subscriptionStatus || "Paid before"}
                  sx={{
                    bgcolor: sub.subscriptionActive ? "#dcfce7" : "#fee2e2",
                    color: sub.subscriptionActive ? "#166534" : "#991b1b",
                    fontWeight: 800,
                  }}
                />
              </TableCell>
              <TableCell>{formatDate(sub.subscriptionExpiresAt)}</TableCell>
              <TableCell>{renderStatusChip(isReallyOnline(sub))}</TableCell>
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
              <TableCell>{renderStatusChip(isReallyOnline(user))}</TableCell>
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
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <FormControl size="small" sx={{ minWidth: { xs: 160, sm: 190 } }}>
            <InputLabel>Monitor Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Monitor Month"
              onChange={(event) => setSelectedMonth(event.target.value)}
              sx={{ bgcolor: "#fff", borderRadius: 2 }}
            >
              <MenuItem value="all">All months</MenuItem>
              {monthOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              borderColor: "#2d0052",
              color: "#2d0052",
              fontWeight: 900,
              borderRadius: 2,
            }}
          >
            Back
          </Button>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
            sx={{
              borderColor: "#2d0052",
              color: "#2d0052",
              fontWeight: 900,
              borderRadius: 2,
            }}
          >
            Landing
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
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
      </Stack>

      {loading ? (
        <Box minHeight="60vh" display="grid" sx={{ placeItems: "center" }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
          {renderSidebar()}

          <Box sx={{ minWidth: 0, flex: 1 }}>
          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                label="Total Users"
                value={users.length}
                helper={`${activeUsers} truly online now`}
                accent="#f3e8ff"
                icon={<GroupIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                label="All-Time Subscribers"
                value={subscribers.length}
                helper={`${activeSubscribers} active, ${expiredSubscribers} expired`}
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
                value={`${
                  users.length
                    ? Math.round((subscribers.length / users.length) * 100)
                    : 0
                }%`}
                helper="Ever paid vs total users"
                accent="#dcfce7"
                icon={<TrendingUpIcon />}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12} sm={4}>
              <StatCard
                label="Selected Month Users"
                value={monitoredUsers.length}
                helper={
                  selectedMonth === "all"
                    ? "Across every month"
                    : "New accounts in selected month"
                }
                accent="#dbeafe"
                icon={<GroupIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                label="Selected Month Paid"
                value={monitoredSubscribers.length}
                helper="People who paid in selected month"
                accent="#f3e8ff"
                icon={<PremiumIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                label="Selected Month Online"
                value={monitoredUsers.filter(isReallyOnline).length}
                helper="Online now from users created in that month"
                accent="#dcfce7"
                icon={<ChatIcon />}
              />
            </Grid>
          </Grid>

          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              mb: 3,
              border: "1px solid rgba(45,0,82,0.08)",
            }}
          >
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={1}
                mb={2}
              >
                <Box>
                  <Typography fontWeight={950} fontSize={19}>
                    Monthly Activity
                  </Typography>
                  <Typography color="#6b4679" fontSize={13}>
                    Compares new accounts, people who paid, and users currently online.
                    Online is grouped by the month each user registered.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip size="small" label="New Accounts" sx={{ bgcolor: "#dbeafe" }} />
                  <Chip
                    size="small"
                    label="Paid Users"
                    sx={{ bgcolor: "#f3e8ff" }}
                  />
                  <Chip size="small" label="Online Now" sx={{ bgcolor: "#dcfce7" }} />
                </Stack>
              </Stack>
              <Box
                sx={{
                  height: { xs: 300, md: 260 },
                  display: "flex",
                  alignItems: "end",
                  gap: { xs: 1, sm: 2 },
                  overflowX: "auto",
                  pb: 1,
                  borderBottom: "1px solid #eadcf0",
                }}
              >
                {monthlyActivity.length === 0 ? (
                  <Box
                    width="100%"
                    height="100%"
                    display="grid"
                    sx={{ placeItems: "center" }}
                  >
                    <Typography color="#6b4679">No activity yet.</Typography>
                  </Box>
                ) : (
                  monthlyActivity.map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        minWidth: { xs: 86, sm: 110 },
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "end",
                        height: "100%",
                      }}
                    >
                      <Stack direction="row" alignItems="end" spacing={0.8} sx={{ height: 205 }}>
                        {[
                          { key: "users", label: "Users", color: "#60a5fa" },
                          { key: "subscribers", label: "Paid", color: "#D9A4F0" },
                          { key: "online", label: "Online", color: "#22c55e" },
                        ].map((bar) => (
                          <Box
                            key={bar.key}
                            title={`${bar.label}: ${item[bar.key]}`}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "end",
                              gap: 0.4,
                            }}
                          >
                            <Typography fontSize={11} fontWeight={900} color="#2d0052">
                              {item[bar.key]}
                            </Typography>
                            <Box
                              sx={{
                                width: { xs: 14, sm: 18 },
                                height: `${Math.max(
                                  item[bar.key] ? 10 : 3,
                                  (item[bar.key] / maxActivityCount) * 165
                                )}px`,
                                bgcolor: bar.color,
                                borderRadius: "6px 6px 0 0",
                              }}
                            />
                          </Box>
                        ))}
                      </Stack>
                      <Typography mt={1} fontWeight={900} color="#2d0052" fontSize={13}>
                        {item.users} users / {item.subscribers} paid
                      </Typography>
                      <Typography color="#6b4679" fontSize={12} textAlign="center">
                        {item.label}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>

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
                        Subscribers By Month
                      </Typography>
                      <Typography color="#6b4679" fontSize={13}>
                        People who have paid at least once, grouped by month.
                      </Typography>
                    </Box>
                    <Chip
                      label={`${subscribers.length} all-time`}
                      sx={{
                        bgcolor: "#f3e8ff",
                        color: "#2d0052",
                        fontWeight: 900,
                      }}
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
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  bgcolor: "#f8f3fb",
                  borderRadius: 2,
                  p: 0.5,
                }}
              >
                {navItems.map((item) => (
                  <Button
                    key={item.value}
                    onClick={() => setSelectedTab(item.value)}
                    variant={selectedTab === item.value ? "contained" : "text"}
                    sx={{
                      textTransform: "none",
                      borderRadius: 1.5,
                      fontWeight: 900,
                      bgcolor:
                        selectedTab === item.value ? "#2d0052" : "transparent",
                      color: selectedTab === item.value ? "#fff" : "#6b4679",
                      "&:hover": {
                        bgcolor:
                          selectedTab === item.value ? "#2d0052" : "#fff",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>

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
          </Box>
        </Stack>
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
