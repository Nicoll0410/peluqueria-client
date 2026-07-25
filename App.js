if (Platform.OS === 'web') {
  require('./webPolyfills');
}

import React, { useEffect, useRef } from "react";
import { Platform, Alert, LogBox, AppState, Linking } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from 'expo-device';
import Constants from "expo-constants";
import * as Font from 'expo-font';
import AppNavigator from "./navigation/AppNavigator";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { configurePushNotifications, playNotificationSound } from './utils/notifications';
import io from 'socket.io-client';

// 🎨 PALETA ALBA QUICENO
// Morado principal: #B088C8 | Rosado: #E8C4D8 | Aguamarina: #7FFFD4
// Blanco: #FFFFFF | Negro suave: #2D2D2D | Lila fondo: #F3E8FA

// Cargar fuentes para web
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Raleway:wght@300;400;500;600&family=Montserrat:wght@400;500;600&display=swap');
  `;
  document.head.appendChild(style);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notificaciones Salón Alba Quiceno',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#B088C8',
      sound: 'default',
      showBadge: true,
      enableLights: true,
      enableVibrate: true,
    });
  }
}

LogBox.ignoreLogs([
  "AsyncStorage has been extracted",
  "Setting a timer",
  "Remote debugger",
  "Require cycle:"
]);

function MainApp() {
  const notificationListener = useRef();
  const responseListener = useRef();
  const appState = useRef(AppState.currentState);
  const navigationRef = useRef();
  const socketRef = useRef(null);
  const { user, token } = useAuth();

  const handleDeepLink = (event) => {
    try {
      let url = event.url;
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const params = Object.fromEntries(urlObj.searchParams.entries());
      
      if (path.includes('/verify-email')) {
        if (navigationRef.current) {
          navigationRef.current.navigate('VerifyEmail', {
            email: params.email,
            code: params.code,
            autoVerify: params.autoVerify === 'true',
            success: params.success === 'true',
            verified: params.verified === 'true'
          });
        }
      }
    } catch (error) {
      console.error('Error procesando deep link:', error);
    }
  };

  const setupSocket = async () => {
    try {
      if (!user || !token) return;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      socketRef.current = io('https://peluqueria-server-gw54.onrender.com', {
        transports: ['websocket', 'polling'],
        auth: { token: token }
      });

      socketRef.current.on('connect', () => {
        socketRef.current.emit('unir_usuario', user.userId || user.id);
      });

      socketRef.current.on('nueva_notificacion', async (data) => {
        await playNotificationSound();
        Alert.alert(data.titulo, data.cuerpo, [
          {
            text: 'Ver',
            onPress: () => {
              if (data.cita && data.cita.id) {
                navigationRef.current?.navigate('DetalleCita', { id: data.cita.id });
              } else {
                navigationRef.current?.navigate('Notificaciones');
              }
            }
          },
          { text: 'OK', onPress: () => {} }
        ]);
      });

    } catch (error) {
      console.error('Error configurando socket:', error);
    }
  };

  const registerForPushNotifications = async () => {
    try {
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Permisos requeridos', 'Las notificaciones no funcionarán sin los permisos necesarios');
        return;
      }
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      });
    } catch (error) {}
  };

  const handleAppStateChange = async (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      if (user && token) await setupSocket();
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    setupNotificationChannel();
    configurePushNotifications();
    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {});

    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    }).catch(err => console.error('Error obteniendo URL inicial:', err));

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
      linkingSubscription.remove();
      appStateSubscription.remove();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (user && token) setupSocket();
  }, [user, token]);

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={{
        prefixes: ['salonalbaquiceno://', 'https://salonalbaquiceno.com', 'https://*.salonalbaquiceno.com'],
        config: { screens: { VerifyEmail: 'verify-email' } },
      }}
    >
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}