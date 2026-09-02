import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <LinearGradient
      colors={['#0F172A', '#0891B2', '#ECFEFF', '#ECFEFF']}
      locations={[0, 0.28, 0.5, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.background}
    >
      <Stack.Screen options={{ headerShown: false, animation: 'slide_from_left' }} />

      {/* Uses the real safe-area top inset instead of a fixed number, so
          this sits correctly below the notch/Dynamic Island/status bar
          on any device. */}
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        style={[styles.backButton, { top: insets.top + 12 }]}
      >
        <Feather name="arrow-left" size={20} color="#0F172A" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 44 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* maxWidth keeps this from stretching edge-to-edge on a tablet */}
          <View style={styles.centeredColumn}>
            {/* Big hero logo, sitting outside/above the card */}
            <Image
              source={require('../assets/logo.png')}
              style={styles.heroLogo}
              resizeMode="contain"
            />

            <View style={styles.card}>
              <Text style={styles.title}>Create your Account</Text>
              <Text style={styles.subtitle}>Join the CampusFix community</Text>

              <View style={styles.inputGroup}>
                <LinearGradient
                  colors={['#EFF6FF', '#E0F2FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.inputContainer}
                >
                  <Feather name="mail" size={17} color="#3B82F6" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#8FAFD1"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </LinearGradient>

                <LinearGradient
                  colors={['#EFF6FF', '#E0F2FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.inputContainer}
                >
                  <Feather name="lock" size={17} color="#3B82F6" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#8FAFD1"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </LinearGradient>

                <LinearGradient
                  colors={['#EFF6FF', '#E0F2FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.inputContainer}
                >
                  <Feather name="lock" size={17} color="#3B82F6" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#8FAFD1"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </LinearGradient>
              </View>

              <TouchableOpacity
                onPress={() => router.replace('/(tabs)')}
                activeOpacity={0.85}
                style={styles.signupButtonWrapper}
              >
                <LinearGradient
                  colors={['#0F172A', '#0891B2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signupButton}
                >
                  <Text style={styles.signupButtonText}>Sign up</Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.orText}>— Or sign up with —</Text>

              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialCircle}>
                  <FontAwesome name="facebook" size={19} color="#1877F2" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialCircle}>
                  <FontAwesome name="google" size={19} color="#EA4335" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/login')}
                activeOpacity={0.7}
                style={styles.loginRow}
              >
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginBold}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  centeredColumn: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },

  heroLogo: {
    alignSelf: 'center',
    width: 295,
    height: 260,
    marginTop: 10,
    marginBottom: 10,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 34,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 22,
  },

  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CFE6FF',
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },

  signupButtonWrapper: {
    width: '100%',
  },
  signupButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0891B2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  orText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 22,
    marginBottom: 14,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginRow: {
    marginTop: 22,
  },
  loginText: {
    fontSize: 13,
    color: '#64748B',
  },
  loginBold: {
    color: '#0891B2',
    fontWeight: '700',
  },
});