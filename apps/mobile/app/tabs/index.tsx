// Lead Feed — Home screen for professionals
import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { useRouter } from "expo-router";

type Lead = {
  id: string;
  subject: string;
  description: string;
  level: string;
  urgency: string;
  buyer_count: number;
  max_buyers: number;
  created_at: string;
  categories: { name: string; icon: string } | null;
};

const URGENCY_COLOR: Record<string, string> = {
  urgent: "#EF4444",
  high:   "#F97316",
  medium: "#EAB308",
  low:    "#6B7280",
};

export default function LeadFeedScreen() {
  const { coinBalance, setCoinBalance, user } = useAppStore();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<{id: string; name: string; icon: string}[]>([]);

  async function fetchLeads() {
    let query = supabase
      .from("leads")
      .select("*, categories(name, icon)")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(30);

    if (selectedCategory) {
      query = query.eq("category_id", selectedCategory);
    }

    const { data } = await query;
    setLeads(data as Lead[] ?? []);
  }

  async function fetchWallet() {
    if (!user) return;
    const { data } = await supabase
      .from("wallets")
      .select("coins_balance")
      .eq("user_id", user.id)
      .single();
    if (data) setCoinBalance(data.coins_balance);
  }

  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("id, name, icon").eq("active", true);
    setCategories(data ?? []);
  }

  useEffect(() => {
    Promise.all([fetchLeads(), fetchWallet(), fetchCategories()]).finally(() => setLoading(false));
  }, [selectedCategory]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchLeads();
    setRefreshing(false);
  }

  function renderLead({ item }: { item: Lead }) {
    const isFull = item.buyer_count >= item.max_buyers;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/lead/${item.id}`)}
        activeOpacity={0.85}
      >
        <View style={styles.cardTop}>
          <Text style={styles.icon}>{item.categories?.icon ?? "📋"}</Text>
          <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
          <View style={[styles.badge, { backgroundColor: `${URGENCY_COLOR[item.urgency]}20` }]}>
            <Text style={[styles.badgeText, { color: URGENCY_COLOR[item.urgency] }]}>
              {item.urgency}
            </Text>
          </View>
        </View>
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardBottom}>
          <Text style={styles.buyers}>
            {item.buyer_count}/{item.max_buyers} pros unlocked
          </Text>
          {isFull ? (
            <Text style={styles.soldOut}>Sold out</Text>
          ) : (
            <View style={styles.coinBtn}>
              <Text style={styles.coinText}>200 coins to unlock</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1A56DB" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Topskilly</Text>
        <TouchableOpacity
          onPress={() => router.push("/wallet")}
          style={styles.wallet}
        >
          <Text style={styles.walletText}>{coinBalance} coins</Text>
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: null, name: "All", icon: "🌐" }, ...categories]}
        keyExtractor={(item) => item.id ?? "all"}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.catChip,
              selectedCategory === item.id && styles.catChipActive,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text style={styles.catIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.catText,
                selectedCategory === item.id && styles.catTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Lead list */}
      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        renderItem={renderLead}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A56DB" />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No active leads right now. Check back soon.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
  },
  logo: { fontSize: 22, fontWeight: "800", color: "#1A56DB" },
  wallet: { backgroundColor: "#EBF0FD", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  walletText: { color: "#1A56DB", fontWeight: "700", fontSize: 13 },
  categories: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  catChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#fff",
  },
  catChipActive: { backgroundColor: "#1A56DB", borderColor: "#1A56DB" },
  catIcon: { fontSize: 14 },
  catText: { fontSize: 13, color: "#374151" },
  catTextActive: { color: "#fff", fontWeight: "600" },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  icon: { fontSize: 20 },
  subject: { flex: 1, fontWeight: "700", fontSize: 15, color: "#111827" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  desc: { fontSize: 13, color: "#6B7280", lineHeight: 18, marginBottom: 10 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  buyers: { fontSize: 12, color: "#9CA3AF" },
  soldOut: { fontSize: 12, color: "#9CA3AF" },
  coinBtn: { backgroundColor: "#EBF0FD", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  coinText: { color: "#1A56DB", fontSize: 12, fontWeight: "700" },
  empty: { textAlign: "center", color: "#9CA3AF", marginTop: 60, fontSize: 14 },
});
