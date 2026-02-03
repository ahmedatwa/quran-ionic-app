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

const loadingDismiss = shallowRef({
  id: "",
  isActive: false,
});

const alertDismissState = shallowRef(false);
const toastDismissState = shallowRef(false);
const loadingControllerInstance = shallowRef<HTMLIonLoadingElement>();
const alertcontrollerInstance = shallowRef<HTMLIonAlertElement>();

const loadingArgs = shallowRef<{
  isActive: boolean;
  options?: LoadingOptions;
} | null>(null);

export const useAlert = () => {
  const { getLine } = useLocale();

  /**
   *
   * @param args ToastOptions
   * @return void
   */
  const presentToast = async (args: ToastOptions) => {
    toastDismissState.value = false;
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
      toastDismissState.value = true;
    }
  };
  /**
   *
   * @param args AlertOptions
   * @return void
   */
  const presentAlert = async (args: AlertOptions) => {
    alertDismissState.value = false;
    if (args.inputs) {
      alertcontrollerInstance.value = await alertController.create({
        header: args.header ? properCase(args.header) : "",
        subHeader: args.subHeader,
        message: args.message,
        id: args.id,
        inputs: args.inputs,
        buttons: args.buttons || ["Ok"],
        htmlAttributes: {
          "aria-label": `alert-${args.id}`,
        },
      });
    } else {
      alertcontrollerInstance.value = await alertController.create({
        header: args.header ? properCase(args.header) : "",
        subHeader: args.subHeader,
        message: args.message,
        id: args.id,
        buttons: args.buttons || ["Ok"],
        htmlAttributes: {
          "aria-label": `alert-${args.id}`,
        },
      });
    }

    const [_presented, state] = await Promise.all([
      alertcontrollerInstance.value.present(),
      alertcontrollerInstance.value.onDidDismiss(),
    ]);

    if (state.role === "timeout") {
      alertDismissState.value = true;
    }
  };

  /**
   *
   * @param LoadingOptions
   * @return void
   */

  const presentLoading = async (options: LoadingOptions) => {
    loadingDismiss.value.isActive = false;
    loadingControllerInstance.value = await loadingController.create({
      id: options.id,
      message: options.message || getLine("text.loading"),
      duration: options.duration,
      showBackdrop: true,
      htmlAttributes: {
        "aria-label": `loading-${options.id}`,
      },
    });

    await loadingControllerInstance.value.present();
    loadingArgs.value = {
      isActive: true,
      options: { ...options },
    };
   // const { data, role } = await loadingControllerInstance.value.onWillDismiss();
     
   // console.log(test);
    
  };

  /**
   * dismiss loading manually
   */
  const dismissLoading = async (id: string) => {
    if (loadingControllerInstance.value) {
      await loadingControllerInstance.value?.dismiss();
      loadingArgs.value = null;
    }
    // double check if element still in DOM
    const el = document.querySelector(`#${id}`);
    if (el) {
      el.remove();
      loadingArgs.value = null;
    }
  };

  return {
    presentToast,
    presentAlert,
    presentLoading,
    loadingArgs,
    loadingDismiss,
    dismissLoading,
  };
};
