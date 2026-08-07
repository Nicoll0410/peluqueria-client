import React, { useState, useContext } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import {
  FontAwesome5,
  MaterialIcons,
  Feather,
  Ionicons,
  AntDesign,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { AuthContext } from "../contexts/AuthContext";

/* ─────────────────── MENÚ SEGÚN ROL ─────────────────────────── */
const ROLE_MENU = {
  Cliente: {
    topItems: [
      { label: "Galería", screen: "Galeria", icon: MaterialCommunityIcons, name: "view-gallery" },
      { label: "Agenda", screen: "Agenda", icon: MaterialIcons, name: "event" },
      { label: "Citas", screen: "Citas", icon: Ionicons, name: "calendar-outline" },
    ],
    sections: {},
  },
  Barbero: {
    topItems: [
      { label: "Mi Perfil", screen: "MiPerfil", icon: Ionicons, name: "person-circle-outline" },
    ],
    sections: {
      Usuarios: [
        { label: "Clientes", screen: "Clientes", icon: Feather, name: "user" },
      ],
      Ventas: [
        { label: "Mi Galería", screen: "MiGaleria", icon: MaterialCommunityIcons, name: "view-gallery" },
        { label: "Agenda", screen: "Agenda", icon: MaterialIcons, name: "event" },
        { label: "Citas", screen: "Citas", icon: Ionicons, name: "calendar-outline" },
      ],
    },
  },
  Administrador: {
    topItems: [
      { label: "Mi Perfil", screen: "MiPerfil", icon: Ionicons, name: "person-circle-outline" },
      { label: "Dashboard", screen: "Dashboard", icon: MaterialCommunityIcons, name: "view-dashboard-outline" },
    ],
    sections: {
      Usuarios: [
        { label: "Clientes", screen: "Clientes", icon: Feather, name: "user" },
        { label: "Estilistas", screen: "Barberos", icon: Ionicons, name: "cut-outline" },
      ],
      Ventas: [
        { label: "Mi Galería", screen: "MiGaleria", icon: MaterialCommunityIcons, name: "view-gallery" },
        { label: "Servicios", screen: "Servicios", icon: MaterialCommunityIcons, name: "toolbox-outline" },
        { label: "Agenda", screen: "Agenda", icon: MaterialIcons, name: "event" },
        { label: "Citas", screen: "Citas", icon: Ionicons, name: "calendar-outline" },
        { label: "Ventas", screen: "Ventas", icon: Ionicons, name: "cash-outline" },
      ],
    },
  },
};

/* ─────────────────── COMPONENTE DRAWER ──────────────────────── */
const CustomDrawer = (props) => {
  const { userRole, user, logout } = useContext(AuthContext);

  const roleKey = userRole || "Administrador";
  const config  = ROLE_MENU[roleKey];

  const [expanded, setExpanded] = useState({
    Usuarios: false,
    Compras: false,
    Ventas:  false,
  });
  const toggle = (sec) => setExpanded((p) => ({ ...p, [sec]: !p[sec] }));

  const Item = ({ label, screen, icon: IconComp, name, indent = 0 }) => (
    <TouchableOpacity
      style={[styles.menuItem, indent && { paddingLeft: 20 + indent }]}
      onPress={() => {
        props.navigation.navigate(screen);
        if (props.navigation.closeDrawer) {
          props.navigation.closeDrawer();
        }
      }}
    >
      <IconComp name={name} size={indent ? 16 : 22} color="#5FE0C8" />
      <Text style={[styles.menuText, indent && { fontSize: 14, marginLeft: 10 }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ----------- Logo superior ------------ */}
      <View style={styles.logoContainer}>
        <Image source={require("../assets/images/logo-peluqueria.jpeg")} style={styles.logo} />
        <Text style={styles.logoTitle}>Salón de belleza Alba</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator
        contentContainerStyle={styles.scrollContainer}
      >
        <Text style={styles.sectionTitle}>Menú</Text>

        {config.topItems.map((item) => <Item key={item.label} {...item} />)}

        {Object.entries(config.sections).map(([section, items]) => (
          <View key={section}>
            <TouchableOpacity style={styles.expandableItem} onPress={() => toggle(section)}>
              <View style={styles.menuRow}>
                {section === "Usuarios" && <Feather name="users" size={24} color="#5FE0C8" />}
                {section === "Compras" && <AntDesign name="shoppingcart" size={24} color="#5FE0C8" />}
                {section === "Ventas"   && <MaterialCommunityIcons name="account-cash-outline" size={24} color="#5FE0C8" />}
                <Text style={styles.menuText}>{section}</Text>
              </View>
              <Feather name={expanded[section] ? "chevron-up" : "chevron-down"} size={20} color="#5FE0C8" />
            </TouchableOpacity>

            {expanded[section] && items.map((sub) => <Item key={sub.label} {...sub} indent={20} />)}
          </View>
        ))}
      </ScrollView>

      {/* ------------- Perfil abajo ------------- */}
      <View style={styles.profileSection}>
        <Text style={styles.profileTitle}>Perfil</Text>
        <View style={styles.userContainer}>
          {user?.imagen ? (
            <Image source={{ uri: user.imagen }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Feather name="user" size={24} color="#fff" />
            </View>
          )}

          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>
              {user?.nombre || user?.email?.split("@")[0] || "Usuario"}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || "ejemplo@dominio.com"}
            </Text>
            <Text style={styles.userRole}>{roleKey}</Text>
          </View>
        </View>
      </View>

      {/* ------------- Logout ------------- */}
      <View style={styles.profileContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Feather name="log-out" size={18} color="#FFFFFF" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ─────────────────── Estilos ────────────────────── */
const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContainer:    { flexGrow: 1 },
  logoContainer:      { alignItems: "center", paddingVertical: 20, borderBottomWidth: 2, borderColor: "#7FFFD4", backgroundColor: "#F0FAF8" },
  logo:               { width: 140, height: 140, resizeMode: "contain", borderWidth: 2, borderColor: "#7FFFD4" },
  sectionTitle:       { fontSize: 12, fontWeight: "700", color: "#00695C", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 6, textTransform: "uppercase", letterSpacing: 1.5 },
  menuItem:           { flexDirection: "row", alignItems: "center", paddingVertical: 13, paddingLeft: 20, marginHorizontal: 8, borderRadius: 10, marginBottom: 2 },
  menuText:           { marginLeft: 14, fontSize: 15, color: "#2D2D2D", fontWeight: "500" },
  expandableItem:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, paddingHorizontal: 20, marginHorizontal: 8, borderRadius: 10 },
  menuRow:            { flexDirection: "row", alignItems: "center" },
  profileSection:     { padding: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#E8D5F0", backgroundColor: "#F0FAF8" },
  profileTitle:       { fontSize: 12, fontWeight: "700", color: "#00695C", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1.5 },
  userContainer:      { flexDirection: "row", alignItems: "center" },
  avatar:             { width: 46, height: 46, borderRadius: 23, marginRight: 12 },
  avatarPlaceholder:  { width: 46, height: 46, borderRadius: 23, backgroundColor: "#7FFFD4", justifyContent: "center", alignItems: "center", marginRight: 12 },
  userInfoContainer:  { flex: 1 },
  userName:           { color: "#2D2D2D", fontSize: 15, fontWeight: "600", marginBottom: 2 },
  userEmail:          { color: "#00695C", fontSize: 13, marginBottom: 2 },
  userRole:           { color: "#5FE0C8", fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  profileContainer:   { padding: 16, borderTopWidth: 1, borderColor: "#E8D5F0" },
  logoutButton:       { flexDirection: "row", backgroundColor: "#7FFFD4", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 25, alignItems: "center", justifyContent: "center", shadowColor: "#7FFFD4", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  logoutText:         { color: "#2D2D2D", marginLeft: 8, fontSize: 15, fontWeight: "600" },
  logoTitle: {
    color: "#2D2D2D",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center"
  },
});

export default CustomDrawer;