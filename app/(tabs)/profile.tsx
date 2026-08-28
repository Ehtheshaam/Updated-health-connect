import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { User, Settings, LogOut, CreditCard as Edit, Save, Phone, MapPin, Calendar, Shield, Globe, CircleHelp as HelpCircle } from 'lucide-react-native';
import { useHealthStore } from '@/store/healthStore';
import LanguageSelector from '@/components/LanguageSelector';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { user, updateUser, logout } = useHealthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [editedUser, setEditedUser] = useState(user || {
    username: '',
    password: '',
    name: t('common.welcome'),
    phone: '',
    age: '',
    gender: '',
    address: '',
    emergencyContact: '',
    language: 'Hindi'
  });

  const handleSaveProfile = () => {
    updateUser(editedUser);
    setIsEditing(false);
    Alert.alert(t('common.success'), t('profile.profileUpdated'));
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirmation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('profile.logout'), onPress: logout, style: 'destructive' }
      ]
    );
  };

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      setShowLanguageSelector(false);
      Alert.alert(t('common.success'), 'Language changed successfully');
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  if (showLanguageSelector) {
    return (
      <View style={styles.container}>
        <View style={styles.languageSelectorHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowLanguageSelector(false)}
          >
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
        <LanguageSelector 
          onLanguageSelect={handleLanguageChange} 
          showTitle={false}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <User size={40} color="#FFFFFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{editedUser.name}</Text>
            <Text style={styles.userType}>{t('profile.patientAccount')}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <Save size={20} color="#22C55E" />
            ) : (
              <Edit size={20} color="#3B82F6" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.personalInformation')}</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <User size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.fullName')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedUser.name}
                  onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
                  placeholder={t('profile.enterFullName')}
                />
              ) : (
                <Text style={styles.infoValue}>{editedUser.name}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.phoneNumber')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedUser.phone}
                  onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
                  placeholder={t('profile.enterPhoneNumber')}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{editedUser.phone || t('profile.notProvided')}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.age')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedUser.age}
                  onChangeText={(text) => setEditedUser({ ...editedUser, age: text })}
                  placeholder={t('profile.enterAge')}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.infoValue}>{editedUser.age ? `${editedUser.age} ${t('profile.years')}` : t('profile.notProvided')}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <User size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.gender')}</Text>
              {isEditing ? (
                <View style={styles.genderOptions}>
                  {[
                    { key: 'male', label: t('profile.genderOptions.male') },
                    { key: 'female', label: t('profile.genderOptions.female') },
                    { key: 'other', label: t('profile.genderOptions.other') }
                  ].map((gender) => (
                    <TouchableOpacity
                      key={gender.key}
                      style={[
                        styles.genderOption,
                        editedUser.gender === gender.key && styles.selectedGender
                      ]}
                      onPress={() => setEditedUser({ ...editedUser, gender: gender.key })}
                    >
                      <Text style={[
                        styles.genderText,
                        editedUser.gender === gender.key && styles.selectedGenderText
                      ]}>
                        {gender.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.infoValue}>
                  {editedUser.gender ? t(`profile.genderOptions.${editedUser.gender}`) : t('profile.notProvided')}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.address')}</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editedUser.address}
                  onChangeText={(text) => setEditedUser({ ...editedUser, address: text })}
                  placeholder={t('profile.enterAddress')}
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <Text style={styles.infoValue}>{editedUser.address || t('profile.notProvided')}</Text>
              )}
            </View>
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Emergency Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.emergencyContact')}</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Phone size={20} color="#EF4444" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.emergencyPhone')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedUser.emergencyContact}
                  onChangeText={(text) => setEditedUser({ ...editedUser, emergencyContact: text })}
                  placeholder={t('profile.enterEmergencyContact')}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{editedUser.emergencyContact || t('profile.notProvided')}</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setShowLanguageSelector(true)}
        >
          <Globe size={20} color="#3B82F6" />
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>{t('profile.language')}</Text>
            <Text style={styles.settingValue}>
              {i18n.language === 'hi' ? t('languageSelection.hindi') : t('languageSelection.english')}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Shield size={20} color="#22C55E" />
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>{t('profile.privacySettings')}</Text>
            <Text style={styles.settingValue}>{t('profile.manageDataPrivacy')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <HelpCircle size={20} color="#8B5CF6" />
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>{t('profile.helpSupport')}</Text>
            <Text style={styles.settingValue}>{t('profile.getHelpContactSupport')}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Health Worker Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.communityHealthWorker')}</Text>
        
        <View style={styles.workerModeCard}>
          <Text style={styles.workerModeText}>
            {t('profile.healthWorkerDescription')}
          </Text>
          <TouchableOpacity style={styles.workerModeButton}>
            <Text style={styles.workerModeButtonText}>{t('profile.switchToHealthWorkerMode')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.appInformation')}</Text>
        
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{t('profile.appName')}</Text>
          <Text style={styles.appVersion}>{t('profile.appVersion')}</Text>
          <Text style={styles.appDescription}>
            {t('profile.appDescription')}
          </Text>
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  userType: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  editButton: {
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
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
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  selectedGender: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  genderText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedGenderText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  workerModeCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  workerModeText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    marginBottom: 8,
  },
  workerModeTextHindi: {
    fontSize: 14,
    color: '#3730A3',
    lineHeight: 20,
    marginBottom: 16,
  },
  workerModeButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  workerModeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  appInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  languageSelectorHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
});