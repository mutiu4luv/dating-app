export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
};

export const showMessageNotification = async (message) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const body =
    message.content || (message.imageUrl ? "Sent you a photo" : "New message");

  const options = {
    body,
    tag: `message-${message.senderId}-${message._id || Date.now()}`,
    badge: "/vite.svg",
    icon: "/vite.svg",
    data: message,
  };

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready.catch(() => null);
    if (registration?.showNotification) {
      registration.showNotification("New message", options);
      return;
    }
  }

  new Notification("New message", options);
};
