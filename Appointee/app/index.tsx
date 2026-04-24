import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  const handleDoctorLogin = () => {
    console.log('Navigating to Doctor Login');
    router.push('/doctor-login');
  };

  const handleDoctorRegister = () => {
    console.log('Navigating to Doctor Registration');
    router.push('/doctor-register');
  };

  const handleMRLogin = () => {
    console.log('Navigating to MR Login');
    router.push('/mr-login');
  };

  const handleMRRegister = () => {
    console.log('Navigating to MR Registration');
    router.push('/mr-register');
  };

  const handlePatient = () => {
    Alert.alert('Coming Soon', 'Patient Portal will be available soon!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="medical-services" size={60} color="#2563EB" />
        </View>
        <Text style={styles.heading}>Welcome to MedHealth</Text>
        <Text style={styles.subheading}>Your Trusted Healthcare Partner</Text>
      </View>

      <Text style={styles.sectionTitle}>Select Your Role</Text>
      <Text style={styles.sectionDesc}>Choose your portal to continue</Text>

      {/* Doctor Portal Card */}
      <View style={styles.roleCard}>
        <View style={[styles.iconWrapper, styles.doctorIcon]}>
          <MaterialIcons name="local-hospital" size={40} color="#FFFFFF" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.roleTitle}>Doctor Portal</Text>
          <Text style={styles.roleDescription}>
            Manage appointments, view patient records, and access medical resources.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.doctorLoginButton]} 
              onPress={handleDoctorLogin}
              activeOpacity={0.8}>
              <MaterialIcons name="login" size={18} color="#2563EB" />
              <Text style={styles.doctorLoginButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.doctorRegisterButton]} 
              onPress={handleDoctorRegister}
              activeOpacity={0.8}>
              <MaterialIcons name="person-add" size={18} color="#FFFFFF" />
              <Text style={styles.doctorRegisterButtonText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* MR Portal Card */}
      <View style={styles.roleCard}>
        <View style={[styles.iconWrapper, styles.mrIcon]}>
          <MaterialIcons name="business" size={40} color="#FFFFFF" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.roleTitle}>MR Portal</Text>
          <Text style={styles.roleDescription}>
            Connect with doctors, manage pharmaceutical products, and track visits.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.mrLoginButton]} 
              onPress={handleMRLogin}
              activeOpacity={0.8}>
              <MaterialIcons name="login" size={18} color="#7C3AED" />
              <Text style={styles.mrLoginButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.mrRegisterButton]} 
              onPress={handleMRRegister}
              activeOpacity={0.8}>
              <MaterialIcons name="person-add" size={18} color="#FFFFFF" />
              <Text style={styles.mrRegisterButtonText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Patient Portal Card */}
      <TouchableOpacity style={styles.roleCard} onPress={handlePatient} activeOpacity={0.7}>
        <View style={[styles.iconWrapper, styles.patientIcon]}>
          <MaterialIcons name="favorite" size={40} color="#FFFFFF" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.roleTitle}>Patient Portal</Text>
          <Text style={styles.roleDescription}>
            Book appointments, consult doctors online, and manage your health records.
          </Text>
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
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
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  doctorIcon: {
    backgroundColor: '#2563EB',
  },
  mrIcon: {
    backgroundColor: '#7C3AED',
  },
  patientIcon: {
    backgroundColor: '#10B981',
  },
  cardContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  roleDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
    flex: 1,
  },
  // Doctor buttons
  doctorLoginButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  doctorRegisterButton: {
    backgroundColor: '#2563EB',
  },
  doctorLoginButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  doctorRegisterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // MR buttons
  mrLoginButton: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  mrRegisterButton: {
    backgroundColor: '#7C3AED',
  },
  mrLoginButtonText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
  mrRegisterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  comingSoonContainer: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  comingSoonText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
});