import { computed, onMounted, shallowRef, watch } from "vue";
import {
  LocalNotifications,
  type LocalNotificationSchema,
} from "@capacitor/local-notifications";

type LocalNotificationArgs = {
  title: string;
  body: string;
  id: number;
};
export const useLocalNotifications = () => {
  const permissionState = shallowRef("");
  onMounted(async () => {
    await LocalNotifications.checkPermissions().then((e) => {
      permissionState.value = e.display;
    });
  });

  const scheduleMyNotification = async (args: LocalNotificationArgs) => {
    const now = new Date();
    const notificationTime = new Date(now.getTime() + 1000 * 10); // Schedule 10 seconds from now

    await LocalNotifications.schedule({
      notifications: [
        {
          title: args.title,
          body: args.body,
          id: args.id,
          
        },
      ],
    });
  };

  watch(permissionState, async (state) => {
    if (state !== "granted") {
      await LocalNotifications.requestPermissions().then((e) => {
        console.log("requestPermissions", e);
      });
    }
  });

  return { permissionState, scheduleMyNotification };
};
