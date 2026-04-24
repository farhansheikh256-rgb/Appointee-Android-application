import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#F8FAFC' },
          headerTintColor: '#1D4ED8',
          headerTitleStyle: { fontWeight: '600' },
        }}>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            title: 'Home'
          }} 
        />
        <Stack.Screen 
          name="doctor-login" 
          options={{ 
            headerShown: true,
            title: 'Doctor Login',
            headerBackTitle: 'Back'
          }} 
        />
        <Stack.Screen 
          name="doctor-register" 
          options={{ 
            headerShown: true,
            title: 'Doctor Registration',
            headerBackTitle: 'Back'
          }} 
        />
        <Stack.Screen 
          name="doctor-dashboard" 
          options={{ 
            headerShown: true,
            title: 'Doctor Dashboard',
            headerBackTitle: 'Back'
          }} 
        />
        <Stack.Screen 
          name="mr-login" 
          options={{ 
            headerShown: true,
            title: 'MR Login',
            headerBackTitle: 'Back'
          }} 
        />
        <Stack.Screen 
          name="mr-register" 
          options={{ 
            headerShown: true,
            title: 'MR Registration',
            headerBackTitle: 'Back'
          }} 
        />
        <Stack.Screen 
          name="mr-dashboard" 
          options={{ 
            headerShown: true,
            title: 'MR Dashboard',
            headerBackTitle: 'Back'
          }} 
        />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}