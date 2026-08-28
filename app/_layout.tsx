import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useHealthStore } from '@/store/healthStore';
import '@/i18n';

export default function RootLayout() {
  useFrameworkReady();
  const router = useRouter();
  const { languageSelected, isAuthenticated } = useHealthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!languageSelected) {
      router.replace('/language-selection');
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [ready, languageSelected, isAuthenticated, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="language-selection" />
        <Stack.Screen name="login" />
        <Stack.Screen name="health-tips" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}