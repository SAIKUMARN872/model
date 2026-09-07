export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export class PushNotificationService {
  private notifications: PushNotification[] = [];

  public send(
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): PushNotification {
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

    const notification: PushNotification = {
      id: this.generateId(),
      title,
      message,
      timestamp:
        new Date().toISOString(),
      data,
    };

    this.notifications.push(
      notification
    );

    return notification;
  }

  public getAll(): PushNotification[] {
    return [...this.notifications];
  }

  public getById(
    id: string
  ): PushNotification | undefined {
    return this.notifications.find(
      (notification) =>
        notification.id === id
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

  public count(): number {
    return this.notifications.length;
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

const pushNotification =
  new PushNotificationService();

export default pushNotification;