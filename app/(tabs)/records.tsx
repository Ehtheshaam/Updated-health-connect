import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
// import { FileText, Download, Eye, Calendar, User, Shield, FolderSync as Sync } from 'lucide-react-native';
import { useHealthStore } from '@/store/healthStore';
import { useNetworkStore } from '@/store/networkStore';
import api from '@/src/services/api';

export default function RecordsScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('records');
  const { healthRecords, prescriptions, symptomHistory, setHealthRecords, setPrescriptions } = useHealthStore();
  const { isOnline } = useNetworkStore();
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'record' | 'prescription', data: any } | null>(null);

  const fetchRecords = useCallback(async () => {
    setIsLoadingRecords(true);
    try {
      const [recordsRes, prescriptionsRes] = await Promise.all([
        api.get('/records'),
        api.get('/prescriptions'),
      ]);
      setHealthRecords(
        recordsRes.data.map((r: any) => ({
          id: r.id,
          type: r.type,
          date: r.date,
          doctor: r.doctor,
          results: r.results,
          synced: true,
          file: r.fileUrl || null,
        }))
      );
      setPrescriptions(
        prescriptionsRes.data.map((p: any) => ({
          id: p.id,
          doctor: p.doctor,
          date: p.date,
          medicines: typeof p.medicines === 'string' ? JSON.parse(p.medicines) : p.medicines,
          instructions: p.instructions,
          instructionsHindi: '',
          synced: true,
        }))
      );
    } catch {
      // Keep whatever is already in the store
    } finally {
      setIsLoadingRecords(false);
    }
  }, [setHealthRecords, setPrescriptions]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

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
        
        {healthRecords.map((record) => (
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
                <Text style={styles.recordDate}>
                  {new Date(record.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <View style={styles.recordActions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => {
                  setSelectedItem({ type: 'record', data: record });
                  setModalVisible(true);
                }}
              >
                <Text style={styles.actionButtonText}>{t('records.view')}</Text>
              </TouchableOpacity>
              {record.file && (
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>{t('records.download')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {healthRecords.length === 0 && !isLoadingRecords && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No health records yet</Text>
            <Text style={styles.emptyStateSubtext}>Records will appear here once added.</Text>
          </View>
        )}

        {isLoadingRecords && (
          <View style={styles.emptyState}>
            <ActivityIndicator size="small" color="#22C55E" />
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderPrescriptions = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('records.prescriptions')}</Text>
        
        {prescriptions.length > 0 ? (
          prescriptions.map((prescription) => (
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
              <View style={styles.recordActions}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => {
                    setSelectedItem({ type: 'prescription', data: prescription });
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.actionButtonText}>{t('records.view')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>{t('records.downloadPDF')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No prescriptions yet</Text>
            <Text style={styles.emptyStateSubtext}>Prescriptions will appear here once added.</Text>
          </View>
        )}
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

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedItem?.type === 'record' ? 'Health Record' : 'Prescription Details'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {selectedItem?.type === 'record' && (
                <>
                  <Text style={styles.modalLabel}>Type</Text>
                  <Text style={styles.modalValue}>{selectedItem.data.type}</Text>
                  <Text style={styles.modalLabel}>Doctor</Text>
                  <Text style={styles.modalValue}>{selectedItem.data.doctor}</Text>
                  <Text style={styles.modalLabel}>Date</Text>
                  <Text style={styles.modalValue}>{new Date(selectedItem.data.date).toLocaleDateString()}</Text>
                  <Text style={styles.modalLabel}>Results</Text>
                  <Text style={styles.modalValue}>{selectedItem.data.results}</Text>
                </>
              )}
              {selectedItem?.type === 'prescription' && (
                <>
                  <Text style={styles.modalLabel}>Doctor</Text>
                  <Text style={styles.modalValue}>{selectedItem.data.doctor}</Text>
                  <Text style={styles.modalLabel}>Date</Text>
                  <Text style={styles.modalValue}>{new Date(selectedItem.data.date).toLocaleDateString()}</Text>
                  <View style={styles.medicinesContainer}>
                    <Text style={styles.medicinesTitle}>{t('records.medicines')}:</Text>
                    {selectedItem.data.medicines?.map((medicine: any, index: number) => (
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
                    <Text style={styles.instructions}>{selectedItem.data.instructions}</Text>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 22,
  },
});