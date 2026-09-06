export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export class NotificationService {
  private notifications: Notification[] = [];

  public create(
    title: string,
    message: string,
    type: Notification["type"] = "info"
  ): Notification {
    if (!title.trim()) {
      throw new Error(
        "Notification title is required."
      );
    }

    if (!message.trim()) {
      throw new Error(
        "Notification message is required."
      );
    }

    const notification: Notification = {
      id: this.generateId(),
      title,
      message,
      type,
      read: false,
      createdAt:
        new Date().toISOString(),
    };

    this.notifications.push(
      notification
    );

    return notification;
  }

  public getAll(): Notification[] {
    return [...this.notifications];
  }

  public getUnread(): Notification[] {
    return this.notifications.filter(
      (notification) =>
        !notification.read
    );
  }

  public markAsRead(
    id: string
  ): boolean {
    const notification =
      this.notifications.find(
        (item) => item.id === id
      );

    if (!notification) {
      return false;
    }

    notification.read = true;

    return true;
  }

  public markAllAsRead(): void {
    this.notifications.forEach(
      (notification) => {
        notification.read = true;
      }
    );
  }

  public remove(
    id: string
  ): boolean {
    const index =
      this.notifications.findIndex(
        (notification) =>
          notification.id === id
      );

    if (index === -1) {
      return false;
    }

    this.notifications.splice(
      index,
      1
    );

    return true;
  }

  public clear(): void {
    this.notifications = [];
  }

  public unreadCount(): number {
    return this.notifications.filter(
      (notification) =>
        !notification.read
    ).length;
  }

  private generateId(): string {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2, 10)
    );
  }
}

const notificationService =
  new NotificationService();

export default notificationService;