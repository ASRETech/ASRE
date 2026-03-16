import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { User, Lead, Transaction, FinancialEntry, SOP, ComplianceLog, CultureDoc, LevelDeliverable } from '@/lib/store';

interface AppState {
  user: User | null;
  isOnboarded: boolean;
  leads: Lead[];
  transactions: Transaction[];
  financials: FinancialEntry[];
  sops: SOP[];
  complianceLogs: ComplianceLog[];
  cultureDoc: CultureDoc;
  deliverables: LevelDeliverable[];
  sidebarCollapsed: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_ONBOARDED'; payload: boolean }
  | { type: 'ADD_LEAD'; payload: Lead }
  | { type: 'UPDATE_LEAD'; payload: { id: string; updates: Partial<Lead> } }
  | { type: 'DELETE_LEAD'; payload: string }
  | { type: 'SET_LEADS'; payload: Lead[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'ADD_FINANCIAL'; payload: FinancialEntry }
  | { type: 'ADD_SOP'; payload: SOP }
  | { type: 'UPDATE_SOP'; payload: { id: string; updates: Partial<SOP> } }
  | { type: 'ADD_COMPLIANCE_LOG'; payload: ComplianceLog }
  | { type: 'UPDATE_CULTURE'; payload: Partial<CultureDoc> }
  | { type: 'TOGGLE_DELIVERABLE'; payload: string }
  | { type: 'SET_DELIVERABLES'; payload: LevelDeliverable[] }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADVANCE_LEVEL' };

const initialState: AppState = {
  user: null,
  isOnboarded: false,
  leads: [],
  transactions: [],
  financials: [],
  sops: [],
  complianceLogs: [],
  cultureDoc: {
    missionStatement: '',
    visionStatement: '',
    coreValues: [],
    teamCommitments: [],
  },
  deliverables: [],
  sidebarCollapsed: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    case 'SET_ONBOARDED':
      return { ...state, isOnboarded: action.payload };
    case 'ADD_LEAD':
      return { ...state, leads: [...state.leads, action.payload] };
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(l => l.id === action.payload.id ? { ...l, ...action.payload.updates } : l),
      };
    case 'DELETE_LEAD':
      return { ...state, leads: state.leads.filter(l => l.id !== action.payload) };
    case 'SET_LEADS':
      return { ...state, leads: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      };
    case 'ADD_FINANCIAL':
      return { ...state, financials: [...state.financials, action.payload] };
    case 'ADD_SOP':
      return { ...state, sops: [...state.sops, action.payload] };
    case 'UPDATE_SOP':
      return {
        ...state,
        sops: state.sops.map(s => s.id === action.payload.id ? { ...s, ...action.payload.updates } : s),
      };
    case 'ADD_COMPLIANCE_LOG':
      return { ...state, complianceLogs: [action.payload, ...state.complianceLogs] };
    case 'UPDATE_CULTURE':
      return { ...state, cultureDoc: { ...state.cultureDoc, ...action.payload } };
    case 'TOGGLE_DELIVERABLE': {
      const deliverables = state.deliverables.map(d =>
        d.id === action.payload
          ? { ...d, isComplete: !d.isComplete, completedAt: !d.isComplete ? new Date().toISOString() : undefined }
          : d
      );
      return { ...state, deliverables };
    }
    case 'SET_DELIVERABLES':
      return { ...state, deliverables: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'ADVANCE_LEVEL':
      return {
        ...state,
        user: state.user ? { ...state.user, currentLevel: Math.min(state.user.currentLevel + 1, 7) } : null,
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function useUser() {
  const { state } = useApp();
  return state.user;
}

export function useIsOnboarded() {
  const { state } = useApp();
  return state.isOnboarded;
}
