import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';

interface NetworkStore {
  isOnline: boolean;
  networkType: string | null;
  isInternetReachable: boolean | null;
  
  // Actions
  setNetworkState: (state: {
    isOnline: boolean;
    networkType: string | null;
    isInternetReachable: boolean | null;
  }) => void;
  checkConnection: () => Promise<void>;
}

export const useNetworkStore = create<NetworkStore>((set) => ({
  isOnline: true,
  networkType: null,
  isInternetReachable: null,

  setNetworkState: (networkState) => {
    set(networkState);
  },

  checkConnection: async () => {
    try {
      const state = await NetInfo.fetch();
      set({
        isOnline: state.isConnected ?? false,
        networkType: state.type,
        isInternetReachable: state.isInternetReachable
      });
    } catch (error) {
      console.error('Error checking network connection:', error);
      set({
        isOnline: false,
        networkType: null,
        isInternetReachable: false
      });
    }
  }
}));

// Set up network state listener
NetInfo.addEventListener((state) => {
  useNetworkStore.getState().setNetworkState({
    isOnline: state.isConnected ?? false,
    networkType: state.type,
    isInternetReachable: state.isInternetReachable
  });
});