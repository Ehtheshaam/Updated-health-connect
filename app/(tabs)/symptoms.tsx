import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus, Send, Clock, TriangleAlert as AlertTriangle, Calendar, CircleCheck as CheckCircle, Mic } from 'lucide-react-native';
import { useHealthStore } from '@/store/healthStore';

type SeverityLevel = 'mild' | 'moderate' | 'severe';

type ResultPayload = {
  disease: string;
  confidence?: number;
  description?: string;
  recommendation: string;
  precautions?: string[];
  book_appointment?: boolean;
  source?: 'server' | 'local';
};

const getLocalResult = (symptomText: string, severity: SeverityLevel, durationText: string): ResultPayload => {
  const text = symptomText.toLowerCase();
  const duration = durationText.trim() || 'a short time';

  if (text.includes('breathing') || text.includes('shortness of breath')) {
    return {
      disease: 'Breathing Difficulty / Respiratory Issue',
      confidence: 72,
      description: 'Breathing trouble can be linked to an allergy, infection, asthma flare-up, or another urgent condition.',
      recommendation: 'Seek medical help quickly, especially if symptoms are getting worse.',
      precautions: [
        'Sit upright and avoid lying flat.',
        'Avoid smoke, dust, and strong smells.',
        'Go to emergency care if lips turn blue or breathing becomes difficult.'
      ],
      book_appointment: true,
      source: 'local'
    };
  }

  if (text.includes('fever') || text.includes('cold') || text.includes('cough')) {
    return {
      disease: 'Likely Viral / Flu-like Illness',
      confidence: 66,
      description: `Symptoms for ${duration} may fit a common viral infection or flu-like illness.`,
      recommendation: severity === 'severe'
        ? 'Consider a doctor visit soon, rest well, and monitor the fever closely.'
        : 'Rest, hydrate, and monitor symptoms. Book a doctor if it continues or worsens.',
      precautions: [
        'Drink plenty of fluids.',
        'Rest and avoid heavy activity.',
        'Use a mask if you may be contagious.'
      ],
      book_appointment: severity !== 'mild',
      source: 'local'
    };
  }

  if (text.includes('stomach') || text.includes('abdominal') || text.includes('vomit')) {
    return {
      disease: 'Digestive / Stomach Discomfort',
      confidence: 63,
      description: 'Stomach pain can come from indigestion, a mild infection, diet changes, or dehydration.',
      recommendation: 'Keep meals light, drink water, and seek care if the pain is severe or persistent.',
      precautions: [
        'Avoid oily or spicy foods for now.',
        'Drink small amounts of water frequently.',
        'Get help if there is blood, fever, or severe pain.'
      ],
      book_appointment: severity === 'severe',
      source: 'local'
    };
  }

  if (text.includes('headache') || text.includes('dizziness') || text.includes('body pain')) {
    return {
      disease: 'General Aches / Possible Dehydration',
      confidence: 58,
      description: 'These symptoms often happen with dehydration, lack of rest, stress, or a mild infection.',
      recommendation: 'Rest, drink water, and track whether the symptoms improve over the next day.',
      precautions: [
        'Sleep in a quiet place.',
        'Stay hydrated and eat something light.',
        'If dizziness is strong or frequent, get checked.'
      ],
      book_appointment: severity === 'severe',
      source: 'local'
    };
  }

  return {
    disease: 'Basic Symptom Summary',
    confidence: 50,
    description: 'This is a simple in-app summary based on the symptoms you entered, not a medical diagnosis.',
    recommendation: 'Track the symptoms, rest, hydrate, and book a doctor if they last more than 2-3 days or get worse.',
    precautions: [
      'Monitor temperature, pain, and energy level.',
      'Avoid self-medicating with strong medicines without guidance.',
      'Seek urgent care for severe or sudden symptoms.'
    ],
    book_appointment: severity === 'severe' || duration !== 'a short time',
    source: 'local'
  };
};

