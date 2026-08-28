import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, type CameraCapturedPicture, useCameraPermissions } from 'expo-camera';
import {
  BadgeCheck,
  Building2,
  Camera,
  CalendarDays,
  Clock3,
  FileUp,
  MapPin,
  ShieldCheck,
  User,
  Video,
  X,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useHealthStore } from '@/store/healthStore';

type Provider = {
  id: number;
  hospital: string;
  doctor: string;
  specialty: string;
  time: string;
  distance: string;
  fee: string;
  city: string;
};

const providers: Provider[] = [
  {
    id: 1,
    hospital: 'Fortis Hospital, Mohali',
    doctor: 'Dr. Meera Sharma',
    specialty: 'General Medicine',
    time: 'Today, 6:30 PM',
    distance: 'Mohali, Punjab',
    fee: 'Rs. 600 consult',
    city: 'Mohali',
  },
  {
    id: 2,
    hospital: 'PGIMER, Chandigarh',
    doctor: 'Dr. Arjun Patel',
    specialty: 'Internal Medicine',
    time: 'Today, 8:00 PM',
    distance: 'Chandigarh',
    fee: 'Rs. 500 consult',
    city: 'Chandigarh',
  },
  {
    id: 3,
    hospital: 'Dayanand Medical College',
    doctor: 'Dr. Nisha Verma',
    specialty: 'Women Health',
    time: 'Tomorrow, 10:15 AM',
    distance: 'Ludhiana, Punjab',
    fee: 'Rs. 700 consult',
    city: 'Ludhiana',
  },
  {
    id: 4,
    hospital: 'Homi Bhabha Cancer Hospital',
    doctor: 'Dr. Sandeep Gill',
    specialty: 'Specialist Care',
    time: 'Tomorrow, 2:30 PM',
    distance: 'Sangrur, Punjab',
    fee: 'Rs. 650 consult',
    city: 'Sangrur',
  },
];

