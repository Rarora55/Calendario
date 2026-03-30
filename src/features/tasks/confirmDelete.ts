import { Alert, Platform } from "react-native";

type ConfirmDeleteOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
};

export async function confirmDeleteAction({
  title,
  message,
  confirmLabel = "Delete",
}: ConfirmDeleteOptions) {
  if (Platform.OS === "web" && typeof window !== "undefined" && typeof window.confirm === "function") {
    return window.confirm(`${title}\n\n${message}`);
  }

  return new Promise<boolean>((resolve) => {
    let settled = false;

    const resolveOnce = (value: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      resolve(value);
    };

    Alert.alert(
      title,
      message,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolveOnce(false),
        },
        {
          text: confirmLabel,
          style: "destructive",
          onPress: () => resolveOnce(true),
        },
      ],
      {
        cancelable: true,
        onDismiss: () => resolveOnce(false),
      },
    );
  });
}
