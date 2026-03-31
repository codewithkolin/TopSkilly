import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const fullPhone = phone.startsWith("+") ? phone : `+91${phone}`;

  async function sendOtp() {
    if (phone.length < 10) return Alert.alert("Enter a valid 10-digit number");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    setLoading(false);
    if (error) return Alert.alert("Error", error.message);
    setStep("otp");
  }

  async function verifyOtp() {
    if (otp.length !== 6) return Alert.alert("Enter the 6-digit OTP");
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (error) return Alert.alert("Error", error.message);

    if (data.user) {
      // Check if user has a role set
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!userData) {
        router.replace("/auth/role-select");
      } else {
        router.replace("/(tabs)");
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Topskilly</Text>
      <Text style={styles.tagline}>Top skills. Verified leads.</Text>

      {step === "phone" ? (
        <>
          <View style={styles.phoneRow}>
            <Text style={styles.code}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <TouchableOpacity
            style={styles.btn}
            onPress={sendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.hint}>
            Enter the 6-digit OTP sent to +91{phone}
          </Text>
          <TextInput
            style={[styles.input, styles.otpInput]}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity
            style={styles.btn}
            onPress={verifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep("phone")}>
            <Text style={styles.back}>← Change number</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1A56DB",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 40,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
    gap: 8,
  },
  code: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    color: "#374151",
    fontSize: 14,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#111827",
  },
  otpInput: {
    width: "100%",
    textAlign: "center",
    letterSpacing: 8,
    fontSize: 22,
    marginBottom: 16,
  },
  hint: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  btn: {
    width: "100%",
    backgroundColor: "#1A56DB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  back: {
    marginTop: 20,
    color: "#6B7280",
    fontSize: 14,
  },
});
