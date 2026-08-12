import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Modal,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Footer from '../../components/Footer';
import { Video } from 'expo-av';

const { width } = Dimensions.get('window');
const isMobile = width < 768;
const isWeb = Platform.OS === 'web';

// ✅ FUNCIÓN PARA OPTIMIZAR URL DE CLOUDINARY
const getOptimizedVideoUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return '';
  
  console.log('🎬 URL original:', cloudinaryUrl);
  
  if (cloudinaryUrl.includes('/q_auto/') || cloudinaryUrl.includes('/f_auto/')) {
    return cloudinaryUrl;
  }
  
  if (cloudinaryUrl.includes('cloudinary.com')) {
    const urlParts = cloudinaryUrl.split('/upload/');
    if (urlParts.length === 2) {
      const optimizedUrl = `${urlParts[0]}/upload/f_auto,q_auto,vc_auto/${urlParts[1]}`;
      console.log('✅ URL optimizada:', optimizedUrl);
      return optimizedUrl;
    }
  }
  
  return cloudinaryUrl;
};

// ✅ COMPONENTE PARA RENDERIZAR VIDEO
const VideoPlayer = ({ uri, style }) => {
  const optimizedUri = getOptimizedVideoUrl(uri);
  
  if (isWeb) {
    return (
      <video
        src={optimizedUri}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          backgroundColor: '#2a2a2a'
        }}
        controls
        preload="metadata"
        playsInline
        onError={(e) => {
          console.error('❌ Error cargando video:', e);
          console.error('URL problemática:', optimizedUri);
        }}
        onLoadedData={() => {
          console.log('✅ Video cargado correctamente');
        }}
      />
    );
  }
  
  return (
    <Video
      source={{ uri: optimizedUri }}
      style={style}
      useNativeControls
      resizeMode="cover"
      isLooping={false}
      shouldPlay={false}
      isMuted={false}
      volume={1.0}
      onError={(error) => {
        console.error('❌ Error cargando video móvil:', error);
      }}
      onLoad={() => {
        console.log('✅ Video móvil cargado');
      }}
    />
  );
};

