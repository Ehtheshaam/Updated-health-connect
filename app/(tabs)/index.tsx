import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Heart, Shield, Users, Wifi, WifiOff, FileText, Video } from 'lucide-react-native';
import { useHealthStore } from '@/store/healthStore';
import { useNetworkStore } from '@/store/networkStore';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useHealthStore();
  const { isOnline, checkConnection } = useNetworkStore();

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleQuickAction = (destination: '/symptoms' | '/consultation' | '/profile') => {
    router.push(destination);
  };

  const healthTipsData = [
    {
      id: 1,
      icon: '💧',
      title: 'Drink water',
      subtitle: 'Stay hydrated every day',
      description: 'Drink enough water throughout the day, especially in hot weather.',
      tips: ['Drink a glass after waking up.', 'Carry a water bottle.', 'Add lemon or mint if plain water is difficult.']
    },
    {
      id: 2,
      icon: '🚶',
      title: 'Walk daily',
      subtitle: 'Move your body for 20-30 minutes',
      description: 'A short daily walk helps circulation, digestion, and energy.',
      tips: ['Walk after meals.', 'Keep a steady pace.', 'Use comfortable shoes.']
    },
    {
      id: 3,
      icon: '😴',
      title: 'Sleep well',
      subtitle: 'Give your body time to recover',
      description: 'Good sleep improves immunity, mood, and focus.',
      tips: ['Sleep and wake up at a fixed time.', 'Avoid heavy meals late at night.', 'Keep your phone away before bed.']
    },
    {
      id: 4,
      icon: '🥗',
      title: 'Eat simple food',
      subtitle: 'Choose light and fresh meals',
      description: 'Balanced meals support better recovery and steady energy.',
      tips: ['Add fruits and vegetables.', 'Avoid too much oily food.', 'Eat on time.']
    },
  ];

  const emergencyContacts = [
    { name: t('home.ambulance'), number: '102', color: '#EF4444' },
    { name: t('home.healthHelpline'), number: '104', color: '#22C55E' },
    { name: t('home.emergency'), number: '112', color: '#F59E0B' }
  ];

  const handleEmergencyCall = (name: string, number: string) => {
    Alert.alert(t('home.emergency'), `Call ${name} (${number})?`, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: 'Call',
        onPress: async () => {
          const phoneUrl = `tel:${number}`;
          const canOpen = await Linking.canOpenURL(phoneUrl);

          if (canOpen) {
            await Linking.openURL(phoneUrl);
            return;
          }

          Alert.alert(t('common.error'), 'This device cannot open the phone dialer.');
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{t('home.greeting')}</Text>
          <Text style={styles.userName}>
            {user?.name || t('common.welcome')}
          </Text>
          <View style={styles.connectionStatus}>
            {isOnline ? (
              <View style={styles.onlineStatus}>
                <Wifi size={16} color="#22C55E" />
                <Text style={styles.statusText}>{t('common.online')}</Text>
              </View>
            ) : (
              <View style={styles.offlineStatus}>
                <WifiOff size={16} color="#EF4444" />
                <Text style={styles.statusTextOffline}>{t('common.offline')}</Text>
              </View>
            )}
          </View>
        </View>
        <Heart size={40} color="#22C55E" />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => handleQuickAction('/symptoms')} activeOpacity={0.85}>
            <FileText size={24} color="#3B82F6" />
            <Text style={styles.actionText}>{t('home.reportSymptoms').replace(' ', '\n')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => handleQuickAction('/consultation')} activeOpacity={0.85}>
            <Video size={24} color="#8B5CF6" />
            <Text style={styles.actionText}>{t('home.videoConsult').replace(' ', '\n')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => handleQuickAction('/profile')} activeOpacity={0.85}>
            <Users size={24} color="#F59E0B" />
            <Text style={styles.actionText}>{t('home.healthWorker').replace(' ', '\n')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.emergencyContacts')}</Text>
        <View style={styles.emergencyGrid}>
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.emergencyCard, { borderLeftColor: contact.color }]}
              onPress={() => handleEmergencyCall(contact.name, contact.number)}
            >
              <Text style={styles.emergencyNumber}>{contact.number}</Text>
              <Text style={styles.emergencyName}>{contact.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Health Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.healthTips')}</Text>
        <TouchableOpacity
          style={styles.tipsCardButton}
          activeOpacity={0.88}
          onPress={() => router.push('/health-tips')}
        >
          <View style={styles.tipsCardHeader}>
            <Text style={styles.tipsEmoji}>✨</Text>
            <View style={styles.tipsCardTextBlock}>
              <Text style={styles.tipsCardTitle}>Follow the daily health tips</Text>
              <Text style={styles.tipsCardSubtitle}>Tap to open simple habits for water, walking, sleep, and food.</Text>
            </View>
          </View>
        </TouchableOpacity>

      </View>

      {/* App Info */}
      <View style={styles.section}>
        <View style={styles.infoCard}>
          <Shield size={24} color="#22C55E" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>{t('home.securePrivate')}</Text>
            <Text style={styles.infoText}>
              {t('home.secureDescription')}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
  },
  statusTextOffline: {
    marginLeft: 4,
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 110,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  actionSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  emergencyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emergencyCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  emergencyName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tipSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  tipDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  tipsCardButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tipsEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  tipsCardTextBlock: {
    flex: 1,
  },
  tipsCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  tipsCardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});