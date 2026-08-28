import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useHealthStore } from '@/store/healthStore';

export default function LoginScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { user, setUser, languageSelected } = useHealthStore();
  const [username, setUsername] = useState(user?.username ?? user?.name ?? '');
  const [password, setPassword] = useState(user?.password ?? '');

  useEffect(() => {
    if (!languageSelected) {
      router.replace('/language-selection');
    }
  }, [languageSelected, router]);

  const handleLogin = () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      Alert.alert(t('common.error'), 'Enter a username and password to continue.');
      return;
    }

    setUser({
      id: user?.id ?? Date.now().toString(),
      username: trimmedUsername,
      password: trimmedPassword,
      name: trimmedUsername,
      phone: user?.phone ?? '',
      age: user?.age ?? '',
      gender: user?.gender ?? '',
      address: user?.address ?? '',
      emergencyContact: user?.emergencyContact ?? '',
      language: i18n.language,
      userType: user?.userType ?? 'patient'
    });

    router.replace('/(tabs)');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <ShieldCheck size={34} color="#0F766E" />
        </View>
        <Text style={styles.title}>Login to continue</Text>
        <Text style={styles.subtitle}>
          Use the same username later for consult booking and profile display.
        </Text>

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

        <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.9}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.note}>This is a local app login and is stored on this device only.</Text>
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
  note: {
    marginTop: 14,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center'
  }
});
