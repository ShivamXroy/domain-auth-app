import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut, type User } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, firebaseConfigured } from '@/services/firebase';
import { isAllowedCompanyEmail } from '@/utils/domain';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = { user: User | null; loading: boolean; signingIn: boolean; error: string | null; signIn: () => Promise<void>; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const restrictedMessage = 'Access restricted. Please login using your official domain email.';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    selectAccount: true,
  });

  useEffect(() => onAuthStateChanged(auth, async (nextUser) => {
    if (nextUser && (!nextUser.emailVerified || !isAllowedCompanyEmail(nextUser.email))) {
      await signOut(auth);
      setUser(null);
      setError(restrictedMessage);
    } else setUser(nextUser);
    setLoading(false);
  }), []);

  useEffect(() => {
    if (response?.type !== 'success') return;
    const authenticate = async () => {
      try {
        const idToken = response.params.id_token;
        if (!idToken) throw new Error('Google did not return an ID token. Check your OAuth client configuration.');
        await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Unable to sign in. Please try again.');
      } finally { setSigningIn(false); }
    };
    void authenticate();
  }, [response]);

  const value = useMemo(() => ({ user, loading, signingIn, error,
    signIn: async () => {
      if (!firebaseConfigured) { setError('Firebase is not configured. Add the public values in .env and restart Expo.'); return; }
      setError(null); setSigningIn(true);
      try {
        const result = await promptAsync();
        if (result.type === 'cancel' || result.type === 'dismiss') { setError('Sign-in was cancelled.'); setSigningIn(false); }
      } catch { setError('Could not open Google sign-in. Please try again.'); setSigningIn(false); }
    },
    logout: async () => { await signOut(auth); setUser(null); },
  }), [user, loading, signingIn, error, promptAsync]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used within AuthProvider'); return value; }
