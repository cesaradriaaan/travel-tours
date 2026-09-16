import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabaseClient";
import { reportClientIssue } from "../lib/clientLogger";

const AuthContext = createContext(null);

const PRIVATE_SESSION_KEYS = [
  "addyventure-booking-draft-v1",
  "addyventure-booking-step-v1",
  "addyventure-booking-confirmation-v1",
  "addyventure.pendingBookingRequest",
];

const LEGACY_PRIVATE_LOCAL_KEYS = [
  "addyventure-booking-draft-v1",
  "addyventure-booking-step-v1",
];


function clearPrivateBookingStorage() {
  for (
    const key of
      PRIVATE_SESSION_KEYS
  ) {
    sessionStorage.removeItem(
      key
    );
  }

  for (
    const key of
      LEGACY_PRIVATE_LOCAL_KEYS
  ) {
    localStorage.removeItem(
      key
    );
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [authReady, setAuthReady] =
    useState(false);

  const [
    profileResolvedForUserId,
    setProfileResolvedForUserId,
  ] = useState(null);

  // =====================================================
  // AUTH SESSION
  // =====================================================

  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!active) return;

        if (error) {
          throw error;
        }

        setUser(session?.user || null);
      } catch (error) {
        reportClientIssue(
          "Unable to initialize auth:",
          error
        );

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;

        setUser(session?.user || null);
        setAuthReady(true);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // =====================================================
  // PROFILE
  // =====================================================

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      // Wait until Supabase finishes restoring
      // the current auth session.
      if (!authReady) {
        return;
      }

      // Logged-out state.
      if (!user) {
        setProfile(null);
        setProfileResolvedForUserId(null);
        return;
      }

      // Mark the current profile as unresolved
      // BEFORE requesting it.
      setProfile(null);
      setProfileResolvedForUserId(null);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "id, full_name, role, avatar_url, created_at"
          )
          .eq("id", user.id)
          .single();

        if (!active) return;

        if (error) {
          reportClientIssue(
            "Unable to load profile:",
            error
          );

          setProfile(null);
          return;
        }

        setProfile(data);
      } catch (error) {
        if (!active) return;

        reportClientIssue(
          "Unable to load profile:",
          error
        );

        setProfile(null);
      } finally {
        if (active) {
          // Important:
          // RequireAdmin must not make a decision
          // until profile resolution for THIS user
          // has completed.
          setProfileResolvedForUserId(
            user.id
          );
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [authReady, user?.id]);

  // =====================================================
  // SIGN OUT
  // =====================================================

  async function signOut() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    try {
      clearPrivateBookingStorage();
    } catch {
      // The auth session is already cleared. Storage
      // cleanup remains best-effort for restricted browsers.
    }
  }

  // =====================================================
  // DERIVED AUTH STATE
  // =====================================================

  const profileReady =
    !user ||
    profileResolvedForUserId === user.id;

  const loading =
    !authReady ||
    !profileReady;

  const isAdmin =
    profile?.role === "admin";

  const isClient =
    profile?.role === "client";

  // =====================================================
  // PROVIDER
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isClient,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
}
