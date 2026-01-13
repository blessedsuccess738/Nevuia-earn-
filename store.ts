
import { User, Transaction, AppSettings, MusicTrack } from './types';
import { INITIAL_SETTINGS, INITIAL_TRACKS } from './constants';

const STORAGE_KEY = 'beatbucks_state_v2';

interface State {
  users: User[];
  currentUser: User | null;
  transactions: Transaction[];
  settings: AppSettings;
  tracks: MusicTrack[];
}

const getInitialState = (): State => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return {
    users: [],
    currentUser: null,
    transactions: [],
    settings: INITIAL_SETTINGS,
    tracks: INITIAL_TRACKS,
  };
};

export const stateStore = {
  get: getInitialState,
  save: (state: State) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};
