import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadStoredState,
  saveStoredState,
  clearStoredState,
  STORAGE_KEY_V2,
  LEGACY_SAVE_KEY,
  LEGACY_DEBTS_KEY,
} from "./storage";
import type { Debt } from "./calculator";

describe("Yeti Storage & Migration", () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    const mockLocalStorage = {
      getItem: (key: string) => mockStore[key] ?? null,
      setItem: (key: string, value: string) => {
        mockStore[key] = String(value);
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
    };

    (globalThis as any).window = {
      localStorage: mockLocalStorage,
    };

    vi.restoreAllMocks();
  });

  it("should return null when localStorage is empty", () => {
    const result = loadStoredState();
    expect(result).toBeNull();
  });

  it("should migrate legacy data when yeti.save is true and yeti.debts has items", () => {
    window.localStorage.setItem(LEGACY_SAVE_KEY, "true");
    window.localStorage.setItem(
      LEGACY_DEBTS_KEY,
      JSON.stringify([
        { borrowed: 5000, rate: 18.5, minimumPayment: 150 },
        { borrowed: 12000, rate: 6.2, minimumPayment: 220, name: "Auto Loan" },
      ]),
    );

    const loaded = loadStoredState();
    expect(loaded).not.toBeNull();
    expect(loaded?.saveLocally).toBe(true);
    expect(loaded?.debts).toHaveLength(2);
    expect(loaded?.debts?.[0]).toEqual({
      id: expect.any(String),
      name: "Debt 1",
      balance: 5000,
      interestRate: 18.5,
      minimumPayment: 150,
    });
    expect(loaded?.debts?.[1]).toEqual({
      id: expect.any(String),
      name: "Auto Loan",
      balance: 12000,
      interestRate: 6.2,
      minimumPayment: 220,
    });

    // Check that v2 state was written to localStorage
    const storedV2 = window.localStorage.getItem(STORAGE_KEY_V2);
    expect(storedV2).not.toBeNull();
    const parsedV2 = JSON.parse(storedV2!);
    expect(parsedV2.version).toBe(2);
    expect(parsedV2.debts).toHaveLength(2);
  });

  it("should load v2 state directly when available", () => {
    const mockDebts: Debt[] = [
      { id: "1", name: "Credit Card", balance: 3500, interestRate: 22, minimumPayment: 100 },
    ];
    window.localStorage.setItem(
      STORAGE_KEY_V2,
      JSON.stringify({
        version: 2,
        saveLocally: true,
        debts: mockDebts,
        extraPayment: 500,
        currentStrategyKey: "highestRate",
      }),
    );

    const loaded = loadStoredState();
    expect(loaded).toEqual({
      saveLocally: true,
      debts: mockDebts,
      extraPayment: 500,
      currentStrategyKey: "highestRate",
    });
  });

  it("should save state when saveLocally is true and clear when saveLocally is false", () => {
    const debts: Debt[] = [
      { id: "1", name: "Card", balance: 1000, interestRate: 10, minimumPayment: 50 },
    ];

    // Save with opt-in
    saveStoredState({
      saveLocally: true,
      debts,
      extraPayment: 250,
      currentStrategyKey: "lowestBalance",
    });

    expect(window.localStorage.getItem(STORAGE_KEY_V2)).not.toBeNull();

    // Save with opt-out
    saveStoredState({
      saveLocally: false,
      debts,
      extraPayment: 250,
      currentStrategyKey: "lowestBalance",
    });

    expect(window.localStorage.getItem(STORAGE_KEY_V2)).toBeNull();
  });

  it("should clear all legacy and v2 keys on clearStoredState", () => {
    window.localStorage.setItem(STORAGE_KEY_V2, "test");
    window.localStorage.setItem(LEGACY_SAVE_KEY, "true");
    window.localStorage.setItem(LEGACY_DEBTS_KEY, "[]");

    clearStoredState();

    expect(window.localStorage.getItem(STORAGE_KEY_V2)).toBeNull();
    expect(window.localStorage.getItem(LEGACY_SAVE_KEY)).toBeNull();
    expect(window.localStorage.getItem(LEGACY_DEBTS_KEY)).toBeNull();
  });
});
