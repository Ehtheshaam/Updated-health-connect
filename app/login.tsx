import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useHealthStore } from '@/store/healthStore';
import api from '@/src/services/api';

export default function LoginScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { user, setUser, languageSelected } = useHealthStore();
  const [username, setUsername] = useState(user?.name ?? '');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    if (!languageSelected) {
      router.replace('/language-selection');
    }
  }, [languageSelected, router]);

  const handleAuth = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      Alert.alert(t('common.error'), 'Enter a username and password to continue.');
      return;
    }

    setIsLoading(true);
    setOfflineMode(false);

    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login';
      const payload = isRegistering
        ? { name: trimmedUsername, phone: trimmedUsername, password: trimmedPassword }
        : { phone: trimmedUsername, password: trimmedPassword };

      const { data } = await api.post(endpoint, payload);

      // Store JWT in secure storage
      await SecureStore.setItemAsync('token', data.token);

      // Store user in Zustand
      setUser({
        id: data.user.id,
        name: data.user.name,
        phone: data.user.phone,
        age: data.user.age || '',
        gender: data.user.gender || '',
        address: data.user.address || '',
        emergencyContact: data.user.emergencyContact || '',
        language: i18n.language,
        userType: data.user.userType || 'patient',
      });

      router.replace('/(tabs)');
    } catch (err: any) {
      const message = err.response?.data?.error;

      if (message) {
        // Server responded with a known error (wrong password, user exists, etc.)
        Alert.alert(t('common.error'), message);
      } else {
        // Network error / server unreachable — show offline banner, don't silently fake-login
        setOfflineMode(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <ShieldCheck size={34} color="#0F766E" />
        </View>
        <Text style={styles.title}>{isRegistering ? 'Create account' : 'Login to continue'}</Text>
        <Text style={styles.subtitle}>
          {isRegistering
            ? 'Register with a username and password to get started.'
            : 'Use the same username later for consult booking and profile display.'}
        </Text>

        {offlineMode && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>
              ⚠ Cannot reach the server. Check your connection and make sure the backend is running.
            </Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputWrap}>
            <User size={18} color="#64748B" />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#94A3B8"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleAuth} activeOpacity={0.9} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>{isRegistering ? 'Register' : 'Continue'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setIsRegistering(!isRegistering); setOfflineMode(false); }} style={styles.toggleWrap}>
          <Text style={styles.toggleText}>
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>Your credentials are securely transmitted and never stored in plain text.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A'
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 22
  },
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  offlineBannerText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 18,
  },
  field: {
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC'
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A'
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC'
  },
  button: {
    marginTop: 8,
    backgroundColor: '#0F766E',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 15
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  },
  toggleWrap: {
    marginTop: 14,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#0F766E',
    fontWeight: '700',
  },
  note: {
    marginTop: 14,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center'
  }
});
