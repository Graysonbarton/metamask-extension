import type { I18NMessageDict } from '../../shared/modules/i18n';
import {
  FALLBACK_LOCALE,
  fetchLocale,
  getMessage,
} from '../../shared/modules/i18n';
import enTranslations from '../_locales/en/messages.json';

let currentLocale: string = FALLBACK_LOCALE;
let translations: I18NMessageDict = enTranslations;

export async function updateCurrentLocale(locale: string): Promise<void> {
  if (currentLocale === locale) {
    return;
  }

  if (locale === FALLBACK_LOCALE) {
    translations = enTranslations;
  } else {
    translations = await fetchLocale(locale);
  }

  currentLocale = locale;
}

export function t(key: string, ...substitutions: string[]): string | null {
  return (
    // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    getMessage(currentLocale, translations, key, substitutions) ||
    getMessage(FALLBACK_LOCALE, enTranslations, key, substitutions)
  );
}
