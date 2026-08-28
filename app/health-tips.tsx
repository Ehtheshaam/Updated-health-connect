import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

const dailyTips = [
  {
    emoji: '💦',
    title: 'Drink water',
    subtitle: 'Stay hydrated throughout the day',
    points: ['Drink a glass after waking up.', 'Carry water with you.', 'Avoid waiting until you feel very thirsty.']
  },
  {
    emoji: '🌈',
    title: 'Walk daily',
    subtitle: 'Keep your body active',
    points: ['Walk for 20-30 minutes.', 'Try a short walk after meals.', 'Keep your pace comfortable and steady.']
  },
  {
    emoji: '✨',
    title: 'Sleep well',
    subtitle: 'Let your body recover',
    points: ['Sleep at a fixed time.', 'Reduce screen use before bed.', 'Keep your room quiet and cool.']
  },
  {
    emoji: '🥗',
    title: 'Eat simple food',
    subtitle: 'Choose light and fresh meals',
    points: ['Add fruits and vegetables.', 'Avoid too much oily food.', 'Eat meals on time.']
  },
];

export default function HealthTipsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerIconWrap}>
          <Text style={styles.headerEmoji}>🌿</Text>
        </View>
        <Text style={styles.title}>Daily Health Tips</Text>
        <Text style={styles.subtitle}>
          Simple everyday habits to help you stay healthy and feel better.
        </Text>
      </View>

      {dailyTips.map((tip) => {
        return (
          <View key={tip.title} style={styles.tipCard}>
            <View style={styles.tipTopRow}>
              <View style={styles.tipIconWrap}>
                <Text style={styles.tipEmoji}>{tip.emoji}</Text>
              </View>
              <View style={styles.tipTextBlock}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipSubtitle}>{tip.subtitle}</Text>
              </View>
            </View>

            {tip.points.map((point) => (
              <Text key={point} style={styles.tipPoint}>• {point}</Text>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 18,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  backIcon: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
  },
  headerIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  headerEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  tipTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipEmoji: {
    fontSize: 22,
  },
  tipTextBlock: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  tipSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },
  tipPoint: {
    fontSize: 14,
    lineHeight: 21,
    color: '#334155',
    marginBottom: 6,
  },
});