export default function SymptomsScreen() {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('mild');
  const [result, setResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addSymptomRecord, symptomHistory, setLatestSymptomReport } = useHealthStore();

  const severityOptions: Array<{ value: SeverityLevel; label: string; color: string }> = [
    { value: 'mild', label: t('symptoms.mild'), color: '#22C55E' },
    { value: 'moderate', label: t('symptoms.moderate'), color: '#F59E0B' },
    { value: 'severe', label: t('symptoms.severe'), color: '#EF4444' }
  ];

  const commonSymptoms = [
    t('symptoms.commonSymptomsList.fever'),
    t('symptoms.commonSymptomsList.cough'),
    t('symptoms.commonSymptomsList.headache'),
    t('symptoms.commonSymptomsList.bodyPain'),
    t('symptoms.commonSymptomsList.stomachPain'),
    t('symptoms.commonSymptomsList.cold'),
    t('symptoms.commonSymptomsList.breathingProblem'),
    t('symptoms.commonSymptomsList.dizziness')
  ];

  const durationPresets = [
    { label: '1 Day', value: '1 day' },
    { label: '2 Days', value: '2 days' },
    { label: '1 Week', value: '1 week' },
    { label: '2 Weeks', value: '2 weeks' },
  ];

  const handleSubmitSymptoms = async () => {
    if (!symptoms.trim()) {
      Alert.alert(t('common.error'), t('symptoms.enterSymptoms'));
      return;
    }

    if (loadingTimer.current) {
      clearTimeout(loadingTimer.current);
    }

    setIsChecking(true);
    setResult(null);
    loadingTimer.current = setTimeout(() => {
      const computedResult = getLocalResult(symptoms, severity, duration);
      setResult(computedResult);

      const reportId = Date.now().toString();
      const newRecord = {
        id: reportId,
        symptoms: symptoms.trim(),
        duration: duration.trim(),
        severity,
        timestamp: new Date().toISOString(),
        synced: false
      };
      addSymptomRecord(newRecord);
      setLatestSymptomReport({
        id: reportId,
        symptoms: symptoms.trim(),
        duration: duration.trim(),
        severity,
        disease: computedResult.disease,
        recommendation: computedResult.recommendation,
        confidence: computedResult.confidence,
        createdAt: new Date().toISOString()
      });
      setIsChecking(false);
    }, 2300);
  };

  useEffect(() => {
    return () => {
      if (loadingTimer.current) {
        clearTimeout(loadingTimer.current);
      }
    };
  }, []);

  const addCommonSymptom = (symptom: string) => {
    if (symptoms) {
      setSymptoms(symptoms + ', ' + symptom);
    } else {
      setSymptoms(symptom);
    }
  };

  const resetForm = () => {
    setSymptoms('');
    setDuration('');
    setSeverity('mild');
    setResult(null);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('symptoms.title')}</Text>
        <Text style={styles.description}>{t('symptoms.description')}</Text>
      </View>

      {/* ── RESULT CARD ── */}
      {isChecking && (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color="#22C55E" />
          <Text style={styles.loadingText}>Checking symptoms...</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <CheckCircle size={24} color="#22C55E" />
            <Text style={styles.resultTitle}>
              {result.source === 'local' ? 'Basic Symptom Summary' : 'AI Diagnosis Result'}
            </Text>
          </View>

          {result.source === 'local' ? (
            <View style={styles.localBadge}>
              <Text style={styles.localBadgeText}>Offline fallback</Text>
            </View>
          ) : null}

          {/* Disease */}
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Predicted Disease</Text>
            <Text style={styles.resultDisease}>{result.disease}</Text>
          </View>

          {/* Confidence */}
          {result.confidence && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Model Confidence</Text>
              <Text style={styles.resultConfidence}>{result.confidence}%</Text>
            </View>
          )}

          {/* Description */}
          {result.description ? (
            <View style={styles.resultDescBox}>
              <Text style={styles.resultLabel}>About this condition</Text>
              <Text style={styles.resultDesc}>{result.description}</Text>
            </View>
          ) : null}

          {/* Recommendation */}
          <View style={[
            styles.recommendBox,
            { backgroundColor: result.book_appointment ? '#FEF3C7' : '#F0FDF4' }
          ]}>
            <Text style={styles.recommendText}>{result.recommendation}</Text>
          </View>

          {/* Precautions */}
          {result.precautions && result.precautions.length > 0 && (
            <View style={styles.precautionsBox}>
              <Text style={styles.resultLabel}>Precautions</Text>
              {result.precautions.map((p: string, i: number) => (
                <Text key={i} style={styles.precautionItem}>• {p}</Text>
              ))}
            </View>
          )}

          {/* Book Appointment Button */}
          {result.book_appointment && (
            <TouchableOpacity style={styles.appointmentButton}>
              <Calendar size={18} color="#FFFFFF" />
              <Text style={styles.appointmentButtonText}>Book Doctor Appointment</Text>
            </TouchableOpacity>
          )}

          {/* Check Again */}
          <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
            <Text style={styles.resetButtonText}>Check Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── FORM (hidden when result shown) ── */}
      {!result && (
        <>
          {/* Symptoms Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('symptoms.describeSymptoms')}</Text>
            <View style={styles.textAreaWrapper}>
              <TextInput
                style={styles.textArea}
                placeholder={t('symptoms.symptomsPlaceholder')}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={symptoms}
                onChangeText={setSymptoms}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.micButton}
                onPress={() => Alert.alert('Voice Input', 'Voice-to-text feature coming soon!')}
                activeOpacity={0.7}
              >
                <Mic size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.commonSymptomsTitle}>{t('symptoms.commonSymptoms')}</Text>
            <View style={styles.commonSymptoms}>
              {commonSymptoms.map((symptom, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.symptomChip}
                  onPress={() => addCommonSymptom(symptom)}
                >
                  <Plus size={16} color="#22C55E" />
                  <Text style={styles.symptomChipText}>{symptom}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('symptoms.duration')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('symptoms.durationPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={duration}
              onChangeText={setDuration}
            />
            <View style={styles.durationPresets}>
              {durationPresets.map((preset) => (
                <TouchableOpacity
                  key={preset.value}
                  style={[
                    styles.durationChip,
                    duration === preset.value && styles.durationChipActive,
                  ]}
                  onPress={() => setDuration(preset.value)}
                >
                  <Clock size={14} color={duration === preset.value ? '#FFFFFF' : '#22C55E'} />
                  <Text
                    style={[
                      styles.durationChipText,
                      duration === preset.value && styles.durationChipTextActive,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Severity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('symptoms.severity')}</Text>
            <View style={styles.severityOptions}>
              {severityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.severityOption,
                    severity === option.value && {
                      backgroundColor: option.color + '20',
                      borderColor: option.color
                    }
                  ]}
                  onPress={() => setSeverity(option.value)}
                >
                  <View style={[styles.severityIndicator, { backgroundColor: option.color }]} />
                  <Text style={[
                    styles.severityText,
                    severity === option.value && { color: option.color, fontWeight: 'bold' }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Emergency Warning */}
          <View style={styles.emergencySection}>
            <View style={styles.emergencyHeader}>
              <AlertTriangle size={24} color="#EF4444" />
              <Text style={styles.emergencyTitle}>{t('symptoms.emergencyTitle')}</Text>
            </View>
            <Text style={styles.emergencyText}>{t('symptoms.emergencyText')}</Text>
          </View>

          {/* Submit */}
          <View style={styles.submitSection}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitSymptoms}
              disabled={isChecking}
            >
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>{t('symptoms.submitSymptoms')}</Text>
            </TouchableOpacity>
            <Text style={styles.submitHint}>{t('symptoms.privateSecure')}</Text>
          </View>
        </>
      )}

      {/* Recent Reports */}
      {!result && symptomHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('symptoms.recentReports')}</Text>
          {symptomHistory.slice(0, 3).map((record) => (
            <View key={record.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.historyDate}>
                  {new Date(record.timestamp).toLocaleDateString()}
                </Text>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: severityOptions.find(s => s.value === record.severity)?.color + '20' }
                ]}>
                  <Text style={[
                    styles.severityBadgeText,
                    { color: severityOptions.find(s => s.value === record.severity)?.color }
                  ]}>
                    {record.severity}
                  </Text>
                </View>
              </View>
              <Text style={styles.historySymptoms} numberOfLines={2}>
                {record.symptoms}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#FFFFFF', padding: 20, paddingTop: 60,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  description: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  textAreaWrapper: {
    position: 'relative' as const,
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB',
    borderRadius: 12, padding: 16, paddingRight: 56, fontSize: 16, color: '#1F2937',
    minHeight: 120,
  },
  micButton: {
    position: 'absolute' as const,
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22C55E',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB',
    borderRadius: 12, padding: 16, fontSize: 16, color: '#1F2937',
  },
  durationPresets: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginTop: 12,
  },
  durationChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#22C55E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  durationChipActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  durationChipText: {
    fontSize: 13,
    color: '#22C55E',
    fontWeight: '600' as const,
  },
  durationChipTextActive: {
    color: '#FFFFFF',
  },
  commonSymptomsTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  commonSymptoms: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  symptomChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#22C55E', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8,
  },
  symptomChipText: { marginLeft: 4, fontSize: 14, color: '#22C55E', fontWeight: '500' },
  severityOptions: { gap: 12 },
  severityOption: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, padding: 16,
  },
  severityIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  severityText: { fontSize: 16, color: '#1F2937' },
  emergencySection: {
    margin: 20, backgroundColor: '#FEF2F2', borderLeftWidth: 4,
    borderLeftColor: '#EF4444', padding: 16, borderRadius: 12,
  },
  emergencyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  emergencyTitle: { fontSize: 16, fontWeight: 'bold', color: '#EF4444', marginLeft: 8 },
  emergencyText: { fontSize: 14, color: '#7F1D1D', lineHeight: 20 },
  submitSection: { padding: 20, alignItems: 'center' },
  submitButton: {
    backgroundColor: '#22C55E', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 32,
    borderRadius: 12, width: '100%',
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  submitHint: { fontSize: 12, color: '#6B7280', marginTop: 8, textAlign: 'center' },
  historyCard: {
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  historyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  historyDate: { fontSize: 14, color: '#6B7280', marginLeft: 8, flex: 1 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  severityBadgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  historySymptoms: { fontSize: 14, color: '#1F2937', lineHeight: 20 },

  loadingCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '600',
  },

  // Result card styles
  resultCard: {
    margin: 20, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginLeft: 8 },
  localBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  localBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  resultLabel: { fontSize: 13, color: '#6B7280', fontWeight: '600', marginBottom: 4 },
  resultDisease: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  resultConfidence: { fontSize: 16, fontWeight: 'bold', color: '#22C55E' },
  resultDescBox: { marginBottom: 12 },
  resultDesc: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  recommendBox: { borderRadius: 10, padding: 14, marginBottom: 12 },
  recommendText: { fontSize: 14, fontWeight: '600', color: '#1F2937', lineHeight: 20 },
  precautionsBox: { marginBottom: 16 },
  precautionItem: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  appointmentButton: {
    backgroundColor: '#3B82F6', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 14, borderRadius: 12, marginBottom: 10,
  },
  appointmentButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
  resetButton: {
    borderWidth: 1, borderColor: '#D1D5DB', padding: 12,
    borderRadius: 12, alignItems: 'center',
  },
  resetButtonText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
});