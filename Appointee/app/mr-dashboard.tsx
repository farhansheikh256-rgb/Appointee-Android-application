import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { Platform } from 'react-native';

const { width } = Dimensions.get('window');

export default function MRDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mrData, setMrData] = useState<any>(null);

  useEffect(() => {
    loadMRData();
  }, []);

  const loadMRData = async () => {
    try {
      const token = await AsyncStorage.getItem('mr_token');
      if (!token) {
        router.replace('/mr-login');
        return;
      }

      const decoded: any = jwtDecode(token);
      setMrData(decoded);
    } catch (error) {
      console.error('Error loading MR data:', error);
      router.replace('/mr-login');
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
            await AsyncStorage.removeItem('mr_token');
            router.replace('/mr-login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.mrName}>{mrData?.mr_name || 'MR'}</Text>
          <Text style={styles.companyText}>{mrData?.mr_company_name || 'Pharmaceutical Company'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.dashboardTitle}>MR Dashboard</Text>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.card}>
            <MaterialIcons name="people" size={32} color="#7C3AED" />
            <Text style={styles.cardTitle}>Doctors Visited</Text>
            <Text style={styles.cardValue}>0</Text>
          </View>

          <View style={styles.card}>
            <MaterialIcons name="event" size={32} color="#10B981" />
            <Text style={styles.cardTitle}>Appointments</Text>
            <Text style={styles.cardValue}>0</Text>
          </View>

          <View style={styles.card}>
            <MaterialIcons name="assignment" size={32} color="#F59E0B" />
            <Text style={styles.cardTitle}>Reports</Text>
            <Text style={styles.cardValue}>0</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="add-circle" size={32} color="#7C3AED" />
            <Text style={styles.actionText}>New Visit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="assignment-turned-in" size={32} color="#7C3AED" />
            <Text style={styles.actionText}>Submit Report</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="calendar-today" size={32} color="#7C3AED" />
            <Text style={styles.actionText}>Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Tasks */}
        <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
        <View style={styles.tasksContainer}>
          <Text style={styles.noTasksText}>No upcoming tasks</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#64748B' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  welcomeText: { fontSize: 14, color: '#64748B' },
  mrName: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginTop: 2 },
  companyText: { fontSize: 12, color: '#7C3AED', marginTop: 2 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
  logoutText: { color: '#EF4444', fontSize: 14, fontWeight: '500' },
  content: { padding: 20 },
  dashboardTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 20 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  card: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', marginHorizontal: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 12, color: '#64748B', marginTop: 8, marginBottom: 4, textAlign: 'center' },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  actionButton: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', marginHorizontal: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  actionText: { fontSize: 12, color: '#1E293B', marginTop: 8, textAlign: 'center' },
  tasksContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, alignItems: 'center' },
  noTasksText: { color: '#94A3B8', fontSize: 14 },
});