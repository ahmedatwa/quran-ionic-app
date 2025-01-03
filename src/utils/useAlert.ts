import {
  toastController,
  alertController,
  loadingController,
} from "@ionic/vue";
import { properCase } from "@/utils/string";

type ToastParams = {
  message: string;
  position?: "top" | "middle" | "bottom";
  duration?: number;
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
};

type AlertParams = {
  header?: string;
  message: string;
  buttons?:
    | string[]
    | {
        text: string;
        role?: string;
        handler?: () => void;
      }[];
  id?: string;
  subHeader?: string;
};

export const useAlert = () => {
  const presentToast = async (event: ToastParams) => {
    const toast = await toastController.create({
      message: event.message,
      duration: event.duration || 2500,
      position: event.position || "top",
      color: event.color || "danger",
    });

    await toast.present();
  };

  const presentAlert = async (args: AlertParams) => {
    const alert = await alertController.create({
      header: args.header ? properCase(args.header) : "",
      subHeader: args.subHeader,
      message: args.message,
      id: args.id || "alert",
      buttons: args.buttons || ["Ok"],
    });

    await alert.present();
  };

  const presentLoading = async (
    dismiss?: boolean,
    message: string = "Loading please wait...",
    duration: number = 0,
    id?: "loading-spinner"
  ) => {
    const loading = await loadingController.create({
      id,
      message,
      duration,
    });

    dismiss ? await loadingController.dismiss() : await loading.present();
  };

  return { presentToast, presentAlert, presentLoading };
};
