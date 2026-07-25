import React, { useState, useContext } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, Dimensions, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

const { width } = Dimensions.get("window");
const isDesktop = width >= 1024;

const BASE_URL = "https://peluqueria-server-gw54.onrender.com";

// 🎨 COLORES
const COLORS = {
  morado: '#B088C8',
  moradoOscuro: '#9B6FB0',
  rosado: '#E8C4D8',
  rosadoClaro: '#FDF0F5',
  aguamarina: '#7FFFD4',
  blanco: '#FFFFFF',
  negro: '#2D2D2D',
  gris: '#6B6B6B',
  lilaFondo: '#FDF8FC',
  bordeLila: '#E8D5F0',
  sombraMorada: 'rgba(176, 136, 200, 0.3)',
};

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError("Por favor, ingresa correo y contraseña.");
      return;
    }
    setIsLoading(true);
    setLoginError("");

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/login`, { email, password });
      if (data.success && data.token) {
        const loginSuccess = await login(data.token);
        if (!loginSuccess) setLoginError("Error al iniciar sesión");
        return;
      }
      if (data.reason === "UNAUTHORIZED_ROLE") {
        const resClient = await axios.post(`${BASE_URL}/auth/login-client`, { email, password });
        if (resClient.data.token) {
          const loginSuccess = await login(resClient.data.token, { clientData: resClient.data.cliente });
          if (!loginSuccess) setLoginError("Error al iniciar sesión");
        } else {
          setLoginError("Credenciales incorrectas");
        }
        return;
      }
      switch (data.reason) {
        case "USER_NOT_FOUND": setLoginError("Usuario no registrado."); break;
        case "INVALID_PASSWORD": setLoginError("Contraseña incorrecta."); break;
        case "NOT_VERIFIED": setLoginError("Tu cuenta no ha sido verificada. Revisa tu correo."); break;
        default: setLoginError("Error desconocido. Intenta nuevamente.");
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || "Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardView}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <View style={styles.formContainer}>
        
        {/* EMAIL */}
        <Text style={styles.inputLabel}>CORREO ELECTRÓNICO</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>✉️</Text>
          <TextInput
            style={styles.input}
            placeholder="nombre@correo.com"
            placeholderTextColor="#C8B8D0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* CONTRASEÑA */}
        <Text style={styles.inputLabel}>CONTRASEÑA</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#C8B8D0"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#C8B8D0" />
          </TouchableOpacity>
        </View>

        {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

        {/* BOTÓN */}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>🌸  INICIAR SESIÓN</Text>
          )}
        </TouchableOpacity>

        {/* LINKS */}
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>
            ¿No tienes cuenta? <Text style={styles.linkHighlight}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={isLoading} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.morado} />
            <Text style={styles.loadingText}>Iniciando sesión...</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: { flex: 1, justifyContent: "center" },
  formContainer: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  
  inputLabel: {
    fontSize: 11, fontWeight: '600', color: '#6B6B6B',
    letterSpacing: 1.5, marginBottom: 8, marginTop: 5,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'sans-serif',
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: '#E8D5F0', borderRadius: 12,
    backgroundColor: '#FDF8FC', marginBottom: 16, overflow: 'hidden',
  },
  inputIcon: { fontSize: 18, paddingLeft: 15 },
  input: {
    flex: 1, height: 50, paddingHorizontal: 12,
    fontSize: 14, color: '#2D2D2D',
    fontFamily: Platform.OS === 'web' ? 'Raleway, sans-serif' : 'sans-serif',
  },
  eyeIcon: { paddingRight: 15, paddingLeft: 5 },
  
  button: {
    height: 52, backgroundColor: '#B088C8', borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    shadowColor: '#B088C8', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 15, elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF', fontSize: 14, fontWeight: '600', letterSpacing: 3,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'sans-serif',
  },
  
  linkButton: { marginTop: 18, alignItems: 'center' },
  link: {
    fontSize: 13, color: '#6B6B6B',
    fontFamily: Platform.OS === 'web' ? 'Raleway, sans-serif' : 'sans-serif',
  },
  linkHighlight: { color: '#B088C8', fontWeight: '600' },
  errorText: {
    color: '#E74C3C', fontSize: 13, textAlign: 'center',
    marginVertical: 8, backgroundColor: '#FDF0F0', padding: 10, borderRadius: 8,
  },
  
  loadingOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  loadingBox: {
    backgroundColor: '#FFFFFF', padding: 30, borderRadius: 16,
    alignItems: 'center', width: '80%', maxWidth: 300,
  },
  loadingText: { marginTop: 15, fontSize: 14, color: '#2D2D2D' },
});

export default LoginForm;