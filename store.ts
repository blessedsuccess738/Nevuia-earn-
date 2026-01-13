
import { User, Transaction, AppSettings, MusicTrack, Message, AdminNotification } from './types';
import { INITIAL_SETTINGS, INITIAL_TRACKS } from './constants';

const STORAGE_KEY = 'beatbucks_state_v3';

interface State {
  users: User[];
  currentUser: User | null;
  transactions: Transaction[];
  settings: AppSettings;
  tracks: MusicTrack[];
  messages: Message[];
  adminNotifications: AdminNotification[];
}

const getInitialState = (): State => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (!parsed.messages) parsed.messages = [];
    if (!parsed.adminNotifications) parsed.adminNotifications = [];
    return parsed;
  }
  return {
    users: [],
    currentUser: null,
    transactions: [],
    settings: INITIAL_SETTINGS,
    tracks: INITIAL_TRACKS,
    messages: [],
    adminNotifications: [],
  };
};

export const stateStore = {
  get: getInitialState,
  save: (state: State) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};
