import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="register" />
      <Stack.Screen name="login" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="upload-documents" />
      <Stack.Screen name="verification-pending" />
      <Stack.Screen name="verification-rejected" />
    </Stack>
  );
}
