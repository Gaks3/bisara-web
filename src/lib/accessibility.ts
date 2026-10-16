/**
 * Accessibility Helper for Bisara
 * Handles Dyslexia-Friendly Font & High Contrast Mode persistence and DOM sync.
 */

export const DYSLEXIA_FONT_STORAGE_KEY = "bisara_dyslexia_font";
export const HIGH_CONTRAST_STORAGE_KEY = "bisara_high_contrast";
export const DAILY_REMINDER_STORAGE_KEY = "bisara_daily_reminder";

export interface AccessibilitySettings {
  dyslexiaFont: boolean;
  highContrast: boolean;
  dailyReminder: boolean;
}

/**
 * Safely retrieve current accessibility preferences from localStorage
 */
export function getStoredAccessibilityPreferences(): AccessibilitySettings {
  if (typeof window === "undefined") {
    return {
      dyslexiaFont: false,
      highContrast: false,
      dailyReminder: true,
    };
  }

  try {
    return {
      dyslexiaFont: localStorage.getItem(DYSLEXIA_FONT_STORAGE_KEY) === "true",
      highContrast: localStorage.getItem(HIGH_CONTRAST_STORAGE_KEY) === "true",
      dailyReminder: localStorage.getItem(DAILY_REMINDER_STORAGE_KEY) !== "false", // default true
    };
  } catch (err) {
    console.warn("Failed to read accessibility preferences from localStorage:", err);
    return {
      dyslexiaFont: false,
      highContrast: false,
      dailyReminder: true,
    };
  }
}

/**
 * Apply accessibility preferences to document.documentElement and persist to localStorage
 */
export function applyAccessibilityPreferences(prefs: {
  dyslexiaFont?: boolean;
  highContrast?: boolean;
  dailyReminder?: boolean;
}): void {
  if (typeof document === "undefined") return;

  try {
    if (prefs.dyslexiaFont !== undefined) {
      document.documentElement.classList.toggle("dyslexia-font", prefs.dyslexiaFont);
      localStorage.setItem(DYSLEXIA_FONT_STORAGE_KEY, String(prefs.dyslexiaFont));
    }

    if (prefs.highContrast !== undefined) {
      document.documentElement.classList.toggle("high-contrast", prefs.highContrast);
      localStorage.setItem(HIGH_CONTRAST_STORAGE_KEY, String(prefs.highContrast));
    }

    if (prefs.dailyReminder !== undefined) {
      localStorage.setItem(DAILY_REMINDER_STORAGE_KEY, String(prefs.dailyReminder));
    }
  } catch (err) {
    console.warn("Failed to persist accessibility preferences:", err);
  }
}

/**
 * Initializes accessibility settings immediately on client mount
 */
export function initAccessibility(): AccessibilitySettings {
  const prefs = getStoredAccessibilityPreferences();
  applyAccessibilityPreferences({
    dyslexiaFont: prefs.dyslexiaFont,
    highContrast: prefs.highContrast,
  });
  return prefs;
}
