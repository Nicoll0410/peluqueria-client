import React from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  Dimensions, 
  Platform,
  ScrollView,
  Text,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LoginForm from './LoginForm';
import Footer from '../../components/Footer';

const { width, height } = Dimensions.get('window');
const isDesktop = width >= 1024;
const isMobile = width < 768;

const LoginScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#E8F8F5', '#FFFFFF', '#F3E8FA']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {isMobile ? (
          <View style={styles.mobileContainer}>
            <ScrollView 
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.mobileContent}>
                {/* Icono decorativo */}
                <View style={styles.iconContainer}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconText}>💎</Text>
                  </View>
                </View>
                
                <Text style={styles.brandName}>SALÓN DE BELLEZA</Text>
                <Text style={styles.brandNameMain}>ALBA QUICENO</Text>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerIcon}>✦</Text>
                  <View style={styles.dividerLine} />
                </View>
                <Text style={styles.tagline}>Tu belleza, nuestro arte</Text>
                
                <LoginForm />
              </View>
            </ScrollView>
            <View style={styles.mobileFooter}>
              <Footer />
            </View>
          </View>
        ) : (
          <View style={styles.desktopContainer}>
            <View style={styles.desktopContent}>
              {/* Panel izquierdo - Decorativo */}
              <View style={styles.leftPanel}>
                <LinearGradient
                  colors={['#7FFFD4', '#B2F0E8', '#E8C4D8']}
                  style={styles.decorativePanel}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.decorativeContent}>
                    <Text style={styles.decorativeIcon}>💎</Text>
                    <Text style={styles.decorativeTitle}>ALBA QUICENO</Text>
                    <Text style={styles.decorativeSubtitle}>Salón de Belleza</Text>
                    <View style={styles.decorativeLine} />
                    <Text style={styles.decorativeQuote}>"Realza tu belleza natural"</Text>
                  </View>
                </LinearGradient>
              </View>
              
              {/* Panel derecho - Login */}
              <View style={styles.rightPanel}>
                <View style={styles.loginBox}>
                  <Text style={styles.welcomeTitle}>Bienvenida</Text>
                  <Text style={styles.welcomeSubtitle}>Inicia sesión para continuar</Text>
                  <LoginForm />
                </View>
              </View>
            </View>
            <View style={styles.desktopFooter}>
              <Footer />
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  gradient: { flex: 1 },
  
  // MÓVIL
  mobileContainer: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingBottom: 100 },
  mobileContent: { width: '100%', alignItems: 'center', padding: 30 },
  mobileFooter: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  
  // ICONO
  iconContainer: { marginBottom: 20 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#B088C8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
    borderWidth: 2, borderColor: '#E8C4D8',
  },
  iconText: { fontSize: 35 },
  
  // TÍTULOS
  brandName: {
    fontSize: 14, fontWeight: '600', letterSpacing: 8,
    color: '#B088C8', textTransform: 'uppercase', marginBottom: 5,
    fontFamily: Platform.OS === 'web' ? 'Raleway, sans-serif' : 'sans-serif',
  },
  brandNameMain: {
    fontSize: 28, fontWeight: 'bold', color: '#2D2D2D',
    letterSpacing: 4, marginBottom: 20,
    fontFamily: Platform.OS === 'web' ? 'Playfair Display, serif' : 'serif',
  },
  divider: { flexDirection: 'row', alignItems: 'center', width: '80%', marginBottom: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8C4D8' },
  dividerIcon: { marginHorizontal: 15, color: '#B088C8', fontSize: 16 },
  tagline: {
    fontSize: 14, color: '#B088C8', fontStyle: 'italic',
    marginBottom: 30, letterSpacing: 1,
    fontFamily: Platform.OS === 'web' ? 'Raleway, sans-serif' : 'sans-serif',
  },
  
  // DESKTOP
  desktopContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  desktopContent: {
    flexDirection: 'row', width: '100%', maxWidth: 1100, minHeight: 600,
    backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden',
    shadowColor: '#B088C8', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2, shadowRadius: 30, elevation: 15, margin: 20,
  },
  
  // PANEL IZQUIERDO
  leftPanel: { flex: 1 },
  decorativePanel: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  decorativeContent: { alignItems: 'center' },
  decorativeIcon: { fontSize: 60, marginBottom: 20 },
  decorativeTitle: {
    fontSize: 32, fontWeight: 'bold', color: '#1A1A1A',
    letterSpacing: 6, marginBottom: 5,
    fontFamily: Platform.OS === 'web' ? 'Playfair Display, serif' : 'serif',
  },
  decorativeSubtitle: {
    fontSize: 14, color: '#00695C',
    letterSpacing: 6, marginBottom: 20,
    fontFamily: Platform.OS === 'web' ? 'Raleway, sans-serif' : 'sans-serif',
  },
  decorativeLine: { width: 60, height: 2, backgroundColor: '#FFFFFF', marginBottom: 15 },
  decorativeQuote: {
    fontSize: 14, color: '#2D2D2D', fontStyle: 'italic',
    fontFamily: Platform.OS === 'web' ? 'Playfair Display, serif' : 'serif',
  },
  
  // PANEL DERECHO
  rightPanel: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loginBox: { width: '100%', maxWidth: 380 },
  welcomeTitle: {
    fontSize: 30, fontWeight: 'bold', color: '#2D2D2D', marginBottom: 5,
    fontFamily: Platform.OS === 'web' ? 'Playfair Display, serif' : 'serif',
  },
  welcomeSubtitle: {
    fontSize: 14, color: '#B088C8', marginBottom: 35, letterSpacing: 1,
    fontFamily: Platform.OS === 'web' ? 'Raleway, sans-serif' : 'sans-serif',
  },
  
  desktopFooter: { width: '100%', maxWidth: 1100, paddingTop: 10 },
});

export default LoginScreen;