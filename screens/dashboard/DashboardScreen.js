import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
  ActivityIndicator, Image, TouchableOpacity
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import Footer from '../../components/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

// 🎨 PALETA ALBA QUICENO
const COLORS = {
  morado: '#B088C8',
  moradoOscuro: '#9B6FB0',
  rosado: '#E8C4D8',
  aguamarina: '#7FFFD4',
  aguamarinaOscuro: '#5FE0C8',
  blanco: '#FFFFFF',
  negro: '#2D2D2D',
};

const DashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState({
    topHoras: [],
    topServicios: [],
    tiposDeUsuarios: [
      { name: 'Clientes', population: 0, color: '#7FFFD4', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      { name: 'Estilistas', population: 0, color: '#B088C8', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      { name: 'Admin', population: 0, color: '#E8C4D8', legendFontColor: '#7F7F7F', legendFontSize: 15 }
    ],
    totalUsuarios: 0,
    topBarberos: [],
    citasCompletadasTotales: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('https://peluqueria-server-gw54.onrender.com/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const tiposUsuarios = response.data.tiposDeUsuarios || [];
      const tiposProcesados = [
        { name: 'Clientes', population: 0, color: '#B088C8', legendFontColor: '#7F7F7F', legendFontSize: 15 },
        { name: 'Estilistas', population: 0, color: '#E8C4D8', legendFontColor: '#7F7F7F', legendFontSize: 15 },
        { name: 'Admin', population: 0, color: '#7FFFD4', legendFontColor: '#7F7F7F', legendFontSize: 15 }
      ];

      tiposUsuarios.forEach(item => {
        if (item.label.includes('Cliente') || item.label.includes('Paciente')) {
          tiposProcesados[0].population += item.value;
        } else if (item.label.includes('Barbero') || item.label.includes('Cosmetólogo')) {
          tiposProcesados[1].population += item.value;
        } else if (item.label.includes('Admin')) {
          tiposProcesados[2].population += item.value;
        }
      });

      setDashboardData({
        topHoras: response.data.topHoras || [],
        topServicios: response.data.topServicios || [],
        tiposDeUsuarios: tiposProcesados,
        totalUsuarios: response.data.totalUsuarios || 0,
        topBarberos: response.data.topBarberos || [],
        citasCompletadasTotales: response.data.citasCompletadasTotales || 0
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchDashboardData(); }, []));

  useEffect(() => {
    const onChange = ({ window }) => setDimensions(window);
    Dimensions.addEventListener('change', onChange);
    return () => Dimensions.removeEventListener('change', onChange);
  }, []);

  const isMobile = dimensions.width < 768;
  const chartWidth = isMobile ? dimensions.width * 0.85 : dimensions.width * 0.4;

  const formatNumber = (value) => value.toLocaleString('es-CO');

  const truncateServiceName = (name, maxLength = 15) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    barPercentage: 0.6,
    propsForLabels: { fontSize: isMobile ? 10 : 12, fontWeight: 'bold' },
    fillShadowGradient: '#7FFFD4',
    fillShadowGradientOpacity: 1,
    propsForBackgroundLines: { strokeDasharray: '', stroke: '#E8D5F0' },
    formatYLabel: (value) => formatNumber(value),
    formatTopBarValue: (value) => formatNumber(value),
    formatTooltipY: (value) => formatNumber(value),
    style: { borderRadius: 16, paddingRight: 40 },
    propsForVerticalLabels: { fontWeight: 'bold' },
    propsForHorizontalLabels: { fontWeight: 'bold' },
    barRadius: 6,
    yAxisLabel: '',
    yLabelsOffset: 10,
    xLabelsOffset: 10,
  };

  const pieChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForLabels: { fontSize: isMobile ? 10 : 12, fontWeight: 'bold' },
    style: { borderRadius: 16 },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B088C8" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={40} color="#E74C3C" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchDashboardData} style={styles.retryButton}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, isMobile && styles.titleMobile]}>Dashboard</Text>

        {/* Tarjetas de resumen */}
        <View style={[styles.summaryContainer, isMobile && styles.summaryContainerMobile]}>
          <TouchableOpacity style={[styles.summaryCard, styles.summaryCardPrimary]}>
            <LinearGradient
              colors={['#7FFFD4', '#5FE0C8']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.summaryContent}>
                <Icon name="event-available" size={24} color="#fff" />
                <Text style={styles.summaryTitle}>Citas completadas</Text>
                <Text style={styles.summaryValue}>{formatNumber(dashboardData.citasCompletadasTotales)}</Text>
                <Text style={styles.summarySubtitle}>Total histórico</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.summaryCard, styles.summaryCardSecondary]}>
            <LinearGradient
              colors={['#B088C8', '#9B6FB0']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.summaryContent}>
                <Icon name="people" size={24} color="#fff" />
                <Text style={styles.summaryTitle}>Usuarios registrados</Text>
                <Text style={styles.summaryValue}>{formatNumber(dashboardData.totalUsuarios)}</Text>
                <Text style={styles.summarySubtitle}>Total verificados</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Gráficos */}
        <View style={[styles.chartsRow, isMobile && styles.chartsRowMobile]}>
          {/* Horas con más citas */}
          <View style={[styles.chartContainer, isMobile && styles.chartContainerMobile]}>
            <View style={styles.chartHeader}>
              <Icon name="access-time" size={20} color="#B088C8" />
              <Text style={styles.chartTitle}>Horas con más citas</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.chartScrollContainer} contentContainerStyle={styles.chartScrollContent}>
              <BarChart
                data={{
                  labels: dashboardData.topHoras.map(item => item.label),
                  datasets: [{
                    data: dashboardData.topHoras.map(item => item.value),
                    color: (opacity = 1) => `rgba(127, 255, 212, ${opacity})`,
                    colors: dashboardData.topHoras.map((_, index) =>
                      (opacity = 1) => `rgba(176, 136, 200, ${0.7 + (index * 0.05)})`
                    )
                  }]
                }}
                width={Math.max(isMobile ? dimensions.width * 0.9 : dimensions.width * 0.45, dashboardData.topHoras.length * 60 + 100)}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero
                showValuesOnTopOfBars
                withCustomBarColorFromData
                flatColor
                yAxisLabel=""
                yAxisSuffix=""
              />
            </ScrollView>
          </View>

          {/* Servicios más solicitados */}
          <View style={[styles.chartContainer, isMobile && styles.chartContainerMobile]}>
            <View style={styles.chartHeader}>
              <Icon name="content-cut" size={20} color="#7FFFD4" />
              <Text style={styles.chartTitle}>Servicios más solicitados</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.chartScrollContainer} contentContainerStyle={styles.chartScrollContent}>
              <BarChart
                data={{
                  labels: dashboardData.topServicios.map(item => truncateServiceName(item.label)),
                  datasets: [{
                    data: dashboardData.topServicios.map(item => item.value),
                    color: (opacity = 1) => `rgba(176, 136, 200, ${opacity})`,
                    colors: dashboardData.topServicios.map((_, index) =>
                      (opacity = 1) => `rgba(127, 255, 212, ${0.7 + (index * 0.05)})`
                    )
                  }]
                }}
                width={Math.max(isMobile ? dimensions.width * 0.9 : dimensions.width * 0.45, dashboardData.topServicios.length * 80 + 100)}
                height={240}
                chartConfig={{ ...chartConfig, propsForLabels: { fontSize: isMobile ? 9 : 11, fontWeight: 'bold' }, propsForHorizontalLabels: { fontSize: isMobile ? 9 : 11, fontWeight: 'bold', rotation: isMobile ? -45 : 0 } }}
                style={styles.chart}
                fromZero
                showValuesOnTopOfBars
                withCustomBarColorFromData
                flatColor
                yAxisLabel=""
                yAxisSuffix=""
                verticalLabelRotation={isMobile ? -45 : 0}
              />
            </ScrollView>
          </View>
        </View>

        {/* Segunda línea */}
        <View style={[styles.chartsRow, isMobile && styles.chartsRowMobile]}>
          {/* Tipos de usuarios */}
          <View style={[styles.chartContainer, isMobile && styles.chartContainerMobile]}>
            <View style={styles.chartHeader}>
              <Icon name="pie-chart" size={20} color="#B088C8" />
              <Text style={styles.chartTitle}>Distribución de usuarios</Text>
              <Text style={styles.chartSubtitle}>Total: {formatNumber(dashboardData.totalUsuarios)}</Text>
            </View>
            <View style={styles.pieChartWrapper}>
              <PieChart
                data={dashboardData.tiposDeUsuarios}
                width={isMobile ? dimensions.width * 0.85 : dimensions.width * 0.42}
                height={200}
                chartConfig={pieChartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                center={[isMobile ? 10 : 20, 0]}
                absolute
                hasLegend
              />
            </View>
          </View>

          {/* Top estilistas */}
          <View style={[styles.chartContainer, isMobile && styles.chartContainerMobile]}>
            <View style={styles.chartHeader}>
              <Icon name="star" size={20} color="#E8C4D8" />
              <Text style={styles.chartTitle}>Top estilistas</Text>
              <Text style={styles.chartSubtitle}>Por citas atendidas</Text>
            </View>
            <ScrollView style={styles.barberosScrollContainer} showsVerticalScrollIndicator={true}>
              <View style={styles.barberosContainer}>
                {dashboardData.topBarberos.map((barbero, index) => (
                  <TouchableOpacity key={barbero.id || index} style={styles.barberoItem}>
                    <View style={styles.barberoInfo}>
                      <View style={styles.barberoRank}>
                        <Text style={styles.barberoRankText}>{index + 1}</Text>
                      </View>
                      {barbero.avatar ? (
                        <Image source={{ uri: barbero.avatar }} style={styles.avatar} />
                      ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                          <Text style={styles.avatarText}>{barbero.nombre ? barbero.nombre.charAt(0) : 'E'}</Text>
                        </View>
                      )}
                      <Text style={styles.barberoName}>{barbero.nombre || `Estilista ${index + 1}`}</Text>
                    </View>
                    <View style={styles.barberoStats}>
                      <Text style={styles.barberoCitas}>{barbero.citas || 0} citas</Text>
                      <Icon name="chevron-right" size={20} color="#B088C8" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FDF8FC' },
  container: { padding: 16, paddingBottom: 80 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF8FC' },
  pieChartWrapper: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', width: '100%' },
  loadingText: { marginTop: 20, color: '#B088C8', fontSize: 16, fontWeight: 'bold' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF8FC', padding: 20 },
  errorText: { color: '#E74C3C', fontSize: 16, textAlign: 'center', marginTop: 10, fontWeight: 'bold' },
  retryButton: { marginTop: 20, backgroundColor: '#B088C8', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#00695C', textAlign: 'center' },
  titleMobile: { textAlign: 'center', marginLeft: 8, marginBottom: 16 },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryContainerMobile: { flexDirection: 'column', alignItems: 'center', gap: 16 },
  summaryCard: { borderRadius: 16, width: '48%', overflow: 'hidden', elevation: 6, shadowColor: '#B088C8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  summaryCardMobile: { width: '100%' },
  gradient: { padding: 24, borderRadius: 16 },
  summaryContent: { alignItems: 'center' },
  summaryTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 5 },
  summaryValue: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 5 },
  summarySubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  chartsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  chartsRowMobile: { flexDirection: 'column', alignItems: 'center', gap: 20 },
  chartContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '48%', elevation: 3, shadowColor: '#B088C8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, maxHeight: 320 },
  chartContainerMobile: { width: '100%' },
  chartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  chartTitle: { fontSize: 16, fontWeight: '600', color: '#2D2D2D', marginLeft: 8 },
  chartSubtitle: { fontSize: 12, color: '#B088C8', marginLeft: 'auto' },
  chartScrollContainer: { flex: 1 },
  chartScrollContent: { flexGrow: 1 },
  chart: { borderRadius: 16 },
  barberosScrollContainer: { maxHeight: 200 },
  barberosContainer: { paddingRight: 5 },
  barberoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E8D5F0' },
  barberoInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  barberoRank: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F3E8FA', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  barberoRankText: { fontWeight: 'bold', color: '#00695C' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  avatarPlaceholder: { backgroundColor: '#5FE0C8', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  barberoName: { fontSize: 14, color: '#2D2D2D', fontWeight: '500', flex: 1 },
  barberoStats: { flexDirection: 'row', alignItems: 'center' },
  barberoCitas: { fontSize: 14, fontWeight: 'bold', color: '#00695C', marginRight: 5 },
});

export default DashboardScreen;