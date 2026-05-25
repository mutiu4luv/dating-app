self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const data = event.notification.data || {};
      const senderId =
        (typeof data.senderId === "object" ? data.senderId?._id : data.senderId) ||
        data.fromUserId;
      const receiverId =
        (typeof data.receiverId === "object" ? data.receiverId?._id : data.receiverId) ||
        data.toUserId;
      const targetUrl =
        senderId && receiverId
          ? `/chat/${receiverId}/${senderId}`
          : "/";
      const client = clients.find((item) => "focus" in item);
      if (client) {
        if ("navigate" in client) {
          return client.navigate(targetUrl).then((item) => item.focus());
        }
        return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      return undefined;
    })
  );
});
