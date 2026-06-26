import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { checkStaffEmail } from '../lib/adminService';
import { CONTACT_EMAIL } from '../config';

/** Resolves staff dashboard access from admin profile or authorized staff email. */
export function useStaffAccess() {
  const { user, isEmailVerified } = useAuth();
  const { admin, loading: adminLoading, refreshAdmin } = useAdminAuth();
  const [isStaffEmail, setIsStaffEmail] = useState(false);
  const [staffCheckDone, setStaffCheckDone] = useState(false);

  useEffect(() => {
    if (!user?.email || !isEmailVerified) {
      setIsStaffEmail(false);
      setStaffCheckDone(true);
      return;
    }

    let mounted = true;
    setStaffCheckDone(false);

    void (async () => {
      const [staff] = await Promise.all([
        checkStaffEmail(user.email!),
        refreshAdmin(),
      ]);
      if (mounted) {
        setIsStaffEmail(staff);
        setStaffCheckDone(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user?.email, isEmailVerified, refreshAdmin]);

  const isOwnerEmail =
    Boolean(user?.email) && user.email!.toLowerCase() === CONTACT_EMAIL.toLowerCase();

  const needsStaffSetup = staffCheckDone && isOwnerEmail && !isStaffEmail && !admin;
  const showDashboard = Boolean(admin) || isStaffEmail || needsStaffSetup;

  return {
    admin,
    adminLoading,
    isStaffEmail,
    isOwnerEmail,
    needsStaffSetup,
    staffCheckDone,
    showDashboard,
    refreshAdmin,
  };
}
