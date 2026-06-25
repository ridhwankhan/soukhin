import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, CustomerUser } from '../types';
import { adminUsers, ADMIN_PASSWORDS } from '../data/admin';

const STORAGE_KEYS = {
  CUSTOMER: 'soukhin_customer',
  ADMIN: 'soukhin_admin',
  CUSTOMERS_DB: 'soukhin_customers_db',
};

interface StoredCustomer extends CustomerUser {
  passwordHash: string;
}

interface AuthContextType {
  customer: CustomerUser | null;
  isCustomerLoading: boolean;
  loginCustomer: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupCustomer: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logoutCustomer: () => void;
  updateCustomer: (updates: Partial<Omit<CustomerUser, 'id' | 'createdAt'>>) => void;
  admin: AdminUser | null;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(true);

  useEffect(() => {
    try {
      const sc = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
      if (sc) setCustomer(JSON.parse(sc));
    } catch {}
    try {
      const sa = localStorage.getItem(STORAGE_KEYS.ADMIN);
      if (sa) setAdmin(JSON.parse(sa));
    } catch {}
    setIsCustomerLoading(false);
  }, []);

  const getDb = (): StoredCustomer[] => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.CUSTOMERS_DB);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  };

  const saveDb = (db: StoredCustomer[]) =>
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS_DB, JSON.stringify(db));

  const loginCustomer = async (email: string, password: string) => {
    const db = getDb();
    const user = db.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, error: 'No account found with this email.' };
    if (user.passwordHash !== password) return { success: false, error: 'Incorrect password.' };
    const { passwordHash: _, ...data } = user;
    setCustomer(data);
    localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(data));
    return { success: true };
  };

  const signupCustomer = async (name: string, email: string, password: string, phone?: string) => {
    const db = getDb();
    if (db.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const newUser: StoredCustomer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      createdAt: new Date().toISOString(),
      passwordHash: password,
    };
    saveDb([...db, newUser]);
    const { passwordHash: _, ...data } = newUser;
    setCustomer(data);
    localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(data));
    return { success: true };
  };

  const logoutCustomer = () => {
    setCustomer(null);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
  };

  const updateCustomer = (updates: Partial<Omit<CustomerUser, 'id' | 'createdAt'>>) => {
    if (!customer) return;
    const updated = { ...customer, ...updates };
    setCustomer(updated);
    localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(updated));
    const db = getDb();
    const idx = db.findIndex(u => u.id === customer.id);
    if (idx !== -1) { db[idx] = { ...db[idx], ...updates }; saveDb(db); }
  };

  const loginAdmin = async (email: string, password: string) => {
    const user = adminUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, error: 'Invalid credentials.' };
    if (ADMIN_PASSWORDS[user.email] !== password) return { success: false, error: 'Invalid credentials.' };
    const data = { ...user, lastLogin: new Date().toISOString() };
    setAdmin(data);
    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(data));
    return { success: true };
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem(STORAGE_KEYS.ADMIN);
  };

  return (
    <AuthContext.Provider value={{
      customer, isCustomerLoading, loginCustomer, signupCustomer, logoutCustomer, updateCustomer,
      admin, loginAdmin, logoutAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
