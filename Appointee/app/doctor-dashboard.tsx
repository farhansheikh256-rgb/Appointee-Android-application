import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export default function DoctorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState('');

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const token = await AsyncStorage.getItem('doctor_token');
      console.log('Dashboard - Retrieved token:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.log('Dashboard - No token found, redirecting to login');
        router.replace('/doctor-login');
        return;
      }

      // Decode JWT token to get doctor info
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const tokenData = JSON.parse(jsonPayload);
        console.log('Dashboard - Decoded token data:', tokenData);
        
        setDoctorName(tokenData.dr_name || 'Doctor');
      } catch (decodeError) {
        console.error('Dashboard - Error decoding token:', decodeError);
      }
      
    } catch (error) {
      console.error('Dashboard - Error checking auth:', error);
      router.replace('/doctor-login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('doctor_token');
            console.log('Dashboard - Token removed, redirecting to login');
            router.replace('/doctor-login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.doctorName}>Dr. {doctorName}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.dashboardTitle}>Doctor Dashboard</Text>
        <Text style={styles.dashboardSubtitle}>You have successfully logged in!</Text>
        
        <View style={styles.infoCard}>
          <MaterialIcons name="check-circle" size={50} color="#10B981" />
          <Text style={styles.infoText}>Login Successful!</Text>
          <Text style={styles.infoSubtext}>You are now authenticated and can access all features.</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.card}>
            <MaterialIcons name="event" size={32} color="#2563EB" />
            <Text style={styles.cardTitle}>Appointments</Text>
            <Text style={styles.cardValue}>0</Text>
          </View>

          <View style={styles.card}>
            <MaterialIcons name="people" size={32} color="#10B981" />
            <Text style={styles.cardTitle}>Patients</Text>
            <Text style={styles.cardValue}>0</Text>
          </View>

          <View style={styles.card}>
            <MaterialIcons name="schedule" size={32} color="#F59E0B" />
            <Text style={styles.cardTitle}>Pending</Text>
            <Text style={styles.cardValue}>0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748B',
  },
  doctorName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  dashboardSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 12,
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
});