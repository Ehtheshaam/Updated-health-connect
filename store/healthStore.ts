import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id?: string;
  name: string;
  phone: string;
  age: string;
  gender: string;
  address: string;
  emergencyContact: string;
  language: string;
  userType?: 'patient' | 'healthWorker';
}

interface SymptomRecord {
  id: string;
  symptoms: string;
  duration: string;
  severity: 'mild' | 'moderate' | 'severe';
  timestamp: string;
  synced: boolean;
}

interface HealthRecord {
  id: string;
  type: string;
  date: string;
  doctor: string;
  results: string;
  synced: boolean;
  file?: string;
}

interface Prescription {
  id: string;
  doctor: string;
  date: string;
  medicines: Array<{
    name: string;
    dosage: string;
    duration: string;
  }>;
  instructions: string;
  instructionsHindi: string;
  synced: boolean;
}

interface HealthTip {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  category: string;
}

interface SymptomReport {
  id: string;
  symptoms: string;
  duration: string;
  severity: 'mild' | 'moderate' | 'severe';
  disease: string;
  recommendation: string;
  confidence?: number;
  createdAt: string;
}

interface ConsultBooking {
  id: string;
  patientName?: string;
  username?: string;
  hospital: string;
  doctor: string;
  date: string;
  time: string;
  symptomsReportId?: string;
  selfieConfirmed?: boolean;
  status: 'Pending hospital acceptance' | 'Accepted' | 'Rejected' | string;
  createdAt: string;
}

interface HealthStore {
  user: User | null;
  isAuthenticated: boolean;
  languageSelected: boolean;
  lastSymptomReport: SymptomReport | null;
  consultBookings: ConsultBooking[];
  symptomHistory: SymptomRecord[];
  healthRecords: HealthRecord[];
  prescriptions: Prescription[];
  healthTips: HealthTip[];
  pendingSyncItems: string[];

  // Actions
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;
  setLanguageSelected: (selected: boolean) => void;
  setLatestSymptomReport: (report: SymptomReport | null) => void;
  addConsultBooking: (booking: ConsultBooking) => void;
  setConsultBookings: (bookings: ConsultBooking[]) => void;
  logout: () => void;
  setSymptomHistory: (history: SymptomRecord[]) => void;
  addSymptomRecord: (record: SymptomRecord) => void;
  addHealthRecord: (record: HealthRecord) => void;
  setHealthRecords: (records: HealthRecord[]) => void;
  addPrescription: (prescription: Prescription) => void;
  setPrescriptions: (prescriptions: Prescription[]) => void;
  markAsSynced: (id: string, type: 'symptom' | 'health' | 'prescription') => void;
  clearPendingSync: () => void;
}

const initialHealthTips: HealthTip[] = [
  {
    id: '1',
    title: 'साफ पानी पिएं',
    subtitle: 'Drink Clean Water',
    description: 'हमेशा उबला हुआ या साफ पानी पिएं। गंदा पानी बीमारी का कारण बन सकता है।',
    icon: '💧',
    category: 'hygiene'
  },
  {
    id: '2',
    title: 'हाथ धोएं',
    subtitle: 'Wash Your Hands',
    description: 'खाना खाने से पहले और बाद में हाथ धोना जरूरी है।',
    icon: '🧼',
    category: 'hygiene'
  },
  {
    id: '3',
    title: 'टीकाकरण',
    subtitle: 'Get Vaccinated',
    description: 'समय पर टीकाकरण कराना बीमारियों से बचाव का सबसे अच्छा तरीका है।',
    icon: '💉',
    category: 'prevention'
  },
  {
    id: '4',
    title: 'व्यायाम करें',
    subtitle: 'Exercise Daily',
    description: 'रोज 30 मिनट पैदल चलना या व्यायाम करना स्वास्थ्य के लिए अच्छा है।',
    icon: '🚶',
    category: 'fitness'
  }
];

export const useHealthStore = create<HealthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      languageSelected: false,
      lastSymptomReport: null,
      consultBookings: [],
      symptomHistory: [],
      healthRecords: [],
      prescriptions: [],
      healthTips: initialHealthTips,
      pendingSyncItems: [],

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      setLanguageSelected: (selected) => {
        set({ languageSelected: selected });
      },

      setLatestSymptomReport: (report) => {
        set({ lastSymptomReport: report });
      },

      addConsultBooking: (booking) => {
        set((state) => ({
          consultBookings: [booking, ...state.consultBookings]
        }));
      },

      setConsultBookings: (bookings) => {
        set({ consultBookings: bookings });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          lastSymptomReport: null,
          consultBookings: [],
          symptomHistory: [],
          healthRecords: [],
          prescriptions: [],
          pendingSyncItems: []
        });
      },

      setSymptomHistory: (history) => {
        set({ symptomHistory: history });
      },

      addSymptomRecord: (record) => {
        set((state) => ({
          symptomHistory: [record, ...state.symptomHistory],
          pendingSyncItems: [...state.pendingSyncItems, `symptom-${record.id}`]
        }));
      },

      addHealthRecord: (record) => {
        set((state) => ({
          healthRecords: [record, ...state.healthRecords],
          pendingSyncItems: [...state.pendingSyncItems, `health-${record.id}`]
        }));
      },

      setHealthRecords: (records) => {
        set({ healthRecords: records });
      },

      addPrescription: (prescription) => {
        set((state) => ({
          prescriptions: [prescription, ...state.prescriptions],
          pendingSyncItems: [...state.pendingSyncItems, `prescription-${prescription.id}`]
        }));
      },

      setPrescriptions: (prescriptions) => {
        set({ prescriptions });
      },

      markAsSynced: (id, type) => {
        set((state) => {
          const pendingKey = `${type}-${id}`;
          return {
            pendingSyncItems: state.pendingSyncItems.filter(item => item !== pendingKey),
            symptomHistory: type === 'symptom' 
              ? state.symptomHistory.map(record => 
                  record.id === id ? { ...record, synced: true } : record
                )
              : state.symptomHistory,
            healthRecords: type === 'health'
              ? state.healthRecords.map(record =>
                  record.id === id ? { ...record, synced: true } : record
                )
              : state.healthRecords,
            prescriptions: type === 'prescription'
              ? state.prescriptions.map(prescription =>
                  prescription.id === id ? { ...prescription, synced: true } : prescription
                )
              : state.prescriptions
          };
        });
      },

      clearPendingSync: () => {
        set({ pendingSyncItems: [] });
      }
    }),
    {
      name: 'health-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        languageSelected: state.languageSelected,
        lastSymptomReport: state.lastSymptomReport,
        consultBookings: state.consultBookings,
        symptomHistory: state.symptomHistory,
        healthRecords: state.healthRecords,
        prescriptions: state.prescriptions,
        pendingSyncItems: state.pendingSyncItems
      })
    }
  )
);