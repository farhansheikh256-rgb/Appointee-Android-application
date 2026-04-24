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
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// IMPORTANT: Use this for Android Emulator
// For Android Emulator: http://10.0.2.2:8000/api
// For iOS Simulator: http://localhost:8000/api
// For Physical Device: http://YOUR_COMPUTER_IP:8000/api
const API_BASE_URL = 'http://localhost:8000/api'; // Change this based on your setup

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'doctor_token',
};

// Helper functions for storage
const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    console.log('Token stored successfully');
    return true;
  } catch (error) {
    console.error('Error storing token:', error);
    return false;
  }
};

export default function DoctorLogin() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    console.log('=== DOCTOR LOGIN FUNCTION CALLED ===');
    console.log('Mobile Number:', mobileNumber);

    if (!mobileNumber || mobileNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setLoading(true);

    const requestBody = {
      dr_mobile_number: mobileNumber,
      dr_password: password,
    };
    console.log('Sending request to:', `${API_BASE_URL}/doctors/doctor-login`);
    console.log('Request body:', { ...requestBody, dr_password: '***' });

    try {
      const response = await axios.post(`${API_BASE_URL}/doctors/doctor-login`, requestBody);
      console.log('Response received:', response.data);

      if (response.data.success) {
        console.log('Login successful!');
        console.log('Token:', response.data.token);
        
        // Store the token
        const stored = await storeToken(response.data.token);
        
        if (stored) {
          console.log('Token stored, navigating to dashboard...');
          
          // Navigate to doctor dashboard and replace the current screen
          // Use setTimeout to ensure navigation happens after alert is dismissed
          setTimeout(() => {
            router.replace('/doctor-dashboard');
          }, 100);
          
          // Show success message (optional - can remove if causing issues)
          Alert.alert('Login Successful', 'Welcome back, Doctor!');
        } else {
          Alert.alert('Error', 'Failed to save login information');
        }
      } else {
        console.log('Login failed:', response.data.message);
        Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('=== LOGIN ERROR ===');
      if (error.response) {
        console.error('Error response data:', error.response.data);
        Alert.alert('Login Failed', error.response.data?.message || 'Invalid credentials');
      } else if (error.request) {
        console.error('No response received from server');
        Alert.alert('Error', 'Cannot connect to server. Please check your connection.');
      } else {
        console.error('Error message:', error.message);
        Alert.alert('Error', error.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
      console.log('Login function completed');
    }
  };

  const handleSignUpPress = () => {
    console.log('Navigate to doctor registration');
    router.push('/doctor-register');
  };

  const handleForgotPassword = () => {
    Alert.alert('Coming Soon', 'Password reset feature will be available soon!');
  };

  const validateMobileNumber = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      setMobileNumber(cleaned);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {/* Background Decoration */}
        <View style={styles.backgroundDecoration}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>

        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="medical-services" size={60} color="#2563EB" />
          </View>
          <Text style={styles.title}>Doctor Login</Text>
          <Text style={styles.subtitle}>
            Welcome back! Please login to your account
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Mobile Number Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="phone-android" size={22} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={mobileNumber}
                onChangeText={validateMobileNumber}
                editable={!loading}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={22} color="#64748B" style={styles.inputIcon} />
              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={22}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
            activeOpacity={0.7}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Login</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignUpPress}
            activeOpacity={0.7}>
            <MaterialIcons name="person-add" size={20} color="#2563EB" />
            <Text style={styles.signupButtonText}>Create New Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Doctor Appointment App</Text>
          <Text style={styles.footerSubtext}>Secure & Reliable Healthcare Platform</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  backgroundDecoration: {
    position: 'absolute',
    width: width,
    height: height,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#DBEAFE',
    top: -width * 0.2,
    right: -width * 0.1,
    opacity: 0.6,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: '#BFDBFE',
    bottom: -width * 0.1,
    left: -width * 0.15,
    opacity: 0.4,
  },
  circle3: {
    position: 'absolute',
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: '#93C5FD',
    top: height * 0.3,
    right: -width * 0.1,
    opacity: 0.3,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 28,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94A3B8',
    fontSize: 14,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  signupButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
});