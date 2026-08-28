import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
// import { FileText, Download, Eye, Calendar, User, Shield, FolderSync as Sync } from 'lucide-react-native';
import { useHealthStore } from '@/store/healthStore';
import { useNetworkStore } from '@/store/networkStore';

export default function RecordsScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('records');
  const { healthRecords, prescriptions, symptomHistory } = useHealthStore();
  const { isOnline } = useNetworkStore();

  const mockHealthRecords = [
    {
      id: 1,
      type: t('records.recordTypes.bloodTest'),
      date: '2024-01-10',
      doctor: 'Dr. Priya Sharma',
      results: t('records.results'),
      synced: true,
      file: 'blood_test_report.pdf'
    },
    {
      id: 2,
      type: t('records.recordTypes.xrayChest'),
      date: '2024-01-05',
      doctor: 'Dr. Rajesh Kumar',
      results: 'Clear',
      synced: true,
      file: 'xray_chest.pdf'
    },
    {
      id: 3,
      type: t('records.recordTypes.generalCheckup'),
      date: '2024-01-01',
      doctor: 'Dr. Anita Gupta',
      results: 'Healthy',
      synced: false,
      file: null
    }
  ];

  const mockPrescriptions = [
    {
      id: 1,
      doctor: 'Dr. Priya Sharma',
      date: '2024-01-12',
      medicines: [
        { name: 'Paracetamol 500mg', dosage: '1 tablet twice daily', duration: '3 days' },
        { name: 'Amoxicillin 250mg', dosage: '1 capsule thrice daily', duration: '5 days' }
      ],
      instructions: 'Take medicine after food. Complete the course.',
      synced: true
    },
    {
      id: 2,
      doctor: 'Dr. Rajesh Kumar',
      date: '2024-01-08',
      medicines: [
        { name: 'Cough Syrup', dosage: '10ml twice daily', duration: '5 days' }
      ],
      instructions: 'Shake well before use.',
      synced: true
    }
  ];

  const renderHealthRecords = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('records.healthRecords')}</Text>
          {!isOnline && (
            <View style={styles.offlineIndicator}>
              <Text style={styles.offlineText}>{t('records.offlineMode')}</Text>
            </View>
          )}
        </View>
        
        {mockHealthRecords.map((record) => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              {/* <FileText size={24} color="#3B82F6" /> */}
              <View style={styles.recordInfo}>
                <Text style={styles.recordType}>{record.type}</Text>
                <Text style={styles.recordDoctor}>by {record.doctor}</Text>
              </View>
              <View style={styles.recordStatus}>
                {record.synced ? (
                  <View style={styles.syncedBadge}>
                    {/* <Sync size={12} color="#22C55E" /> */}
                    <Text style={styles.syncedText}>{t('common.synced')}</Text>
                  </View>
                ) : (
                  <View style={styles.pendingBadge}>
                    {/* <Sync size={12} color="#F59E0B" /> */}
                    <Text style={styles.pendingText}>{t('common.pending')}</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.recordDetails}>
              <View style={styles.recordMeta}>
                {/* <Calendar size={16} color="#6B7280" /> */}
                <Text style={styles.recordDate}>
                  {new Date(record.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.recordResults}>{t('records.results')}: {record.results}</Text>
            </View>
            
            <View style={styles.recordActions}>
              <TouchableOpacity style={styles.actionButton}>
                {/* <Eye size={16} color="#3B82F6" /> */}
                <Text style={styles.actionButtonText}>{t('records.view')}</Text>
              </TouchableOpacity>
              {record.file && (
                <TouchableOpacity style={styles.actionButton}>
                  {/* <Download size={16} color="#22C55E" /> */}
                  <Text style={styles.actionButtonText}>{t('records.download')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderPrescriptions = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('records.prescriptions')}</Text>
        
        {mockPrescriptions.map((prescription) => (
          <View key={prescription.id} style={styles.prescriptionCard}>
            <View style={styles.prescriptionHeader}>
              {/* <User size={20} color="#8B5CF6" /> */}
              <View style={styles.prescriptionInfo}>
                <Text style={styles.prescriptionDoctor}>{prescription.doctor}</Text>
                <Text style={styles.prescriptionDate}>
                  {new Date(prescription.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.syncedBadge}>
                {/* <Sync size={12} color="#22C55E" /> */}
                <Text style={styles.syncedText}>{t('common.synced')}</Text>
              </View>
            </View>
            
            <View style={styles.medicinesContainer}>
              <Text style={styles.medicinesTitle}>{t('records.medicines')}:</Text>
              {prescription.medicines.map((medicine, index) => (
                <View key={index} style={styles.medicineItem}>
                  <Text style={styles.medicineName}>{medicine.name}</Text>
                  <Text style={styles.medicineDosage}>
                    {medicine.dosage} for {medicine.duration}
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>{t('records.instructions')}:</Text>
              <Text style={styles.instructions}>{prescription.instructions}</Text>
            </View>
            
            <TouchableOpacity style={styles.downloadButton}>
              {/* <Download size={16} color="#FFFFFF" /> */}
              <Text style={styles.downloadButtonText}>{t('records.downloadPDF')}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderSymptomHistory = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('records.symptomHistory')}</Text>
        
        {symptomHistory.length > 0 ? (
          symptomHistory.map((record) => (
            <View key={record.id} style={styles.symptomCard}>
              <View style={styles.symptomHeader}>
                {/* <FileText size={20} color="#F59E0B" /> */}
                <View style={styles.symptomInfo}>
                  <Text style={styles.symptomDate}>
                    {new Date(record.timestamp).toLocaleDateString()}
                  </Text>
                  <Text style={styles.symptomSeverity}>
                    {t('records.severity')}: {record.severity}
                  </Text>
                </View>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: 
                    record.severity === 'mild' ? '#DCFCE7' :
                    record.severity === 'moderate' ? '#FEF3C7' : '#FEE2E2'
                  }
                ]}>
                  <Text style={[
                    styles.severityText,
                    { color: 
                      record.severity === 'mild' ? '#16A34A' :
                      record.severity === 'moderate' ? '#D97706' : '#DC2626'
                    }
                  ]}>
                    {record.severity}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.symptomDescription}>{record.symptoms}</Text>
              
              {record.duration && (
                <Text style={styles.symptomDuration}>
                  {t('records.duration')}: {record.duration}
                </Text>
              )}
              
              <View style={styles.symptomFooter}>
                {record.synced ? (
                  <View style={styles.syncedBadge}>
                    {/* <Sync size={12} color="#22C55E" /> */}
                    <Text style={styles.syncedText}>{t('common.synced')}</Text>
                  </View>
                ) : (
                  <View style={styles.pendingBadge}>
                    {/* <Sync size={12} color="#F59E0B" /> */}
                    <Text style={styles.pendingText}>{t('records.willSyncWhenOnline')}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            {/* <FileText size={48} color="#9CA3AF" /> */}
            <Text style={styles.emptyStateText}>{t('records.noSymptomHistory')}</Text>
            <Text style={styles.emptyStateSubtext}>
              {t('records.symptomsWillAppear')}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('records.title')}</Text>
        <View style={styles.securityIndicator}>
          {/* <Shield size={16} color="#22C55E" /> */}
          <Text style={styles.securityText}>{t('records.encryptedSecure')}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'records' && styles.activeTab]}
          onPress={() => setActiveTab('records')}
        >
          <Text style={[styles.tabText, activeTab === 'records' && styles.activeTabText]}>
            {t('records.healthRecords')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'prescriptions' && styles.activeTab]}
          onPress={() => setActiveTab('prescriptions')}
        >
          <Text style={[styles.tabText, activeTab === 'prescriptions' && styles.activeTabText]}>
            {t('records.prescriptions')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'symptoms' && styles.activeTab]}
          onPress={() => setActiveTab('symptoms')}
        >
          <Text style={[styles.tabText, activeTab === 'symptoms' && styles.activeTabText]}>
            {t('records.symptoms')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'records' && renderHealthRecords()}
      {activeTab === 'prescriptions' && renderPrescriptions()}
      {activeTab === 'symptoms' && renderSymptomHistory()}
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  securityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '600',
    marginLeft: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#22C55E',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#22C55E',
  },
  tabContent: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  offlineIndicator: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  offlineText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recordInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recordType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  recordDoctor: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  recordStatus: {
    alignItems: 'flex-end',
  },
  syncedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncedText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
    marginLeft: 4,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
    marginLeft: 4,
  },
  recordDetails: {
    marginBottom: 12,
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  recordResults: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  recordActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 4,
  },
  prescriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  prescriptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  prescriptionDoctor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  prescriptionDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  medicinesContainer: {
    marginBottom: 16,
  },
  medicinesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  medicineItem: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  medicineDosage: {
    fontSize: 14,
    color: '#6B7280',
  },
  instructionsContainer: {
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  downloadButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  symptomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  symptomHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  symptomInfo: {
    flex: 1,
    marginLeft: 12,
  },
  symptomDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  symptomSeverity: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  symptomDescription: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 8,
  },
  symptomDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  symptomFooter: {
    alignItems: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});