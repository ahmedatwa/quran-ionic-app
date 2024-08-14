import { toastController } from "@ionic/vue";

type ToastParams = {
  message: string;
  position?: "top" | "middle" | "bottom";
  duration?: number;
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
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

  return { presentToast };
};
