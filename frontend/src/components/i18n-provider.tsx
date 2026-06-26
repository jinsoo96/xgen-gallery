"use client";

import { createContext, useContext, useState, useCallback } from "react";
import {
    type Locale,
    type Dict,
    getDict,
    LOCALE_COOKIE,
    DEFAULT_LOCALE,
} from "@/lib/i18n";

interface I18nValue {
    locale: Locale;
    t: Dict;
    setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
    initialLocale,
    children,
}: {
    initialLocale: Locale;
    children: React.ReactNode;
}) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale);

    const setLocale = useCallback((l: Locale) => {
        setLocaleState(l);
        // Persist for SSR on subsequent visits (1 year).
        document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = l;
    }, []);

    return (
        <I18nContext.Provider value={{ locale, t: getDict(locale), setLocale }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n(): I18nValue {
    const ctx = useContext(I18nContext);
    if (!ctx) {
        // Safe fallback (default locale) if used outside the provider.
        return {
            locale: DEFAULT_LOCALE,
            t: getDict(DEFAULT_LOCALE),
            setLocale: () => {},
        };
    }
    return ctx;
}
