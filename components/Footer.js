import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Footer = ({ dark = false }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={[
      styles.container, 
      isMobile && styles.mobileContainer,
      dark && styles.darkContainer
    ]}>
      <View style={styles.content}>
        <Text style={[styles.text, dark && styles.darkText]}>
          © 2025 - 2026  •  Salón Alba Quiceno
        </Text>

        <View style={styles.dividerDot}>
          <Text style={[styles.dot, dark && styles.darkDot]}>•</Text>
        </View>

        <View style={[styles.authors, isMobile && styles.authorsMobile]}>
          <TouchableOpacity style={styles.authorLink}>
            <Ionicons name="person" size={12} color={dark ? "#E8C4D8" : "#B088C8"} />
            <Text style={[styles.text, styles.highlight, dark && styles.darkHighlight]}>
              {' '}Nicoll Andrea Giraldo Franco
            </Text>
          </TouchableOpacity>

          {!isMobile && <Text style={[styles.text, dark && styles.darkText]}>  |  </Text>}

          <TouchableOpacity style={styles.authorLink}>
            <Ionicons name="person" size={12} color={dark ? "#E8C4D8" : "#B088C8"} />
            <Text style={[styles.text, styles.highlight, dark && styles.darkHighlight]}>
              {' '}Luis Miguel Chica Ruíz
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDF8FC',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8D5F0',
  },
  darkContainer: {
    backgroundColor: '#2D2D2D',
    borderTopColor: '#B088C8',
  },
  mobileContainer: {
    position: 'fixed',
    bottom: 0, left: 0, right: 0, zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    flexWrap: 'wrap',
  },
  authors: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorsMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 4,
  },
  authorLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  text: {
    fontSize: 12,
    color: '#6B6B6B',
    fontFamily: Platform.OS === 'web' ? 'Raleway, sans-serif' : 'sans-serif',
  },
  darkText: {
    color: '#CCCCCC',
  },
  highlight: {
    color: '#B088C8',
    fontWeight: '500',
  },
  darkHighlight: {
    color: '#E8C4D8',
  },
  dividerDot: {
    marginHorizontal: 10,
  },
  dot: {
    color: '#E8C4D8',
    fontSize: 16,
  },
  darkDot: {
    color: '#B088C8',
  },
});

export default Footer;