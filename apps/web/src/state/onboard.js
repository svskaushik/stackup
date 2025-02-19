import create from 'zustand';
import { persist } from 'zustand/middleware';
import { wallet } from '@stackupfinance/walletjs';
import { App } from '../config';

export const onboardUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const onboardLoginPageSelector = (state) => ({
  loading: state.loading,
  createEphemeralWallet: state.createEphemeralWallet,
});

export const onboardSignUpPageSelector = (state) => ({
  loading: state.loading,
  createEphemeralWallet: state.createEphemeralWallet,
});

export const onboardHomePageSelector = (state) => ({
  clear: state.clear,
});

export const onboardOnboardRecoveryPageSelector = (state) => ({
  ephemeralWallet: state.ephemeralWallet,
  guardianMap: state.guardianMap,
  setGuardian: state.setGuardian,
  removeGuardian: state.removeGuardian,
});

export const onboardOnboardAddEmailPageSelector = (state) => ({
  guardianMap: state.guardianMap,
  setEmail: state.setEmail,
});

export const onboardOnboardVerifyEmailPageSelector = (state) => ({
  email: state.email,
});

export const onboardOnboardSummaryPageSelector = (state) => ({
  ephemeralWallet: state.ephemeralWallet,
  guardianMap: state.guardianMap,
});

const defaultGuardianMap = { defaultGuardian: App.web3.paymaster };
const defaultState = {
  loading: false,
  ephemeralWallet: undefined,
  guardianMap: { ...defaultGuardianMap },
  email: undefined,
};

export const useOnboardStore = create(
  persist(
    (set, get) => ({
      ...defaultState,

      createEphemeralWallet: async (username, password) => {
        set({ loading: true });

        try {
          set({
            loading: false,
            ephemeralWallet: await wallet.proxy.initEncryptedIdentity(password, username),
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      setGuardian: (guardian, address) => {
        const guardianMap = get().guardianMap;
        guardianMap[guardian] = address;
        set({ guardianMap });
      },

      removeGuardian: (guardian) => {
        const { [guardian]: _, ...rest } = get().guardianMap;
        set({ guardianMap: rest });
      },

      setEmail: (email) => set({ email }),

      clear: () => set({ ...defaultState, guardianMap: { ...defaultGuardianMap } }),
    }),
    {
      name: 'stackup-onboard-store',
      partialize: (state) => {
        const { loading, ...persisted } = state;
        return persisted;
      },
    },
  ),
);
