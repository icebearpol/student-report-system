import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Stack.Screen options={{ headerShown: false, animation: 'slide_from_right' }} />

      {/* ===== Top: gradient "Hello, Welcome" card with logo ===== */}
      <LinearGradient
        colors={['#0F172A', '#0891B2', '#ECFEFF']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.topCard}
      >
        <Text style={styles.helloText}>Hello, Welcome!</Text>
        <Text style={styles.helloSubtext}>Glad to see you!</Text>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </LinearGradient>

      {/* ===== Bottom: white login form ===== */}
      <View style={styles.bottomSection}>
        <View style={styles.loginTitleRow}>
          <Text style={styles.loginTitleText}>Login </Text>
          <Text style={[styles.loginTitleText, styles.campusWord]}>Campus</Text>
          <Text style={[styles.loginTitleText, styles.fixWord]}>Fix</Text>
        </View>

        <View style={styles.inputGroup}>
          <LinearGradient
            colors={['#EFF6FF', '#E0F2FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.inputContainer}
          >
            <Feather name="user" size={18} color="#3B82F6" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Username or Email"
              placeholderTextColor="#8FAFD1"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </LinearGradient>

          <LinearGradient
            colors={['#EFF6FF', '#E0F2FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.inputContainer}
          >
            <Feather name="lock" size={18} color="#3B82F6" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8FAFD1"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </LinearGradient>

          <TouchableOpacity style={styles.forgotWrapper}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#0066FF', '#00C6FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.orText}>or login with social platforms</Text>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialCircle}>
            <FontAwesome name="facebook" size={20} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialCircle}>
            <FontAwesome name="google" size={20} color="#EA4335" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/signup')}
          activeOpacity={0.7}
          style={styles.registerRow}
        >
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerBold}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ---------- Top dark card ---------- */
  topCard: {
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
    paddingTop: 64,
    paddingBottom: 30,
    alignItems: 'center',
  },
  helloText: {
    marginTop: 15,
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  helloSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  logo: {
    width: 280,
    height: 250,
    marginTop: 19,
    marginBottom: 10
  },

  /* ---------- Bottom white section ---------- */
  bottomSection: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 30,
  },
  loginTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  loginTitleText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  campusWord: {
    color: '#0F172A',
  },
  fixWord: {
    color: '#0891B2',
  },
  iContainer: {
    width: 13,
    height: 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    marginHorizontal: 1,
  },
  iStem: {
    width: 3.5,
    height: 15,
    borderRadius: 2,
    backgroundColor: '#0F172A',
  },
  iDot: {
    position: 'absolute',
    top: -3,
  },

  inputGroup: {
    marginBottom: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CFE6FF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  forgotWrapper: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: 12,
    color: '#0066FF',
    fontWeight: '600',
  },

  loginButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    gap: 18,
  },
  socialCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  registerRow: {
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 13,
    color: '#64748B',
  },
  registerBold: {
    color: '#0066FF',
    fontWeight: '700',
  },
});