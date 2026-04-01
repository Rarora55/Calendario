import { DEFAULT_LANGUAGE } from "@/src/features/shared/types";
import { getMessages, resolveAppLanguage } from "@/src/i18n/messages";
import { useAppStore } from "@/src/state/store";

export function useAppTranslation() {
  const languagePreference = useAppStore((state) => state.preferences?.language ?? DEFAULT_LANGUAGE);
  const language = resolveAppLanguage(languagePreference);
  const copy = getMessages(language);

  return {
    copy,
    language,
    locale: copy.localeTag,
  };
}
