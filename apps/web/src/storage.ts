import type { Debt, StrategyKey } from "./calculator";

export interface YetiStorageState {
  version: 2;
  saveLocally: boolean;
  debts: Debt[];
  extraPayment: number;
  currentStrategyKey: StrategyKey;
}

export const STORAGE_KEY_V2 = "yeti.v2.data";
export const STORAGE_KEY_CURRENCY = "yeti.currency";
export const LEGACY_SAVE_KEY = "yeti.save";
export const LEGACY_DEBTS_KEY = "yeti.debts";

export function loadSavedCurrency(): string | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY_CURRENCY);
  } catch {
    return null;
  }
}

export function saveSelectedCurrency(currency: string | null): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    if (currency) {
      window.localStorage.setItem(STORAGE_KEY_CURRENCY, currency);
    } else {
      window.localStorage.removeItem(STORAGE_KEY_CURRENCY);
    }
  } catch (err) {
    console.error("Error saving Yeti selected currency to localStorage:", err);
  }
}

export interface LegacyDebtItem {
  borrowed?: number;
  rate?: number;
  minimumPayment?: number;
  name?: string;
  uid?: string;
  id?: string;
  balance?: number;
  interestRate?: number;
}

/**
 * Loads stored state from local storage.
 * Seamlessly checks for existing v2 state, or auto-migrates legacy Yeti data (yeti.save / yeti.debts).
 */
export function loadStoredState(): {
  saveLocally: boolean;
  debts?: Debt[];
  extraPayment?: number;
  currentStrategyKey?: StrategyKey;
} | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    // 1. Check for current v2 storage
    const v2Raw = window.localStorage.getItem(STORAGE_KEY_V2);
    if (v2Raw) {
      const parsed = JSON.parse(v2Raw) as YetiStorageState;
      if (parsed && typeof parsed === "object") {
        return {
          saveLocally: Boolean(parsed.saveLocally),
          debts: Array.isArray(parsed.debts) ? parsed.debts : undefined,
          extraPayment: typeof parsed.extraPayment === "number" ? parsed.extraPayment : undefined,
          currentStrategyKey: parsed.currentStrategyKey || undefined,
        };
      }
    }

    // 2. Check for legacy Yeti storage
    const legacySave = window.localStorage.getItem(LEGACY_SAVE_KEY);
    if (legacySave === "true") {
      const legacyDebtsRaw = window.localStorage.getItem(LEGACY_DEBTS_KEY);
      if (legacyDebtsRaw) {
        const legacyItems = JSON.parse(legacyDebtsRaw) as LegacyDebtItem[];
        if (Array.isArray(legacyItems) && legacyItems.length > 0) {
          const migratedDebts: Debt[] = legacyItems.map((item, idx) => ({
            id: item.uid || item.id || `legacy-${idx + 1}-${Date.now()}`,
            name: item.name || `Debt ${idx + 1}`,
            balance: Number(item.borrowed ?? item.balance ?? 0),
            interestRate: Number(item.rate ?? item.interestRate ?? 0),
            minimumPayment: Number(item.minimumPayment ?? 0),
          }));

          const migratedState: YetiStorageState = {
            version: 2,
            saveLocally: true,
            debts: migratedDebts,
            extraPayment: 300,
            currentStrategyKey: "lowestBalance",
          };

          // Save migrated state to new storage key
          window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migratedState));

          return {
            saveLocally: true,
            debts: migratedDebts,
            extraPayment: 300,
            currentStrategyKey: "lowestBalance",
          };
        }
      }

      // User had opted into saving, but no debts were stored yet
      return {
        saveLocally: true,
      };
    }
  } catch (err) {
    console.error("Error loading or migrating Yeti stored state:", err);
  }

  return null;
}

/**
 * Persists the current state to local storage if saveLocally is true.
 * If saveLocally is false, removes the stored data.
 */
export function saveStoredState(state: {
  saveLocally: boolean;
  debts: Debt[];
  extraPayment: number;
  currentStrategyKey: StrategyKey;
}): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    if (state.saveLocally) {
      const v2State: YetiStorageState = {
        version: 2,
        saveLocally: true,
        debts: state.debts,
        extraPayment: state.extraPayment,
        currentStrategyKey: state.currentStrategyKey,
      };
      window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(v2State));
    } else {
      window.localStorage.removeItem(STORAGE_KEY_V2);
      window.localStorage.removeItem(LEGACY_SAVE_KEY);
      window.localStorage.removeItem(LEGACY_DEBTS_KEY);
    }
  } catch (err) {
    console.error("Error saving Yeti state to localStorage:", err);
  }
}

/**
 * Clears all Yeti state from local storage.
 */
export function clearStoredState(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY_V2);
    window.localStorage.removeItem(LEGACY_SAVE_KEY);
    window.localStorage.removeItem(LEGACY_DEBTS_KEY);
  } catch (err) {
    console.error("Error clearing Yeti localStorage:", err);
  }
}
