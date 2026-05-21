self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const data = event.notification.data || {};
      const targetUrl =
        data.senderId && data.receiverId
          ? `/chat/${data.receiverId}/${data.senderId}`
          : "/";
      const client = clients.find((item) => "focus" in item);
      if (client) return client.focus();
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      return undefined;
    })
  );
});
