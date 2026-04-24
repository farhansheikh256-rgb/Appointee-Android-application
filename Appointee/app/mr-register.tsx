import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

// Change based on device:
// Web: http://localhost:8000/api
// Android Emulator: http://10.0.2.2:8000/api
// Physical Device: http://YOUR_IP:8000/api
const API_BASE_URL = 'http://localhost:8000/api';

type UploadFile = {
  uri: string;
  type: string;
  name: string;
};

export default function MRRegistration() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [formData, setFormData] = useState({
    mr_name: '',
    mr_email: '',
    mr_company_name: '',
    mr_city: '',
    mr_region: '',
    mr_address: '',
    mr_password: '',
    confirmPassword: '',
    experience_years: '',
  });

  const [certificate, setCertificate] = useState<UploadFile | null>(null);
  const [profilePicture, setProfilePicture] = useState<UploadFile | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/mr/send-otp`, {
        mobileNumber,
      });

      if (response.data.success) {
        setVerificationId(response.data.verificationId);
        setStep(2);
        startCountdown(60);
        Alert.alert('Success', 'OTP sent successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.log('[SEND OTP ERROR]', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 4) {
      Alert.alert('Error', 'Please enter the 4-digit OTP');
      return;
    }

    if (!verificationId) {
      Alert.alert('Error', 'Please request OTP first');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/mr/verify-otp`, {
        mobileNumber,
        otpCode,
        verificationId,
      });

      if (response.data.success) {
        setStep(3);
        Alert.alert('Success', 'Mobile number verified successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Invalid OTP');
      }
    } catch (error: any) {
      console.log('[VERIFY OTP ERROR]', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) {
      Alert.alert('Please wait', `Wait ${countdown} seconds before resending`);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/mr/resend-otp`, {
        mobileNumber,
      });

      if (response.data.success) {
        setVerificationId(response.data.verificationId);
        startCountdown(60);
        Alert.alert('Success', 'OTP resent successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      console.log('[RESEND OTP ERROR]', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const pickProfilePicture = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission Needed', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];

      const file: UploadFile = {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `profile_${Date.now()}.jpg`,
      };

      setProfilePicture(file);
      setProfilePreview(asset.uri);
    }
  };

  const pickCertificate = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];

      const file: UploadFile = {
        uri: asset.uri,
        type: asset.mimeType || 'application/octet-stream',
        name: asset.name || `certificate_${Date.now()}`,
      };

      setCertificate(file);

      if (file.type.startsWith('image/')) {
        setCertificatePreview(file.uri);
      } else {
        setCertificatePreview(null);
      }
    }
  };

  const validateForm = () => {
    if (!formData.mr_name.trim()) {
      Alert.alert('Error', 'Please enter full name');
      return false;
    }

    if (!formData.mr_email.trim()) {
      Alert.alert('Error', 'Please enter email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.mr_email)) {
      Alert.alert('Error', 'Invalid email');
      return false;
    }

    if (!formData.mr_company_name.trim()) {
      Alert.alert('Error', 'Please enter company name');
      return false;
    }

    if (!formData.mr_city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return false;
    }

    if (!formData.mr_region.trim()) {
      Alert.alert('Error', 'Please enter region');
      return false;
    }

    if (!formData.mr_address.trim()) {
      Alert.alert('Error', 'Please enter address');
      return false;
    }

    if (!formData.mr_password || formData.mr_password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    if (formData.mr_password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (!certificate) {
      Alert.alert('Error', 'Please upload certificate');
      return false;
    }

    if (!profilePicture) {
      Alert.alert('Error', 'Please upload profile picture');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setUploading(true);

    try {
      const payload = new FormData();

      payload.append('mr_name', formData.mr_name.trim());
      payload.append('mr_email', formData.mr_email.trim().toLowerCase());
      payload.append('mr_mobile_number', mobileNumber);
      payload.append('mr_company_name', formData.mr_company_name.trim());
      payload.append('mr_city', formData.mr_city.trim());
      payload.append('mr_region', formData.mr_region.trim());
      payload.append('mr_address', formData.mr_address.trim());
      payload.append('mr_password', formData.mr_password);
      payload.append('experience_years', formData.experience_years || '0');

      if (certificate) {
        if (Platform.OS === 'web') {
          const certRes = await fetch(certificate.uri);
          const certBlob = await certRes.blob();
          payload.append('certificate', certBlob, certificate.name);
        } else {
          payload.append('certificate', {
            uri: certificate.uri,
            type: certificate.type,
            name: certificate.name,
          } as any);
        }
      }

      if (profilePicture) {
        if (Platform.OS === 'web') {
          const imgRes = await fetch(profilePicture.uri);
          const imgBlob = await imgRes.blob();
          payload.append('profile_picture', imgBlob, profilePicture.name);
        } else {
          payload.append('profile_picture', {
            uri: profilePicture.uri,
            type: profilePicture.type,
            name: profilePicture.name,
          } as any);
        }
      }

      const response = await axios.post(`${API_BASE_URL}/mr/register`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
        timeout: 60000,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Registration completed successfully!', [
          {
            text: 'OK',
            onPress: () => router.replace('/mr-login'),
          },
        ]);
      } else {
        Alert.alert('Failed', response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.log('[REGISTER ERROR]', error.response?.data || error.message);

      if (error.response) {
        Alert.alert(
          'Registration Failed',
          error.response.data?.message || 'Something went wrong'
        );
      } else if (error.request) {
        Alert.alert('Server Error', 'Cannot connect to backend');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="business" size={60} color="#7C3AED" />
      </View>

      <Text style={styles.title}>MR Registration</Text>
      <Text style={styles.subtitle}>Enter mobile number</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="phone-android" size={20} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          keyboardType="phone-pad"
          maxLength={10}
          value={mobileNumber}
          onChangeText={setMobileNumber}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSendOTP}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
        <MaterialIcons name="arrow-back" size={24} color="#7C3AED" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Sent to {mobileNumber}</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="security" size={20} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="OTP"
          keyboardType="number-pad"
          maxLength={4}
          value={otpCode}
          onChangeText={setOtpCode}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResendOTP} style={styles.resendButton}>
        <Text style={styles.resendText}>
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <KeyboardAvoidingView
      style={styles.stepContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
          <MaterialIcons name="arrow-back" size={24} color="#7C3AED" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Complete Registration</Text>

        {[
          ['person', 'Full Name', 'mr_name'],
          ['email', 'Email', 'mr_email'],
          ['business', 'Company Name', 'mr_company_name'],
          ['location-city', 'City', 'mr_city'],
          ['map', 'Region', 'mr_region'],
          ['work', 'Years of Experience', 'experience_years'],
        ].map((item: any, index) => (
          <View style={styles.inputContainer} key={index}>
            <MaterialIcons name={item[0]} size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={item[1]}
              value={(formData as any)[item[2]]}
              onChangeText={(text) =>
                setFormData({ ...formData, [item[2]]: text })
              }
            />
          </View>
        ))}

        <View style={styles.inputContainer}>
          <MaterialIcons name="location-on" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Address"
            multiline
            value={formData.mr_address}
            onChangeText={(text) =>
              setFormData({ ...formData, mr_address: text })
            }
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Password"
            value={formData.mr_password}
            onChangeText={(text) =>
              setFormData({ ...formData, mr_password: text })
            }
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="lock-outline" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) =>
              setFormData({ ...formData, confirmPassword: text })
            }
          />
        </View>

        <Text style={styles.sectionTitle}>Upload Documents</Text>

        <TouchableOpacity style={styles.uploadButton} onPress={pickProfilePicture}>
          <MaterialIcons name="photo-camera" size={24} color="#7C3AED" />
          <Text style={styles.uploadButtonText}>
            {profilePicture ? profilePicture.name : 'Upload Profile Picture'}
          </Text>
        </TouchableOpacity>

        {profilePreview && (
          <Image source={{ uri: profilePreview }} style={styles.previewImage} />
        )}

        <TouchableOpacity style={styles.uploadButton} onPress={pickCertificate}>
          <MaterialIcons name="description" size={24} color="#7C3AED" />
          <Text style={styles.uploadButtonText}>
            {certificate ? certificate.name : 'Upload Certificate'}
          </Text>
        </TouchableOpacity>

        {certificatePreview ? (
          <Image source={{ uri: certificatePreview }} style={styles.previewImage} />
        ) : certificate ? (
          <Text style={styles.fileText}>{certificate.name}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, uploading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Complete Registration</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MR Onboarding</Text>
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E293B',
  },
  stepContainer: { flex: 1, padding: 20 },
  iconContainer: { alignItems: 'center', marginVertical: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  button: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#7C3AED',
    marginLeft: 8,
    fontSize: 16,
  },
  resendButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  resendText: {
    color: '#7C3AED',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 14,
    color: '#1E293B',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  uploadButtonText: {
    marginLeft: 12,
    color: '#7C3AED',
    flex: 1,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 12,
  },
  fileText: {
    color: '#475569',
    marginBottom: 12,
  },
});