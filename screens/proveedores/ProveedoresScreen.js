import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  MaterialIcons,
  FontAwesome,
  Feather,
  Ionicons,
} from '@expo/vector-icons';

import Paginacion from '../../components/Paginacion';
import Buscador from '../../components/Buscador';
import CrearProveedor from './CrearProveedor';
import DetalleProveedor from './DetalleProveedor';
import EditarProveedor from './EditarProveedor';
import Footer from '../../components/Footer';

/* ─── NUEVOS MODALES ─── */                                       
import ConfirmarModal from '../../components/ConfirmarModal';       
import InfoModal from '../../components/InfoModal';                 

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

/* ────────────────────────────── utilidades visuales ────────────────────────────── */
const Avatar = ({ nombre }) => {
  const colors = ['#7FFFD4', '#5FE0C8', '#B088C8', '#E8C4D8', '#B2F0E8'];
  const color = colors[nombre?.length % colors.length] || '#FF5733';

  return (
    <View style={[styles.avatarContainer, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>
        {nombre?.split(' ').map(p => p[0]).join('').toUpperCase()}
      </Text>
    </View>
  );
};

const TipoProveedor = ({ tipo }) => (
  <View style={styles.tipoContainer}>
    {tipo === 'Persona' ? (
      <>
        <MaterialIcons name="person" size={16} color="#424242" />
        <Text style={styles.tipoTexto}>Persona</Text>
      </>
    ) : (
      <>
        <MaterialIcons name="business" size={16} color="#424242" />
        <Text style={styles.tipoTexto}>Empresa</Text>
      </>
    )}
  </View>
);

const TipoIdentificacion = ({ tipo }) => (
  <View style={styles.tipoIdContainer}>
    {tipo === 'CC' ? (
      <>
        <MaterialIcons name="badge" size={16} color="#424242" />
        <Text style={styles.tipoIdTexto}>Cédula</Text>
      </>
    ) : tipo === 'CE' ? (
      <>
        <MaterialIcons name="card-membership" size={16} color="#424242" />
        <Text style={styles.tipoIdTexto}>Cédula Ext.</Text>
      </>
    ) : (
      <>
        <MaterialIcons name="receipt" size={16} color="#424242" />
        <Text style={styles.tipoIdTexto}>NIT</Text>
      </>
    )}
  </View>
);

const ProveedorCard = ({ item, onVer, onEditar, onEliminar }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Avatar nombre={item.nombre} />
      <View style={styles.cardHeaderText}>
        <Text style={styles.cardNombre}>{item.nombre}</Text>
        <Text style={styles.cardTipo}>
          {item.tipo === 'Persona' ? 'Persona natural' : 'Empresa'}
        </Text>
      </View>
    </View>

    <View style={styles.cardDetails}>
      <View style={styles.detailRow}>
        <MaterialIcons
          name="fingerprint"
          size={16}
          color="#757575"
          style={styles.detailIcon}
        />
        <Text style={styles.detailText}>
          {item.tipoDocumento}: {item.identificacion}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialIcons
          name="email"
          size={16}
          color="#757575"
          style={styles.detailIcon}
        />
        <Text style={styles.detailText}>{item.email}</Text>
      </View>
    </View>

    <View style={styles.cardActions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onVer(item)}
      >
        <FontAwesome name="eye" size={18} color="#00695C" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onEditar(item)}
      >
        <Feather name="edit" size={18} color="#00695C" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onEliminar(item.id)}
      >
        <Feather name="trash-2" size={18} color="#d32f2f" />
      </TouchableOpacity>
    </View>
  </View>
);

