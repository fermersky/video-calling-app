import { writable } from 'svelte/store';
import { createLogger } from './services/logger';

export const deviceSelectorPopupSubject = writable(false);
export const userInfoSubject = writable();
export const criticalErrorSubject = writable('');
