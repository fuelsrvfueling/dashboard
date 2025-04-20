import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useFonts, Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import AppLoading from 'expo-app-loading';

export default function LoginScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const passwordInputRef = useRef();

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
  });

  useEffect(() => {
    const delaySplash = setTimeout(() => {
      setInitialLoading(false);
    }, 1500); // 1.5 seconds minimum splash

    return () => clearTimeout(delaySplash);
  }, []);

  if (!fontsLoaded || initialLoading) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require('../assets/Logo-Website.png')} style={styles.splashLogo} resizeMode="contain" />
        <Text style={styles.splashText}>Loading FuelSrv...</Text>
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      </View>
    );
  }

  const onSubmit = async (data) => {
    if (!data.email || !data.password) {
      Alert.alert('Error', 'Email and password are required.');
      return;
    }

    setLoading(true);
    console.log('🔐 Submitting login for:', data.email);

    try {
      const response = await fetch('https://us-central1-fuelsrv-dashboard.cloudfunctions.net/loginProxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      console.log('🧾 Login result:', result);

      if (result.success) {
        navigation.navigate('Dashboard', {
          email: data.email,
          sheetId: result.sheetId,
          sheetName: result.sheetName,
        });
      } else {
        Alert.alert('Login Failed', result.message || 'Please check your credentials');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert('Error', error.message || 'Unable to connect to login server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Image source={require('../assets/Logo-Website.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>FuelSrv Dashboard</Text>

      <Controller
        control={control}
        name="email"
        rules={{ required: 'Email is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={value}
            onChangeText={onChange}
            keyboardType="email-address"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        rules={{ required: 'Password is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            ref={passwordInputRef}
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry
            value={value}
            autoCorrect={false}
            onChangeText={onChange}
            onSubmitEditing={handleSubmit(onSubmit)}
            returnKeyType="done"
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 80,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#1CA84D',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  error: {
    color: 'red',
    fontFamily: 'Nunito_400Regular',
    marginBottom: 8,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1CA84D',
  },
  splashLogo: {
    width: 200,
    height: 90,
    marginBottom: 16,
  },
  splashText: {
    fontSize: 22,
    color: 'white',
    fontFamily: 'Nunito_700Bold',
  },
});