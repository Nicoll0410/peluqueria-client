import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Buscador = ({ placeholder, value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#B088C8" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginVertical: 12,
    height: 48,
    borderWidth: 2,
    borderColor: '#B2F0E8',
    shadowColor: '#7FFFD4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#2D2D2D',
    paddingLeft: 10,
    fontWeight: '500',
  },
  icon: {
    marginRight: 8,
    color: '#B088C8',
  },
});

export default Buscador;