import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

// For Android Emulator: http://10.0.2.2:8000/api
// For iOS Simulator: http://localhost:8000/api
// For Physical Device: http://YOUR_COMPUTER_IP:8000/api
const API_BASE_URL = 'http://localhost:8000/api';

export default function DoctorRegistration() {
  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    dr_name: '',
    dr_degree: '',
    dr_email: '',
    dr_city: '',
    dr_address: '',
    dr_password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    console.log('Component mounted');
    return () => {
      console.log('Component unmounted, cleaning up timer');
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    console.log('Current step:', step);
    console.log('Mobile Number:', mobileNumber);
    console.log('Verification ID:', verificationId);
    console.log('OTP Code:', otpCode);
  }, [step, mobileNumber, verificationId, otpCode]);

  const startCountdown = (seconds: number) => {
    console.log(`Starting countdown for ${seconds} seconds`);
    setCountdown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          console.log('Countdown finished');
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    console.log('=== SEND OTP FUNCTION CALLED ===');
    console.log('Mobile number entered:', mobileNumber);

    if (!mobileNumber || mobileNumber.length !== 10) {
      console.log('Validation failed: Invalid mobile number');
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    const requestBody = { mobileNumber: mobileNumber };
    console.log('Sending request to:', `${API_BASE_URL}/doctors/send-otp`);
    console.log('Request body:', requestBody);

    try {
      const response = await axios.post(`${API_BASE_URL}/doctors/send-otp`, requestBody);
      console.log('Response received:', response.data);
      console.log('Response status:', response.status);

      if (response.data.success) {
        console.log('OTP sent successfully, verificationId:', response.data.verificationId);
        setVerificationId(response.data.verificationId);
        setStep(2);
        startCountdown(60);
        Alert.alert('Success', 'OTP sent successfully!');
      } else {
        console.log('API returned success false:', response.data.message);
        Alert.alert('Error', response.data.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('=== SEND OTP ERROR ===');
      console.error('Error object:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        Alert.alert('Error', error.response.data?.message || 'Failed to send OTP');
      } else if (error.request) {
        console.error('No response received from server');
        Alert.alert('Error', 'Cannot connect to server. Please check your connection.');
      } else {
        console.error('Error message:', error.message);
        Alert.alert('Error', error.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
      console.log('Send OTP function completed');
    }
  };

  const handleVerifyOTP = async () => {
    console.log('=== VERIFY OTP FUNCTION CALLED ===');
    console.log('Mobile Number:', mobileNumber);
    console.log('OTP Code:', otpCode);
    console.log('Verification ID:', verificationId);

    if (!otpCode || otpCode.length !== 4) {
      console.log('Validation failed: Invalid OTP format');
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }

    if (!verificationId) {
      console.log('Validation failed: No verification ID found');
      Alert.alert('Error', 'Please request OTP first');
      return;
    }

    setLoading(true);
    const requestBody = {
      mobileNumber: mobileNumber,
      otpCode: otpCode,
      verificationId: verificationId,
    };
    console.log('Sending request to:', `${API_BASE_URL}/doctors/verify-otp`);
    console.log('Request body:', requestBody);

    try {
      const response = await axios.post(`${API_BASE_URL}/doctors/verify-otp`, requestBody);
      console.log('Response received:', response.data);
      console.log('Response status:', response.status);

      if (response.data.success) {
        console.log('OTP verified successfully!');
        console.log('Mobile number verified:', response.data.mobileNumber);
        console.log('Verification status:', response.data.verificationStatus);
        setStep(3);
        Alert.alert('Success', 'Mobile number verified successfully!');
      } else {
        console.log('API returned success false:', response.data.message);
        Alert.alert('Error', response.data.message || 'Invalid OTP');
      }
    } catch (error: any) {
      console.error('=== VERIFY OTP ERROR ===');
      console.error('Error object:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        Alert.alert('Error', error.response.data?.message || 'Invalid OTP');
      } else if (error.request) {
        console.error('No response received from server');
        Alert.alert('Error', 'Cannot connect to server. Please check your connection.');
      } else {
        console.error('Error message:', error.message);
        Alert.alert('Error', error.message || 'Invalid OTP');
      }
    } finally {
      setLoading(false);
      console.log('Verify OTP function completed');
    }
  };

  const handleResendOTP = async () => {
    console.log('=== RESEND OTP FUNCTION CALLED ===');
    console.log('Mobile Number:', mobileNumber);
    console.log('Countdown remaining:', countdown);

    if (countdown > 0) {
      console.log('Resend blocked: Countdown active');
      Alert.alert('Please wait', `Wait ${countdown} seconds before resending`);
      return;
    }

    setLoading(true);
    const requestBody = { mobileNumber: mobileNumber };
    console.log('Sending request to:', `${API_BASE_URL}/doctors/resend-otp`);
    console.log('Request body:', requestBody);

    try {
      const response = await axios.post(`${API_BASE_URL}/doctors/resend-otp`, requestBody);
      console.log('Response received:', response.data);
      console.log('Response status:', response.status);

      if (response.data.success) {
        console.log('OTP resent successfully, new verificationId:', response.data.verificationId);
        setVerificationId(response.data.verificationId);
        startCountdown(60);
        Alert.alert('Success', 'OTP resent successfully!');
      } else {
        console.log('API returned success false:', response.data.message);
        Alert.alert('Error', response.data.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      console.error('=== RESEND OTP ERROR ===');
      console.error('Error object:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        Alert.alert('Error', error.response.data?.message || 'Failed to resend OTP');
      } else if (error.request) {
        console.error('No response received from server');
        Alert.alert('Error', 'Cannot connect to server. Please check your connection.');
      } else {
        console.error('Error message:', error.message);
        Alert.alert('Error', error.message || 'Failed to resend OTP');
      }
    } finally {
      setLoading(false);
      console.log('Resend OTP function completed');
    }
  };

  const handleRegister = async () => {
    console.log('=== REGISTER FUNCTION CALLED ===');
    console.log('Form Data:', formData);
    console.log('Mobile Number:', mobileNumber);

    if (!formData.dr_name.trim()) {
      console.log('Validation failed: Name is empty');
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    if (!formData.dr_degree.trim()) {
      console.log('Validation failed: Degree is empty');
      Alert.alert('Error', 'Please enter your degree');
      return;
    }
    if (!formData.dr_email.trim()) {
      console.log('Validation failed: Email is empty');
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.dr_email)) {
      console.log('Validation failed: Invalid email format');
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!formData.dr_city.trim()) {
      console.log('Validation failed: City is empty');
      Alert.alert('Error', 'Please enter your city');
      return;
    }
    if (!formData.dr_address.trim()) {
      console.log('Validation failed: Address is empty');
      Alert.alert('Error', 'Please enter your address');
      return;
    }
    if (!formData.dr_password) {
      console.log('Validation failed: Password is empty');
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    if (formData.dr_password.length < 6) {
      console.log('Validation failed: Password too short');
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (formData.dr_password !== formData.confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    const requestBody = {
      dr_name: formData.dr_name,
      dr_degree: formData.dr_degree,
      dr_email: formData.dr_email,
      dr_mobile_number: mobileNumber,
      dr_city: formData.dr_city,
      dr_address: formData.dr_address,
      dr_password: formData.dr_password,
    };
    console.log('Sending request to:', `${API_BASE_URL}/doctors/register`);
    console.log('Request body:', requestBody);

    try {
      const response = await axios.post(`${API_BASE_URL}/doctors/register`, requestBody);
      console.log('Response received:', response.data);
      console.log('Response status:', response.status);

      if (response.data.success) {
        console.log('Registration successful!');
        console.log('Doctor data:', response.data.doctor);
        Alert.alert(
          'Registration Successful',
          'Your doctor account has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Resetting form after successful registration');
                setStep(1);
                setMobileNumber('');
                setOtpCode('');
                setVerificationId('');
                setFormData({
                  dr_name: '',
                  dr_degree: '',
                  dr_email: '',
                  dr_city: '',
                  dr_address: '',
                  dr_password: '',
                  confirmPassword: '',
                });
                if (timerRef.current) clearInterval(timerRef.current);
                setCountdown(0);
              },
            },
          ]
        );
      } else {
        console.log('API returned success false:', response.data.message);
        Alert.alert('Registration Failed', response.data.message || 'Something went wrong');
      }
    } catch (error: any) {
      console.error('=== REGISTER ERROR ===');
      console.error('Error object:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        Alert.alert('Registration Failed', error.response.data?.message || 'Something went wrong');
      } else if (error.request) {
        console.error('No response received from server');
        Alert.alert('Error', 'Cannot connect to server. Please check your connection.');
      } else {
        console.error('Error message:', error.message);
        Alert.alert('Registration Failed', error.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
      console.log('Register function completed');
      
    }
  };

  const renderField = ({
    label,
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType = 'default',
    maxLength,
    secureTextEntry = false,
    autoCapitalize = 'sentences',
    multiline = false,
    numberOfLines = 1,
  }: {
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
    maxLength?: number;
    secureTextEntry?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    multiline?: boolean;
    numberOfLines?: number;
  }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputShell, multiline && styles.inputShellTextArea]}>
        <View style={styles.iconWrap}>
          <MaterialIcons name={icon} size={18} color="#2563EB" />
        </View>
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!loading}
        />
      </View>
    </View>
  );

  const renderProgress = () => (
    <View style={styles.progressCard}>
      <View style={styles.progressTopRow}>
        <Text style={styles.progressTitle}>Account Setup</Text>
        <Text style={styles.progressCount}>Step {step}/3</Text>
      </View>

      <View style={styles.progressRow}>
        {[1, 2, 3].map((item, index) => (
          <React.Fragment key={item}>
            <View style={[styles.stepCircle, step >= item && styles.stepCircleActive]}>
              {step > item ? (
                <MaterialIcons name="check" size={16} color="#FFFFFF" />
              ) : (
                <Text style={[styles.stepNumber, step >= item && styles.stepNumberActive]}>
                  {item}
                </Text>
              )}
            </View>
            {index < 2 && (
              <View style={[styles.stepLine, step > item && styles.stepLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <View style={styles.progressLabels}>
        <Text style={[styles.progressLabel, step >= 1 && styles.progressLabelActive]}>
          Contact
        </Text>
        <Text style={[styles.progressLabel, step >= 2 && styles.progressLabelActive]}>
          Verify
        </Text>
        <Text style={[styles.progressLabel, step >= 3 && styles.progressLabelActive]}>
          Profile
        </Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.topBadge}>
        <MaterialIcons name="verified-user" size={14} color="#1D4ED8" />
        <Text style={styles.topBadgeText}>Secure onboarding</Text>
      </View>

      <Text style={styles.headerTitle}>Welcome</Text>
      <Text style={styles.headerSubtitle}>
        Create your account with a clean and seamless mobile experience
      </Text>

      {renderProgress()}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces>
      <View style={styles.mainCard}>
        <View style={styles.heroIcon}>
          <MaterialIcons name="smartphone" size={34} color="#2563EB" />
        </View>

        <Text style={styles.title}>Get Started</Text>
        <Text style={styles.subtitle}>
          Enter your mobile number to receive a secure verification code
        </Text>

        <View style={styles.infoCard}>
          <MaterialIcons name="security" size={18} color="#2563EB" />
          <Text style={styles.infoText}>
            Fast, secure and built for smooth onboarding on every device
          </Text>
        </View>

        {renderField({
          label: 'Mobile Number',
          icon: 'phone',
          placeholder: 'Enter 10-digit mobile number',
          value: mobileNumber,
          onChangeText: (text) => {
            console.log('Mobile number input changed:', text);
            setMobileNumber(text);
          },
          keyboardType: 'phone-pad',
          maxLength: 10,
          autoCapitalize: 'none',
        })}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleSendOTP}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Send OTP</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          console.log('Back button pressed, returning to step 1');
          setStep(1);
        }}>
        <MaterialIcons name="arrow-back-ios-new" size={16} color="#2563EB" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.mainCard}>
        <View style={styles.heroIcon}>
          <MaterialIcons name="mark-email-read" size={34} color="#2563EB" />
        </View>

        <Text style={styles.title}>Verify Your Number</Text>
        <Text style={styles.subtitle}>
          Enter the OTP sent to +91 {mobileNumber}
        </Text>

        <View style={styles.otpCard}>
          <MaterialIcons name="sms" size={18} color="#2563EB" />
          <Text style={styles.otpCardText}>A verification code has been sent</Text>
        </View>

        {renderField({
          label: 'One-Time Password',
          icon: 'password',
          placeholder: 'Enter OTP',
          value: otpCode,
          onChangeText: (text) => {
            console.log('OTP input changed:', text);
            setOtpCode(text);
          },
          keyboardType: 'number-pad',
          maxLength: 6,
          autoCapitalize: 'none',
        })}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Verify OTP</Text>
              <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, (countdown > 0 || loading) && styles.secondaryButtonDisabled]}
          onPress={handleResendOTP}
          disabled={countdown > 0 || loading}>
          <MaterialIcons
            name="refresh"
            size={18}
            color={countdown > 0 || loading ? '#94A3B8' : '#2563EB'}
          />
          <Text
            style={[
              styles.secondaryButtonText,
              (countdown > 0 || loading) && styles.secondaryButtonTextDisabled,
            ]}>
            {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            console.log('Back button pressed, returning to step 2');
            setStep(2);
          }}>
          <MaterialIcons name="arrow-back-ios-new" size={16} color="#2563EB" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.mainCard}>
          <View style={styles.heroIcon}>
            <MaterialIcons name="person-add-alt-1" size={34} color="#2563EB" />
          </View>

          <Text style={styles.title}>Complete Profile</Text>
          <Text style={styles.subtitle}>
            Fill in your details to finish registration
          </Text>

          <Text style={styles.sectionTitle}>Basic Details</Text>

          {renderField({
            label: 'Full Name',
            icon: 'person',
            placeholder: 'Enter your full name',
            value: formData.dr_name,
            onChangeText: (text) => setFormData({ ...formData, dr_name: text }),
          })}

          {renderField({
            label: 'Degree',
            icon: 'school',
            placeholder: 'e.g. MBBS, MD',
            value: formData.dr_degree,
            onChangeText: (text) => setFormData({ ...formData, dr_degree: text }),
          })}

          {renderField({
            label: 'Email Address',
            icon: 'email',
            placeholder: 'Enter your email address',
            value: formData.dr_email,
            onChangeText: (text) => setFormData({ ...formData, dr_email: text }),
            keyboardType: 'email-address',
            autoCapitalize: 'none',
          })}

          {renderField({
            label: 'City',
            icon: 'location-city',
            placeholder: 'Enter your city',
            value: formData.dr_city,
            onChangeText: (text) => setFormData({ ...formData, dr_city: text }),
          })}

          {renderField({
            label: 'Address',
            icon: 'location-on',
            placeholder: 'Clinic / Hospital Address',
            value: formData.dr_address,
            onChangeText: (text) => setFormData({ ...formData, dr_address: text }),
            multiline: true,
            numberOfLines: 4,
          })}

          <Text style={styles.sectionTitle}>Security</Text>

          {renderField({
            label: 'Password',
            icon: 'lock',
            placeholder: 'Create password',
            value: formData.dr_password,
            onChangeText: (text) => setFormData({ ...formData, dr_password: text }),
            secureTextEntry: true,
            autoCapitalize: 'none',
          })}

          {renderField({
            label: 'Confirm Password',
            icon: 'lock-outline',
            placeholder: 'Confirm password',
            value: formData.confirmPassword,
            onChangeText: (text) => setFormData({ ...formData, confirmPassword: text }),
            secureTextEntry: true,
            autoCapitalize: 'none',
          })}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Complete Registration</Text>
                <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FB" />
      <View style={styles.container}>
        {renderHeader()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  flex: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
  },
  topBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF2FF',
    borderColor: '#D5E4FF',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 14,
  },
  topBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
    marginBottom: 18,
  },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#2563EB',
  },
  stepNumber: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '800',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
    borderRadius: 999,
  },
  stepLineActive: {
    backgroundColor: '#2563EB',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  progressLabelActive: {
    color: '#2563EB',
  },

  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },

  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  backButtonText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 4,
  },

  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 5,
  },

  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#D9E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 22,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#D8E7FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
    fontWeight: '500',
  },

  otpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#D8EEFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  otpCardText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
    marginBottom: 14,
  },

  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputShell: {
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  inputShellTextArea: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 16,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: 14,
  },

  primaryButton: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },

  secondaryButton: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8E7FF',
    backgroundColor: '#F8FBFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 8,
  },
  secondaryButtonDisabled: {
    opacity: 0.75,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  secondaryButtonTextDisabled: {
    color: '#94A3B8',
  },
});