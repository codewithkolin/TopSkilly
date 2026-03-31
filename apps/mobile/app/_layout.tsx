import { useEffect } from "react";
import { Stack } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { useRouter, useSegments } from "expo-router";

export default function RootLayout() {
  const { user, userRole, setUser, setUserRole } = useAppStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user role
          const { data } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (data) {
            setUserRole(data.role as any);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";

    if (!user && !inAuthGroup) {
      router.replace("/auth/login");
    } else if (user && inAuthGroup) {
      if (!userRole) {
        router.replace("/auth/role-select");
      } else if (userRole === "professional") {
        router.replace("/(tabs)");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [user, userRole, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
