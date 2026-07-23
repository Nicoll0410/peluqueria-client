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
        <Text style={[styles.text, dark && styles.darkText]}>© 2025 - 2026. Salón Alba Quiceno</Text>

        <View style={[styles.authors, isMobile && styles.authorsMobile]}>
          <TouchableOpacity style={styles.authorLink}>
            <Ionicons name="person" size={14} color={dark ? "#7FFFD4" : "#1E90FF"} />
            <Text style={[styles.text, styles.highlight, dark && styles.darkHighlight]}>
              {' '}Nicoll Andrea Giraldo Franco.
            </Text>
          </TouchableOpacity>

          {!isMobile && <Text style={[styles.text, dark && styles.darkText]}> | </Text>}

          <TouchableOpacity style={styles.authorLink}>
            <Ionicons name="person" size={14} color={dark ? "#7FFFD4" : "#1E90FF"} />
            <Text style={[styles.text, styles.highlight, dark && styles.darkHighlight]}>
              {' '}Luis Miguel Chica Ruíz.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#7FFFD4',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkContainer: {
    backgroundColor: '#1A1A1A',
    borderTopColor: '#7FFFD4',
  },
  mobileContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    flexWrap: 'wrap',
  },
  authors: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  authorsMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 4,
    marginTop: 2,
  },
  authorLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  text: {
    fontSize: 13,
    color: '#1A1A1A',
  },
  darkText: {
    color: '#FFFFFF',
  },
  highlight: {
    color: '#1E90FF',
    fontWeight: '500',
  },
  darkHighlight: {
    color: '#7FFFD4',
  },
});

export default Footer;