/* ────────────────────────────── pantalla principal ────────────────────────────── */
const ProveedoresScreen = () => {
  /* ─── estado ─── */
  const [proveedores, setProveedores] = useState([]);
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [proveedoresPorPagina] = useState(4);
  const [busqueda, setBusqueda] = useState('');

  /* CRUD modals */
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  /* confirm / info modals */                                    
  const [confirmVisible, setConfirmVisible] = useState(false);   
  const [idAEliminar, setIdAEliminar] = useState(null);          
  const [infoVisible, setInfoVisible] = useState(false);         
  const [infoTitle, setInfoTitle] = useState('');                
  const [infoMsg, setInfoMsg] = useState('');                    
  const [infoType, setInfoType] = useState('info');              

  /* misc */
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ─── helper InfoModal ─── */                                 
  const showInfo = (title, message, type = 'info') => {
    setInfoTitle(title);
    setInfoMsg(message);
    setInfoType(type);
    setInfoVisible(true);
  };

  /* ─── obtener proveedores ─── */
  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const { data } = await axios.get('https://peluqueria-server-gw54.onrender.com/proveedores/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProveedores(data.proveedores || []);
      setProveedoresFiltrados(data.proveedores || []);
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      showInfo('Error', 'No se pudieron cargar los proveedores', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProveedores();
    }, [])
  );

  /* ─── buscar ─── */
  useEffect(() => {
    if (!busqueda.trim()) {
      setProveedoresFiltrados(proveedores);
    } else {
      const t = busqueda.toLowerCase();
      setProveedoresFiltrados(
        proveedores.filter(
          p =>
            p.nombre.toLowerCase().includes(t) ||
            p.identificacion.includes(busqueda) ||
            p.email.toLowerCase().includes(t)
        )
      );
    }
    setPaginaActual(1);
  }, [busqueda, proveedores]);

  /* ─── reajuste de página si quedó vacía ─── */                 
  useEffect(() => {
    const total = Math.max(
      1,
      Math.ceil(proveedoresFiltrados.length / proveedoresPorPagina)
    );
    if (paginaActual > total) setPaginaActual(total);
  }, [proveedoresFiltrados, proveedoresPorPagina, paginaActual]);

  /* ─── paginación ─── */
  const i0 = (paginaActual - 1) * proveedoresPorPagina;
  const proveedoresMostrar = isMobile
    ? proveedoresFiltrados
    : proveedoresFiltrados.slice(i0, i0 + proveedoresPorPagina);
  const totalPaginas = Math.ceil(
    proveedoresFiltrados.length / proveedoresPorPagina
  );

  const cambiarPagina = p => {
    if (p > 0 && p <= totalPaginas) setPaginaActual(p);
  };

  /* ─── CRUD helpers ─── */
  const crearProveedor = () => setModalVisible(true);
  const handleSearchChange = t => setBusqueda(t);

  const handleCreateProveedor = async newProveedor => {
    try {
      const token = await AsyncStorage.getItem('token');
      const { data } = await axios.post(
        'https://peluqueria-server-gw54.onrender.com/proveedores',
        newProveedor,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const nuevo = data.proveedor;
      setProveedores([...proveedores, nuevo]);
      setProveedoresFiltrados([...proveedoresFiltrados, nuevo]);
      setModalVisible(false);
      showInfo('🎉 ¡Proveedor creado!', 'El proveedor se registró exitosamente.', 'success');
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      showInfo('Error', error.response?.data?.mensaje || 'Error al crear proveedor', 'error');
    }
  };

  const verProveedor = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModalDetalleVisible(true);
  };

  const editarProveedor = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModalEditarVisible(true);
  };

  const handleUpdateProveedor = async updated => {
    try {
      const token = await AsyncStorage.getItem('token');
      const { data } = await axios.put(
        `https://peluqueria-server-gw54.onrender.com/proveedores/${updated.id}`,
        updated,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const nuevos = proveedores.map(p =>
        p.id === updated.id ? data.proveedorActualizado : p
      );
      setProveedores(nuevos);
      setProveedoresFiltrados(nuevos);
      setModalEditarVisible(false);
      showInfo('✅ ¡Actualizado!', 'Proveedor actualizado correctamente.', 'success');
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      showInfo('Error', error.response?.data?.mensaje || 'Error al actualizar proveedor', 'error');
    }
  };

  /* ─── eliminación ─── */
  const eliminarProveedor = id => {
    setIdAEliminar(id);
    setConfirmVisible(true);
  };

  const confirmarEliminacion = async () => {                       
    if (!idAEliminar) return;
    setConfirmVisible(false);
    setDeleting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`https://peluqueria-server-gw54.onrender.com/proveedores/${idAEliminar}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const nuevos = proveedores.filter(p => p.id !== idAEliminar);
      setProveedores(nuevos);
      setProveedoresFiltrados(nuevos);
      showInfo('🗑️ Eliminado', 'Proveedor eliminado correctamente.', 'success');
    } catch (error) {
      const msg = error.response?.data?.mensaje || '';
      if (msg.toLowerCase().includes('compras')) {
        showInfo(
          '⚠️ No puedes eliminar',
          'No puedes eliminar este proveedor, este tiene compras asociadas',
          'warning'
        );
      } else {
        showInfo('Error', msg || 'No se pudo eliminar el proveedor', 'error');
      }
    } finally {
      setDeleting(false);
      setIdAEliminar(null);
    }
  };

  /* ────────────────────────────── UI ────────────────────────────── */
  return (
    <View style={styles.mainContainer}>                            
      <View style={styles.contentWrapper}>                         
        <View style={styles.contentContainer}>                     
          {/* ─── cabecera + buscador ─── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Proveedores</Text>
              <View style={styles.counter}>
                <Text style={styles.counterText}>
                  {proveedoresFiltrados.length}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={crearProveedor}>
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.addButtonText}>Crear</Text>
            </TouchableOpacity>
          </View>

          <Buscador
            placeholder="Buscar proveedores por nombre, identificación o email"
            value={busqueda}
            onChangeText={handleSearchChange}
          />

          {/* ─── contenido ─── */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7FFFD4" />
              <Text style={styles.loadingText}>Cargando proveedores...</Text>
            </View>
          ) : !isMobile ? (
            <>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <View style={[styles.headerCell, styles.typeColumn]}>
                    <Text style={styles.headerText}>Tipo Proveedor</Text>
                  </View>
                  <View style={[styles.headerCell, styles.idTypeColumn]}>
                    <Text style={styles.headerText}>Tipo ID</Text>
                  </View>
                  <View style={[styles.headerCell, styles.idColumn]}>
                    <Text style={styles.headerText}>Identificación</Text>
                  </View>
                  <View style={[styles.headerCell, styles.nameColumn]}>
                    <Text style={styles.headerText}>Nombre</Text>
                  </View>
                  <View style={[styles.headerCell, styles.emailColumn]}>
                    <Text style={styles.headerText}>Email</Text>
                  </View>
                  <View style={[styles.headerCell, styles.actionsColumn]}>
                    <Text style={styles.headerText}>Acciones</Text>
                  </View>
                </View>

                <FlatList
                  data={proveedoresMostrar}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.tableRow}>
                      <View style={[styles.cell, styles.typeColumn]}>
                        <TipoProveedor tipo={item.tipo} />
                      </View>
                      <View style={[styles.cell, styles.idTypeColumn]}>
                        <TipoIdentificacion tipo={item.tipoDocumento} />
                      </View>
                      <View style={[styles.cell, styles.idColumn]}>
                        <Text style={styles.idText}>{item.identificacion}</Text>
                      </View>
                      <View style={[styles.cell, styles.nameColumn]}>
                        <View style={styles.nameContainer}>
                          <Avatar nombre={item.nombre} />
                          <Text style={styles.nameText}>{item.nombre}</Text>
                        </View>
                      </View>
                      <View style={[styles.cell, styles.emailColumn]}>
                        <Text style={styles.emailText}>{item.email}</Text>
                      </View>
                      <View style={[styles.cell, styles.actionsColumn]}>
                        <View style={styles.actionsContainer}>
                          <TouchableOpacity
                            onPress={() => verProveedor(item)}
                            style={styles.actionIcon}
                          >
                            <FontAwesome name="eye" size={20} color="#424242" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => editarProveedor(item)}
                            style={styles.actionIcon}
                          >
                            <Feather name="edit" size={20} color="#424242" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => eliminarProveedor(item.id)}
                            style={styles.actionIcon}
                            disabled={deleting && idAEliminar === item.id}
                          >
                            {deleting && idAEliminar === item.id ? (
                              <ActivityIndicator
                                size="small"
                                color="#d32f2f"
                              />
                            ) : (
                              <Feather
                                name="trash-2"
                                size={20}
                                color="#d32f2f"
                              />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                />
              </View>

              {totalPaginas > 1 && (
                <View style={styles.paginationContainer}>
                  <Paginacion
                    paginaActual={paginaActual}
                    totalPaginas={totalPaginas}
                    cambiarPagina={cambiarPagina}
                  />
                </View>
              )}
            </>
          ) : (
            <ScrollView style={styles.scrollContainer}>
              <View style={styles.cardsContainer}>
                {proveedoresMostrar.map(item => (
                  <ProveedorCard
                    key={item.id.toString()}
                    item={item}
                    onVer={verProveedor}
                    onEditar={editarProveedor}
                    onEliminar={eliminarProveedor}
                  />
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* ─── footer ─── */}
        <View style={styles.footerContainer}>
          <Footer />
        </View>
      </View>

      {/* ─── modales CRUD ─── */}
      <CrearProveedor
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreateProveedor}
      />

      <DetalleProveedor
        visible={modalDetalleVisible}
        onClose={() => setModalDetalleVisible(false)}
        proveedor={proveedorSeleccionado}
      />

      <EditarProveedor
        visible={modalEditarVisible}
        onClose={() => setModalEditarVisible(false)}
        proveedor={proveedorSeleccionado}
        onUpdate={handleUpdateProveedor}
      />

      {/* ─── confirmación ─── */}                                     
      <ConfirmarModal
        visible={confirmVisible}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={confirmarEliminacion}
        title="Eliminar proveedor"
        message="¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer."
      />

      {/* ─── información ─── */}                                      
      <InfoModal
        visible={infoVisible}
        onClose={() => setInfoVisible(false)}
        title={infoTitle}
        message={infoMsg}
        type={infoType}
      />
    </View>
  );
};

/* ────────────────────────────── estilos ────────────────────────────── */
const styles = StyleSheet.create({
  /* layout principal */                                           
  mainContainer: { 
    flex: 1, 
    backgroundColor: '#F0FAF8' 
  },            
  contentWrapper: { 
    flex: 1, 
    justifyContent: 'space-between' 
  },   
  contentContainer: { 
    flex: 1, 
    padding: 16 
  },                     
  footerContainer: { 
    paddingHorizontal: 16, 
    paddingBottom: 16 
  },
  paginationContainer: {
    paddingBottom: 16
  },

  /* loading */
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#424242' },

  /* header */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#00695C', marginRight: 12 },
  counter: { backgroundColor: '#E8F8F5', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  counterText: { fontWeight: 'bold', fontSize: 14, color: '#00695C' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7FFFD4', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  addButtonText: { marginLeft: 8, color: '#2D2D2D', fontWeight: '500', fontSize: 14 },

  /* tabla desktop */
  table: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#7FFFD4', paddingVertical: 12 },
  headerCell: { justifyContent: 'center', paddingHorizontal: 8 },
  headerText: { fontWeight: 'bold', color: '#2D2D2D', fontSize: 14 },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: 'white' },
  cell: { justifyContent: 'center', paddingHorizontal: 8 },
  typeColumn: { flex: 1, alignItems: 'center' },
  idTypeColumn: { flex: 1, alignItems: 'center' },
  idColumn: { flex: 2, alignItems: 'center' },
  nameColumn: { flex: 3, alignItems: 'flex-start' },
  emailColumn: { flex: 2, alignItems: 'center' },
  actionsColumn: { flex: 2, alignItems: 'flex-end' },
  nameContainer: { flexDirection: 'row', alignItems: 'center' },
  nameText: { marginLeft: 10, fontWeight: '500', fontSize: 14, color: '#424242' },
  idText: { fontSize: 14, color: '#424242' },
  emailText: { fontSize: 14, color: '#424242' },
  actionsContainer: { flexDirection: 'row' },
  actionIcon: { marginHorizontal: 6, padding: 4 },

  /* mobile cards */
  scrollContainer: { flex: 1 },
  cardsContainer: { paddingBottom: 16 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#B2F0E8', shadowColor: '#7FFFD4', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardHeaderText: { marginLeft: 12, flex: 1 },
  cardNombre: { fontSize: 16, fontWeight: '600', color: '#212121', marginBottom: 2 },
  cardTipo: { fontSize: 14, color: '#757575' },
  cardDetails: { marginLeft: 52, marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailIcon: { marginRight: 8 },
  detailText: { fontSize: 14, color: '#616161' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  actionButton: { marginLeft: 12, padding: 8, borderRadius: 20, backgroundColor: '#F0FAF8', borderWidth: 1, borderColor: '#B2F0E8' },

  /* avatar */
  avatarContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  /* tipos */
  tipoContainer: { flexDirection: 'row', alignItems: 'center' },
  tipoTexto: { marginLeft: 6, fontSize: 14, color: '#424242' },
  tipoIdContainer: { flexDirection: 'row', alignItems: 'center' },
  tipoIdTexto: { marginLeft: 6, fontSize: 14, color: '#424242' },
});

export default ProveedoresScreen;