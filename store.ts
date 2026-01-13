
import { User, Transaction, AppSettings, AccountStatus } from './types';
import { INITIAL_SETTINGS } from './constants';

const STORAGE_KEY = 'beatbucks_state';

interface State {
  users: User[];
  currentUser: User | null;
  transactions: Transaction[];
  settings: AppSettings;
}

const getInitialState = (): State => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return {
    users: [],
    currentUser: null,
    transactions: [],
    settings: INITIAL_SETTINGS,
  };
};

export const stateStore = {
  get: getInitialState,
  save: (state: State) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};
