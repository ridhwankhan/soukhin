import { Product } from '../types';

const STORAGE_KEY = 'soukhin_pending_action';
const RETURN_PATH_KEY = 'soukhin_return_to';

export type PendingAction =
  | {
      type: 'addToCart';
      product: Product;
      quantity: number;
      size?: string;
      color?: string;
    }
  | { type: 'checkout' }
  | { type: 'openCart' };

export function savePendingAction(action: PendingAction, returnPath?: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(action));
    if (returnPath) {
      sessionStorage.setItem(RETURN_PATH_KEY, returnPath);
    }
  } catch {
    // ignore storage errors
  }
}

export function consumeReturnPath(): string {
  try {
    const path = sessionStorage.getItem(RETURN_PATH_KEY) || '/';
    sessionStorage.removeItem(RETURN_PATH_KEY);
    return path.startsWith('/') ? path : '/';
  } catch {
    return '/';
  }
}

export function consumePendingAction(): PendingAction | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return JSON.parse(raw) as PendingAction;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function peekPendingAction(): PendingAction | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingAction) : null;
  } catch {
    return null;
  }
}
