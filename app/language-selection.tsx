import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';
import { useHealthStore } from '@/store/healthStore';

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const { setLanguageSelected } = useHealthStore();

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      setLanguageSelected(true);
      router.replace('/login');
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <View style={styles.container}>
      <LanguageSelector onLanguageSelect={handleLanguageSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});