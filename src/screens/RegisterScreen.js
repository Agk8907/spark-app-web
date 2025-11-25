import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import typography from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { register, loading } = useAuth();
  const { theme } = useTheme();

  const handleRegister = async () => {
    setValidationError(''); // Clear previous errors
    const { username, name, email, password, confirmPassword } = formData;

    if (!username || !name || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const result = await register({ username, name, email, password });
    
    if (!result.success) {
      Alert.alert('Registration Failed', result.error || 'Please try again');
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.secondary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <LinearGradient
            colors={theme.primary.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Ionicons name="person-add-outline" size={70} color="#fff" />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our community today</Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.form}>
            {/* Validation Error Message */}
            {validationError ? (
              <View style={{ backgroundColor: '#ffebee', padding: 10, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ffcdd2' }}>
                <Text style={{ color: '#c62828', textAlign: 'center', fontWeight: 'bold' }}>{validationError}</Text>
              </View>
            ) : null}

            {/* Username Input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.background.card }]}>
              <Ionicons name="at-outline" size={20} color={theme.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text.primary }]}
                placeholder="Username"
                placeholderTextColor={theme.text.tertiary}
                value={formData.username}
                onChangeText={(value) => updateFormData('username', value)}
                autoCapitalize="none"
              />
            </View>

            {/* Name Input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.background.card }]}>
              <Ionicons name="person-outline" size={20} color={theme.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text.primary }]}
                placeholder="Full Name"
                placeholderTextColor={theme.text.tertiary}
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
              />
            </View>

            {/* Email Input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.background.card }]}>
              <Ionicons name="mail-outline" size={20} color={theme.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text.primary }]}
                placeholder="Email address"
                placeholderTextColor={theme.text.tertiary}
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Password Input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.background.card }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text.primary }]}
                placeholder="Password"
                placeholderTextColor={theme.text.tertiary}
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.background.card }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text.primary }]}
                placeholder="Confirm Password"
                placeholderTextColor={theme.text.tertiary}
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={theme.primary.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>Sign Up</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: theme.text.secondary }]}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: theme.primary.main }]}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 1.5,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: '#fff',
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: '#fff',
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  form: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
  },
  registerButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  registerButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    fontSize: typography.sizes.md,
  },
  loginLink: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});

export default RegisterScreen;
