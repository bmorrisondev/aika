import { useAuth } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';

export default function AppLayout() {
  // useAuth hook from Clerk SDK
  const { isSignedIn } = useAuth()

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Public routes */}
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-up" />
      </Stack.Protected>

      {/* Protected routes */}
      <Stack.Protected guard={isSignedIn!}>
        <Stack.Screen name="protected" />
        <Stack.Screen name="screens/create-organization" />
        <Stack.Screen name="screens/add-organization-members" />
      </Stack.Protected>
    </Stack>
  );
}