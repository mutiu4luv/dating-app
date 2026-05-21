export const getStoredIsAdmin = () => {
  const directValue = localStorage.getItem("isAdmin");

  if (directValue === "true" || directValue === true) return true;
  if (directValue === "false" || directValue === false) return false;

  try {
    const parsedValue = JSON.parse(directValue);
    if (typeof parsedValue === "boolean") return parsedValue;
  } catch {
    // Fall back to the stored user object below.
  }

  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    return storedUser?.isAdmin === true || storedUser?.isAdmin === "true";
  } catch {
    return false;
  }
};

export const storeAuthUser = ({ token, user }) => {
  const userId = user?._id;
  const isAdmin = user?.isAdmin === true || user?.isAdmin === "true";

  localStorage.setItem("token", token);
  localStorage.setItem("userId", userId || "");
  localStorage.setItem("username", user?.username || "");
  localStorage.setItem("email", user?.email || "");
  localStorage.setItem("hasPaid", JSON.stringify(Boolean(user?.hasPaid)));
  localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
  localStorage.setItem("user", JSON.stringify({ ...user, isAdmin }));

  if (userId) {
    localStorage.setItem(
      `hasPaid_${userId}`,
      JSON.stringify({
        status: Boolean(user?.hasPaid),
        paidAt: Date.now(),
      })
    );
  }

  return { userId, isAdmin };
};
