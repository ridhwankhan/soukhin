import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { checkStaffEmail } from '../lib/adminService';
import { CONTACT_EMAIL } from '../config';
import { hasStaffAccessGranted, readCachedAdminProfile } from '../lib/adminSessionCache';

/** Resolves staff dashboard access from admin profile or authorized staff email. */
export function useStaffAccess() {
  const { user, isEmailVerified } = useAuth();
  const { admin, loading: adminLoading, refreshAdmin } = useAdminAuth();
  const [isStaffEmail, setIsStaffEmail] = useState(false);
  const [staffCheckDone, setStaffCheckDone] = useState(
    () => Boolean(admin) || hasStaffAccessGranted() || Boolean(readCachedAdminProfile())
  );

  useEffect(() => {
    if (!user?.email || !isEmailVerified) {
      setIsStaffEmail(false);
      setStaffCheckDone(true);
      return;
    }

    if (admin || hasStaffAccessGranted() || readCachedAdminProfile()) {
      setStaffCheckDone(true);
      void checkStaffEmail(user.email!).then((staff) => {
        setIsStaffEmail(staff);
      });
      return;
    }

    let mounted = true;
    setStaffCheckDone(false);

    void (async () => {
      const staff = await checkStaffEmail(user.email!);
      await refreshAdmin();
      if (mounted) {
        setIsStaffEmail(staff);
        setStaffCheckDone(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user?.email, isEmailVerified, admin, refreshAdmin]);

  const isOwnerEmail =
    Boolean(user?.email) && user.email!.toLowerCase() === CONTACT_EMAIL.toLowerCase();

  const needsStaffSetup = staffCheckDone && isOwnerEmail && !isStaffEmail && !admin;
  const showDashboard =
    Boolean(admin) ||
    Boolean(readCachedAdminProfile()) ||
    hasStaffAccessGranted() ||
    isStaffEmail ||
    needsStaffSetup;

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
