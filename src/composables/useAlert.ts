import { shallowRef } from "vue";
// ionic
import { toastController, alertController } from "@ionic/vue";
import { loadingController } from "@ionic/vue";
// utils
import { properCase } from "@/utils/string";
// composables
import { useLocale } from "@/composables/useLocale";
// type
import type { ToastOptions, AlertOptions, LoadingOptions } from "@ionic/vue";

export const useAlert = () => {
  const { getLine } = useLocale();
  const didDismissState = shallowRef({
    loading: false,
    alert: false,
    toast: false,
  });

  /**
   *
   * @param args ToastOptions
   * @return void
   */
  const presentToast = async (args: ToastOptions) => {
    didDismissState.value.toast = false;
    const toast = await toastController.create({
      message: args.message,
      id: args.id,
      duration: args.duration || 2500,
      position: args.position || "top",
      positionAnchor: args.positionAnchor,
      color: args.color || "danger",
      animated: true,
      htmlAttributes: {
        "aria-label": `toast-${args.id}`,
      },
      buttons: args.buttons,
    });

    const [_presented, state] = await Promise.all([
      toast.present(),
      toast.onDidDismiss(),
    ]);

    if (state.role === "timeout") {
      didDismissState.value.toast = true;
    }
  };
  /**
   *
   * @param args AlertOptions
   * @return void
   */
  const presentAlert = async (args: AlertOptions) => {
    didDismissState.value.alert = false;
    const alert = await alertController.create({
      header: args.header ? properCase(args.header) : "",
      subHeader: args.subHeader,
      message: args.message,
      id: args.id,
      buttons: args.buttons || ["Ok"],
      htmlAttributes: {
        "aria-label": `alert-${args.id}`,
      },
    });

    const [_presented, state] = await Promise.all([
      alert.present(),
      alert.onDidDismiss(),
    ]);

    if (state.role === "timeout") {
      didDismissState.value.alert = true;
    }
  };

  /**
   *
   * @param dismiss
   * @param LoadingOptions
   * @return void
   */
  const presentLoading = async (dismiss: boolean, args: LoadingOptions) => {
    didDismissState.value.loading = false;
    if (dismiss) {
      await loadingController.dismiss();
      didDismissState.value.loading = true;
    } else {
      const loading = await loadingController.create({
        id: args.id,
        message: args.message || getLine("text.loading"),
        duration: args.duration,
        showBackdrop: true,
        htmlAttributes: { "aria-label": `loading-${args.id}` },
      });

      const [_presented, state] = await Promise.all([
        loading.present(),
        loading.onDidDismiss(),
      ]);

      if (state.role === "timeout") {
        didDismissState.value.loading = true;
      }
    }
  };

  return { presentToast, presentAlert, presentLoading, didDismissState };
};