const GaleriaScreen = ({ navigation }) => {
  const [galeriaPorBarbero, setGaleriaPorBarbero] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState(null);
  const [contenidosSeleccionados, setContenidosSeleccionados] = useState([]);
  
  // ✅ NUEVO: Estado para filtros
  const [filtroActivo, setFiltroActivo] = useState('todos'); // 'todos', 'imagenes', 'videos'

  useEffect(() => {
    fetchGaleriaDestacada();
  }, []);

  const fetchGaleriaDestacada = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const { data } = await axios.get(
        'https://peluqueria-server-gw54.onrender.com/galeria/destacados',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (data.success) {
        setGaleriaPorBarbero(data.data);
      }
    } catch (error) {
      console.error('Error cargando galería:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirGaleriaCompleta = async (barberoId, barbero) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const { data } = await axios.get(
        `https://peluqueria-server-gw54.onrender.com/galeria/barbero/${barberoId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (data.success) {
        setBarberoSeleccionado(barbero);
        setContenidosSeleccionados(data.data);
        setFiltroActivo('todos'); // ✅ Resetear filtro al abrir modal
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error cargando galería completa:', error);
    }
  };

  const abrirRedSocial = (url) => {
    if (!url) {
      console.log('❌ URL vacía o inválida');
      return;
    }

    console.log('🔗 Abriendo URL:', url);
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log('❌ No se puede abrir la URL:', url);
        }
      })
      .catch(err => console.error('❌ Error abriendo URL:', err));
  };

  // ✅ NUEVO: Filtrar contenidos según el filtro activo
  const contenidosFiltrados = contenidosSeleccionados.filter(contenido => {
    if (filtroActivo === 'todos') return true;
    if (filtroActivo === 'imagenes') return contenido.tipo === 'imagen';
    if (filtroActivo === 'videos') return contenido.tipo === 'video';
    return true;
  });

  const renderBarberoCard = (item, index) => {
    const { barbero, contenidoDestacado } = item;
    
    const avatarValido = barbero.avatar && 
                        typeof barbero.avatar === 'string' && 
                        barbero.avatar.length > 500 &&
                        barbero.avatar.startsWith('data:image/');

    const contenidoValido = contenidoDestacado?.contenido &&
                           typeof contenidoDestacado.contenido === 'string' &&
                           (contenidoDestacado.contenido.length > 500 || 
                            contenidoDestacado.contenido.includes('cloudinary.com'));

    const tieneRedes = barbero.instagram || barbero.facebook || barbero.tiktok;

    return (
      <View key={index} style={styles.barberoCard}>
        <View style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarContainer}>
              {avatarValido ? (
                <Image
                  source={{ uri: barbero.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={30} color="#fff" />
                </View>
              )}
            </View>
            <View style={styles.barberoInfo}>
              <Text style={styles.barberoNombre} numberOfLines={1}>
                {barbero.nombre}
              </Text>
              {barbero.telefono && (
                <View style={styles.telefonoContainer}>
                  <Ionicons name="call" size={16} color="#7FFFD4" />
                  <Text style={styles.telefonoText}>{barbero.telefono}</Text>
                </View>
              )}
              
              <View style={styles.redesBarberoContainer}>
                {barbero.instagram && (
                  <TouchableOpacity
                    onPress={() => abrirRedSocial(barbero.instagram)}
                    style={styles.redBarberoButton}
                  >
                    <FontAwesome name="instagram" size={20} color="#E4405F" />
                  </TouchableOpacity>
                )}
                {barbero.facebook && (
                  <TouchableOpacity
                    onPress={() => abrirRedSocial(barbero.facebook)}
                    style={styles.redBarberoButton}
                  >
                    <FontAwesome name="facebook" size={20} color="#1877F2" />
                  </TouchableOpacity>
                )}
                {barbero.tiktok && (
                  <TouchableOpacity
                    onPress={() => abrirRedSocial(barbero.tiktok)}
                    style={styles.redBarberoButton}
                  >
                    <FontAwesome name="music" size={20} color="#000" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {contenidoValido ? (
            <View style={styles.trabajoContainerCompact}>
              {contenidoDestacado.tipo === 'imagen' ? (
                <Image
                  source={{ uri: contenidoDestacado.contenido }}
                  style={styles.trabajoImagenCompact}
                  resizeMode="cover"
                />
              ) : (
                <VideoPlayer 
                  uri={contenidoDestacado.contenido} 
                  style={styles.trabajoImagenCompact}
                />
              )}
            </View>
          ) : (
            <View style={styles.sinContenidoCompact}>
              <Ionicons name="images-outline" size={30} color="#666" />
              <Text style={styles.sinContenidoTextCompact}>Sin contenido</Text>
            </View>
          )}

          <View style={styles.descripcionContainer}>
            {contenidoDestacado?.descripcion ? (
              <Text style={styles.descripcionCompact} numberOfLines={2}>
                {contenidoDestacado.descripcion}
              </Text>
            ) : (
              <Text style={styles.descripcionPlaceholder}>Sin descripción</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.verMasButtonCompact}
            onPress={() => abrirGaleriaCompleta(barbero.id, barbero)}
          >
            <Ionicons name="images-outline" size={14} color="#000" />
            <Text style={styles.verMasTextCompact}>Ver más</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7FFFD4" />
        <Text style={styles.loadingText}>Cargando galería...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient}>
            <View style={styles.headerContent}>
              <Ionicons name="cut-outline" size={40} color="#00695C" />
              <Text style={styles.headerTitle}>
                Conoce el trabajo de nuestras estilistas
              </Text>
              <Text style={styles.headerSubtitle}>
                Explora los mejores estilos
              </Text>
            </View>
          </View>
        </View>

        {galeriaPorBarbero.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={80} color="#00695C" />
            <Text style={styles.emptyText}>
              No hay contenido destacado disponible
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {galeriaPorBarbero.map(renderBarberoCard)}
          </View>
        )}
      </ScrollView>
      <Footer />

      {/* ✅ MODAL CON MEJORAS */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* ✅ LOGO EN EL MODAL */}
          <View style={styles.modalLogoContainer}>
            <Image
              source={require('../../assets/images/nmDigitalSolutions.PNG')}
              style={styles.modalLogo}
              resizeMode="contain"
            />
          </View>

          {/* Header oscuro con borde dorado */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <Text style={styles.modalTitle}>
                Trabajos de {barberoSeleccionado?.nombre}
              </Text>
              {barberoSeleccionado && (barberoSeleccionado.instagram || barberoSeleccionado.facebook || barberoSeleccionado.tiktok) && (
                <View style={styles.redesModalContainer}>
                  {barberoSeleccionado.instagram && (
                    <TouchableOpacity
                      onPress={() => abrirRedSocial(barberoSeleccionado.instagram)}
                      style={styles.redModalButton}
                    >
                      <FontAwesome name="instagram" size={20} color="#E4405F" />
                    </TouchableOpacity>
                  )}
                  {barberoSeleccionado.facebook && (
                    <TouchableOpacity
                      onPress={() => abrirRedSocial(barberoSeleccionado.facebook)}
                      style={styles.redModalButton}
                    >
                      <FontAwesome name="facebook" size={20} color="#1877F2" />
                    </TouchableOpacity>
                  )}
                  {barberoSeleccionado.tiktok && (
                    <TouchableOpacity
                      onPress={() => abrirRedSocial(barberoSeleccionado.tiktok)}
                      style={styles.redModalButton}
                    >
                      <FontAwesome name="music" size={20} color="#000" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color="#7FFFD4" />
            </TouchableOpacity>
          </View>

          {/* ✅ FILTROS */}
          <View style={styles.filtrosContainer}>
            <TouchableOpacity
              style={[
                styles.filtroBoton,
                filtroActivo === 'todos' && styles.filtroBotonActivo
              ]}
              onPress={() => setFiltroActivo('todos')}
            >
              <Ionicons 
                name="albums-outline" 
                size={18} 
                color={filtroActivo === 'todos' ? '#2D2D2D' : '#7FFFD4'}
              />
              <Text style={[
                styles.filtroTexto,
                filtroActivo === 'todos' && styles.filtroTextoActivo
              ]}>
                Todos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filtroBoton,
                filtroActivo === 'imagenes' && styles.filtroBotonActivo
              ]}
              onPress={() => setFiltroActivo('imagenes')}
            >
              <Ionicons 
                name="image-outline" 
                size={18} 
                color={filtroActivo === 'imagenes' ? '#000' : '#D4AF37'} 
              />
              <Text style={[
                styles.filtroTexto,
                filtroActivo === 'imagenes' && styles.filtroTextoActivo
              ]}>
                Fotos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filtroBoton,
                filtroActivo === 'videos' && styles.filtroBotonActivo
              ]}
              onPress={() => setFiltroActivo('videos')}
            >
              <Ionicons 
                name="videocam-outline" 
                size={18} 
                color={filtroActivo === 'videos' ? '#000' : '#7FFFD4'} 
              />
              <Text style={[
                styles.filtroTexto,
                filtroActivo === 'videos' && styles.filtroTextoActivo
              ]}>
                Videos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenido con fondo oscuro */}
          <ScrollView 
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
          >
            {contenidosFiltrados.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="images-outline" size={60} color="#666" />
                <Text style={styles.emptyText}>
                  {filtroActivo === 'todos' 
                    ? 'Este barbero aún no ha subido trabajos'
                    : filtroActivo === 'imagenes'
                    ? 'No hay fotos disponibles'
                    : 'No hay videos disponibles'
                  }
                </Text>
              </View>
            ) : (
              <View style={styles.galeriaGrid}>
                {contenidosFiltrados.map((contenido, index) => {
                  const contenidoValido = contenido.contenido &&
                                         typeof contenido.contenido === 'string' &&
                                         (contenido.contenido.length > 500 || 
                                          contenido.contenido.includes('cloudinary.com'));

                  return (
                    <View key={index} style={styles.galeriaItem}>
                      <View style={styles.galeriaItemInner}>
                        {contenidoValido ? (
                          contenido.tipo === 'imagen' ? (
                            <Image
                              source={{ uri: contenido.contenido }}
                              style={styles.galeriaImagen}
                              resizeMode="contain" // ✅ CAMBIADO: De "cover" a "contain"
                            />
                          ) : (
                            <VideoPlayer 
                              uri={contenido.contenido} 
                              style={styles.galeriaImagen}
                            />
                          )
                        ) : (
                          <View style={styles.videoPlaceholderSmall}>
                            <Ionicons 
                              name={contenido.tipo === 'video' ? "videocam-outline" : "image-outline"} 
                              size={40} 
                              color="#666" 
                            />
                          </View>
                        )}
                      </View>
                      {contenido.descripcion && (
                        <Text style={styles.galeriaDescripcion}>
                          {contenido.descripcion}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* ✅ FOOTER EN EL MODAL */}
            <Footer dark />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  loadingText: {
    marginTop: 10,
    color: '#2D2D2D',
    fontSize: 16
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 20
  },
  headerContainer: {
    overflow: 'hidden'
  },
  headerGradient: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 40,
    paddingHorizontal: 20,
    position: 'relative'
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 1
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D2D2D',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.5
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#00695C',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: 'bold'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: isMobile ? 16 : 8
  },
  barberoCard: {
    width: isMobile ? '100%' : '33.33%',
    padding: isMobile ? 8 : 8,
    marginBottom: isMobile ? 16 : 0
  },
  cardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#7FFFD4',
    shadowColor: '#7FFFD4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minHeight: isMobile ? 450 : 520,
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 12
  },
  avatarContainer: {
    marginBottom: 8
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: '#7FFFD4'
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7FFFD4',
    borderWidth: 2.5,
    borderColor: '#7FFFD4',
    justifyContent: 'center',
    alignItems: 'center'
  },
  barberoInfo: {
    alignItems: 'center',
    width: '100%'
  },
  barberoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D2D2D',
    textAlign: 'center'
  },
  telefonoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  telefonoText: {
    fontSize: 14,
    color: '#2D2D2D',
    marginLeft: 4,
    fontWeight: '500'
  },
  redesBarberoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 12,
    paddingVertical: 4,
    minHeight: 40
  },
  redBarberoButton: {
    padding: 6,
    backgroundColor: '#F0FAF8',
    borderRadius: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  trabajoContainerCompact: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    height: 200,
    borderWidth: 1,
    borderColor: '#B2F0E8'
  },
  trabajoImagenCompact: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0FAF8'
  },
  sinContenidoCompact: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FAF8',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#B2F0E8'
  },
  sinContenidoTextCompact: {
    color: '#666',
    marginTop: 4,
    fontSize: 11
  },
  descripcionContainer: {
    minHeight: 40,
    marginBottom: 8,
    justifyContent: 'center'
  },
  descripcionCompact: {
    fontSize: 13,
    color: '#00695C',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500'
  },
  descripcionPlaceholder: {
    fontSize: 13,
    color: '#9E9E9E',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  verMasButtonCompact: {
    flexDirection: 'row',
    backgroundColor: '#7FFFD4',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto'
  },
  verMasTextCompact: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center'
  },
  // ✅ ESTILOS DEL MODAL
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  // ✅ NUEVO: Logo en el modal
  modalLogoContainer: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#7FFFD4'
  },
  modalLogo: {
    width: 240,
    height: 65
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#7FFFD4',
    backgroundColor: '#FFFFFF'
  },
  modalHeaderLeft: {
    flex: 1
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4
  },
  redesModalContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12
  },
  redModalButton: {
    padding: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeButton: {
    padding: 8
  },
  // ✅ NUEVOS: Estilos de filtros
  filtrosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  filtroBoton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#7FFFD4',
    backgroundColor: '#000'
  },
  filtroBotonActivo: {
    backgroundColor: '#7FFFD4'
  },
  filtroTexto: {
    color: '#7FFFD4',
    fontSize: 14,
    fontWeight: '600'
  },
  filtroTextoActivo: {
    color: '#000'
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#000'
  },
  modalContentContainer: {
    paddingBottom: 20
  },
  galeriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16
  },
  galeriaItem: {
    width: isMobile ? '50%' : '33.33%',
    padding: 8
  },
  galeriaItemInner: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#7FFFD4',
    backgroundColor: '#1a1a1a',
    minHeight: 250 // ✅ NUEVO: Altura mínima para mantener proporción
  },
  galeriaImagen: {
    width: '100%',
    minHeight: 250, // ✅ NUEVO: Altura mínima
    backgroundColor: '#2a2a2a'
  },
  videoPlaceholderSmall: {
    width: '100%',
    height: 250,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center'
  },
  galeriaDescripcion: {
    marginTop: 8,
    fontSize: 12,
    color: '#2D2D2D',
    textAlign: 'center',
    fontWeight: '500'
  }
});

export default GaleriaScreen;