export default function ConsultationScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<CameraCapturedPicture | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selfieConfirmed, setSelfieConfirmed] = useState(false);
  const [reportAttached, setReportAttached] = useState(true);

  const { user, lastSymptomReport, addConsultBooking, consultBookings } = useHealthStore();

  useEffect(() => {
    if (user) {
      setPatientName(user.name || user.username || '');
      setUsername(user.username || user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const latestBooking = consultBookings[0];

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Camera permission needed', 'Please allow camera access to take your trust-check selfie.');
        return;
      }
    }

    setCameraOpen(true);
  };

  const takeSelfie = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.75, skipProcessing: true });
      if (photo) {
        setCapturedPhoto(photo);
        setCameraOpen(false);
      }
    } catch {
      Alert.alert('Camera error', 'We could not capture the selfie. Please try again.');
    }
  };

  const openBookingForm = (provider: Provider) => {
    setSelectedProvider(provider);
    setReportAttached(Boolean(lastSymptomReport));
    setAppointmentDate('');
    setAppointmentTime('');
    setSelfieConfirmed(false);
    setShowBookingForm(true);
  };

  const submitBooking = () => {
    if (!selectedProvider) return;

    if (!lastSymptomReport) {
      Alert.alert(
        'Check symptoms first',
        'Please open the Symptoms tab and run the symptom checker before booking this consult.'
      );
      router.push('/symptoms');
      return;
    }

    if (!patientName.trim() || !username.trim()) {
      Alert.alert('Missing details', 'Please confirm your registered name and username.');
      return;
    }

    if (!appointmentDate.trim() || !appointmentTime.trim()) {
      Alert.alert('Missing details', 'Please add the date and time for the consult request.');
      return;
    }

    if (!capturedPhoto) {
      Alert.alert('Selfie required', 'Please capture a face + Aadhar card selfie before submitting.');
      return;
    }

    if (!selfieConfirmed) {
      Alert.alert('Confirm selfie', 'Please confirm that your face and Aadhar card are clearly visible in the selfie.');
      return;
    }

    if (!reportAttached) {
      Alert.alert('Symptom report required', 'Please attach the symptom checker report to continue.');
      return;
    }

    addConsultBooking({
      id: Date.now().toString(),
      patientName: patientName.trim(),
      username: username.trim(),
      hospital: selectedProvider.hospital,
      doctor: selectedProvider.doctor,
      date: appointmentDate.trim(),
      time: appointmentTime.trim(),
      symptomsReportId: lastSymptomReport.id,
      selfieConfirmed: true,
      status: 'Pending hospital acceptance',
      createdAt: new Date().toISOString(),
    });

    setShowBookingForm(false);
    Alert.alert(
      'Booking submitted',
      'Your consult request is now pending. Please wait till the hospital accepts the booking.'
    );
  };

  const attachedReportText = lastSymptomReport
    ? `${lastSymptomReport.disease} - ${lastSymptomReport.recommendation}`
    : 'No symptom report found. Please check symptoms first.';

  const dateOptions = [
    '10 Jul 2026',
    '11 Jul 2026',
    '12 Jul 2026',
    '13 Jul 2026',
    '14 Jul 2026',
  ];

  const timeOptions = [
    '09:00 AM',
    '10:30 AM',
    '12:00 PM',
    '03:00 PM',
    '05:30 PM',
    '07:00 PM',
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIconWrap}>
            <Video size={28} color="#0F766E" />
          </View>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>Trust Consult Booking</Text>
            <Text style={styles.heroSubtitle}>
              Take a selfie while holding your Aadhar card or another ID card, then book a consult with a symptom report.
            </Text>
          </View>
        </View>

        <View style={styles.guidanceBox}>
          <ShieldCheck size={18} color="#0F766E" />
          <Text style={styles.guidanceText}>
            We do not auto-detect the card yet. Keep your face and the card visible in the selfie for hospital trust review.
          </Text>
        </View>

        <View style={styles.heroActions}>
          <TouchableOpacity style={styles.primaryButton} onPress={openCamera} activeOpacity={0.85}>
            <Camera size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Take Trust Selfie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => openBookingForm(providers[0])}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Book Consult</Text>
          </TouchableOpacity>
        </View>

        {capturedPhoto ? (
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Captured trust selfie</Text>
            <Image source={{ uri: capturedPhoto.uri }} style={styles.previewImage} />
          </View>
        ) : null}

        {cameraOpen ? (
          <View style={styles.inlineCameraBlock}>
            <View style={styles.cameraHeader}>
              <Text style={styles.cameraTitle}>Trust selfie check</Text>
              <TouchableOpacity onPress={() => setCameraOpen(false)} style={styles.closeButtonDark}>
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.cameraHint}>
              Keep your face and Aadhar card visible together in the frame. We only guide the user here; card detection is not active yet.
            </Text>

            {permission?.granted ? (
              <View style={styles.cameraFrame}>
                <CameraView ref={cameraRef} style={styles.camera} facing="front" />
              </View>
            ) : (
              <View style={styles.permissionCard}>
                <Text style={styles.permissionText}>Camera access is required to take the trust-check selfie.</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={openCamera} activeOpacity={0.85}>
                  <Camera size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Grant Camera Access</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.captureButton} onPress={takeSelfie} activeOpacity={0.85}>
              <Text style={styles.captureButtonText}>Capture Selfie</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {latestBooking ? (
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <BadgeCheck size={18} color="#16A34A" />
            <Text style={styles.statusTitle}>Latest consult request</Text>
          </View>
          <Text style={styles.statusText}>{latestBooking.patientName}</Text>
          <Text style={styles.statusMeta}>{latestBooking.hospital}</Text>
          <Text style={styles.statusMeta}>{latestBooking.status}</Text>
          <Text style={styles.statusHint}>Wait until the hospital accepts the booking.</Text>
        </View>
      ) : null}

      {showBookingForm ? (
        <View style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <Text style={styles.bookingTitle}>Consult registration</Text>
            <TouchableOpacity onPress={() => setShowBookingForm(false)} style={styles.closeButton}>
              <X size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Registered name</Text>
            <View style={styles.inputWrap}>
              <User size={18} color="#64748B" />
              <TextInput
                style={styles.input}
                value={patientName}
                onChangeText={setPatientName}
                placeholder="Enter your registered name"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Login username</Text>
            <View style={styles.inputWrap}>
              <User size={18} color="#64748B" />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Phone number</Text>
            <TextInput
              style={styles.simpleInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Choose hospital</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hospitalRow}>
              {providers.map((provider) => {
                const isSelected = selectedProvider?.id === provider.id;
                return (
                  <TouchableOpacity
                    key={provider.id}
                    style={[styles.hospitalChip, isSelected && styles.hospitalChipSelected]}
                    onPress={() => setSelectedProvider(provider)}
                  >
                    <Text style={[styles.hospitalChipTitle, isSelected && styles.hospitalChipTitleSelected]}>
                      {provider.hospital}
                    </Text>
                    <Text style={[styles.hospitalChipMeta, isSelected && styles.hospitalChipMetaSelected]}>
                      {provider.city} - {provider.doctor}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Date and time</Text>
            <View style={styles.rowInputs}>
              <TouchableOpacity style={styles.rowField} onPress={() => setShowDatePicker(true)} activeOpacity={0.9}>
                <CalendarDays size={18} color="#64748B" />
                <Text style={styles.pickerValue}>{appointmentDate || 'Choose date'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rowField} onPress={() => setShowTimePicker(true)} activeOpacity={0.9}>
                <Clock3 size={18} color="#64748B" />
                <Text style={styles.pickerValue}>{appointmentTime || 'Choose time'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Pick a date from the calendar and a time slot from the list.</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Symptom checker report</Text>
            {lastSymptomReport ? (
              <View style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <FileUp size={18} color="#0F766E" />
                  <Text style={styles.reportTitle}>Uploaded from symptom checker</Text>
                </View>
                <Text style={styles.reportText}>{attachedReportText}</Text>
                <TouchableOpacity
                  style={styles.reportToggle}
                  onPress={() => setReportAttached((value) => !value)}
                >
                  <Text style={styles.reportToggleText}>
                    {reportAttached ? 'Remove report' : 'Attach report'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.warningCard}>
                <Text style={styles.warningText}>
                  No report found yet. Please check your symptoms first and then come back to book the consult.
                </Text>
                <TouchableOpacity style={styles.warningButton} onPress={() => router.push('/symptoms')}>
                  <Text style={styles.warningButtonText}>Open Symptoms Checker</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Trust selfie</Text>
            <View style={styles.trustCard}>
              <Text style={styles.trustText}>
                Hold your face and Aadhar card in the same frame, then capture the selfie.
              </Text>
              <TouchableOpacity style={styles.trustButton} onPress={openCamera} activeOpacity={0.85}>
                <Camera size={18} color="#FFFFFF" />
                <Text style={styles.trustButtonText}>Capture selfie</Text>
              </TouchableOpacity>
              {capturedPhoto ? (
                <Image source={{ uri: capturedPhoto.uri }} style={styles.trustPreview} />
              ) : null}
              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => setSelfieConfirmed((value) => !value)}
              >
                <View style={[styles.checkbox, selfieConfirmed && styles.checkboxSelected]}>
                  {selfieConfirmed ? <BadgeCheck size={14} color="#FFFFFF" /> : null}
                </View>
                <Text style={styles.checkText}>
                  I confirm that my face and Aadhar card are clearly visible.
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={submitBooking} activeOpacity={0.9}>
            <Text style={styles.submitButtonText}>Submit booking</Text>
          </TouchableOpacity>

          <Text style={styles.submitHint}>After submission, wait till the hospital accepts the booking.</Text>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nearby hospitals in Punjab</Text>
        <Text style={styles.sectionSubtitle}>Choose a real or nearby hospital provider for a remote consult request.</Text>
      </View>

      {providers.map((provider) => (
        <View key={provider.id} style={styles.providerCard}>
          <View style={styles.providerTopRow}>
            <View style={styles.providerBadge}>
              <Building2 size={16} color="#0F766E" />
            </View>
            <View style={styles.providerMeta}>
              <Text style={styles.providerHospital}>{provider.hospital}</Text>
              <Text style={styles.providerDoctor}>{provider.doctor}</Text>
            </View>
            <View style={styles.verifiedPill}>
              <BadgeCheck size={14} color="#16A34A" />
              <Text style={styles.verifiedText}>Trusted</Text>
            </View>
          </View>

          <Text style={styles.providerSpecialty}>{provider.specialty}</Text>

          <View style={styles.providerDetails}>
            <View style={styles.detailItem}>
              <Clock3 size={14} color="#6B7280" />
              <Text style={styles.detailText}>{provider.time}</Text>
            </View>
            <View style={styles.detailItem}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.detailText}>{provider.distance}</Text>
            </View>
          </View>

          <View style={styles.providerFooter}>
            <Text style={styles.providerFee}>{provider.fee}</Text>
            <TouchableOpacity style={styles.bookButton} activeOpacity={0.85} onPress={() => openBookingForm(provider)}>
              <Text style={styles.bookButtonText}>Book Consult</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerModalCard}>
            <Text style={styles.pickerModalTitle}>Select date</Text>
            {dateOptions.map((date) => (
              <TouchableOpacity key={date} style={styles.pickerOption} onPress={() => { setAppointmentDate(date); setShowDatePicker(false); }}>
                <Text style={styles.pickerOptionText}>{date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerModalCard}>
            <Text style={styles.pickerModalTitle}>Select time</Text>
            {timeOptions.map((time) => (
              <TouchableOpacity key={time} style={styles.pickerOption} onPress={() => { setAppointmentTime(time); setShowTimePicker(false); }}>
                <Text style={styles.pickerOptionText}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7F6',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#D6F5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },
  guidanceBox: {
    marginTop: 14,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  guidanceText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#0F766E',
    fontWeight: '600',
  },
  heroActions: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
  previewCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
  },
  previewLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
  },
  inlineCameraBlock: {
    marginTop: 16,
    padding: 14,
    borderRadius: 24,
    backgroundColor: '#0F172A',
  },
  statusCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
  },
  statusMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },
  statusHint: {
    marginTop: 10,
    fontSize: 13,
    color: '#0F766E',
    fontWeight: '600',
  },
  bookingCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  bookingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  simpleInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  hospitalRow: {
    gap: 12,
  },
  hospitalChip: {
    width: 220,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#F8FAFC',
  },
  hospitalChipSelected: {
    borderColor: '#0F766E',
    backgroundColor: '#ECFDF5',
  },
  hospitalChipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  hospitalChipTitleSelected: {
    color: '#0F766E',
  },
  hospitalChipMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 16,
  },
  hospitalChipMetaSelected: {
    color: '#0F766E',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  rowField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
  },
  pickerValue: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748B',
  },
  reportCard: {
    borderWidth: 1,
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 14,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F766E',
  },
  reportText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: '#065F46',
  },
  reportToggle: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#D1FAE5',
  },
  reportToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  warningCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FEF3C7',
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#92400E',
  },
  warningButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#92400E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  warningButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  trustCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trustText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
  },
  trustButton: {
    marginTop: 12,
    backgroundColor: '#0F766E',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  trustButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  trustPreview: {
    marginTop: 12,
    width: '100%',
    height: 180,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
  },
  checkRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#0F766E',
  },
  checkText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 6,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  submitHint: {
    marginTop: 10,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },
  providerCard: {
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
  providerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E6FFFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  providerMeta: {
    flex: 1,
  },
  providerHospital: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  providerDoctor: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  verifiedText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '700',
  },
  providerSpecialty: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F766E',
  },
  providerDetails: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  providerFooter: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providerFee: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  bookButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#0F172A',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cameraOverlay: {
    marginTop: 20,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 14,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cameraTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  closeButtonDark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraHint: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  cameraFrame: {
    height: 420,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  camera: {
    flex: 1,
  },
  permissionCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 18,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    color: '#E2E8F0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 20,
  },
  captureButton: {
    marginTop: 12,
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  pickerModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  pickerOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pickerOptionText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
});
