import { Theme } from './index';

export const FIELD_TYPES = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'status', label: 'Статус' },
  { value: 'block', label: 'Блок' },
  { value: 'department', label: 'Підрозділ' },
  { value: 'date', label: 'Дата' },
  { value: 'currency', label: 'Валюта' },
  { value: 'checkbox', label: 'Так/Ні' },
] as const;

export const DEFAULT_STATUSES = ['На складі', 'В роботі', 'Ремонт', 'Списано'];

export const ROLE_DEFINITIONS = {
  admin: {
    label: 'Адміністратор',
    description: 'Повний доступ',
  },
  storekeeper: {
    label: 'Комірник',
    description: 'Видача, повернення, інвентаризація',
  },
  manager: {
    label: 'Керівник',
    description: 'Перегляд звітів, підтвердження операцій',
  },
  user: {
    label: 'Користувач',
    description: 'Перегляд свого майна, запит на передачу',
  },
} as const;

export const DEFAULT_THEME: Theme = {
  mode: 'dark',
  primary: '#cfbdff',
  primaryContainer: '#54389a',
  secondaryContainer: '#4a4458',
  tertiary: '#efb8c8',
  background: '#141218',
  surface: '#211f26',
  blockAccent: '#7c5cff',
};

export const THEME_PRESETS = {
  dark: DEFAULT_THEME,
  light: {
    mode: 'light' as const,
    primary: '#6750a4',
    primaryContainer: '#eaddff',
    secondaryContainer: '#e8def8',
    tertiary: '#7d5260',
    background: '#fffbff',
    surface: '#f3edf7',
    blockAccent: '#6750a4',
  },
};

export const STORAGE_KEYS = {
  workspace: 'demo-workspace-v3',
  demoUser: 'demo-user-v1',
};
