import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, StatusBar, KeyboardAvoidingView, Platform, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/InputField';
import { COLORS } from '../../constants/colors';

const passwordCriteria = [
  { label: 'At least 8 characters',         test: (p) => p.length >= 8 },
  { label: 'At least one uppercase letter',  test: (p) => /[A-Z]/.test(p) },
  { label: 'At least one lowercase letter',  test: (p) => /[a-z]/.test(p) },
  { label: 'At least one number',            test: (p) => /[0-9]/.test(p) },
  { label: 'At least one special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function RegisterScreen({ route, navigation }) {
  const role      = route?.params?.role || 'tenant';
  const isAdmin   = role === 'admin';
  const primary   = isAdmin ? COLORS.landlordPrimary : COLORS.tenantPrimary;
  const badgeLabel = isAdmin ? 'NEW LANDLORD' : 'NEW TENANT';

  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const allCriteriaMet = passwordCriteria.every(c => c.test(form.password));

  const set = key => val => { setForm(f => ({ ...f, [key]: val })); setError(''); };

  const handleRegister = async () => {
    const { firstName, lastName, phone, email, password } = form;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.'); return;
    }
    if (phone && (phone.length !== 11 || !phone.startsWith('09'))) {
      setError('Phone must be 11 digits starting with 09.'); return;
    }
    setLoading(true);
    setError('');
    const result = await register({
      first_name:   firstName.trim(),
      last_name:    lastName.trim(),
      phone_number: phone.trim(),
      email:        email.trim().toLowerCase(),
      password,
      role,
    });
    if (result.success) {
      Alert.alert(
        'Registration Successful',
        'Please check your email to verify your account before logging in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login', { role }) }]
      );
    } else {
      setError(result.message || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={s.brandRow}>
            <View style={s.houseBox}><Ionicons name="home" size={14} color={COLORS.landlordPrimary} /></View>
            <Text style={s.brandText}>UPAHAN</Text>
          </View>

          <View style={[s.badge, { backgroundColor: primary }]}>
            <Text style={s.badgeText}>{badgeLabel}</Text>
          </View>

          <Text style={s.heading}>Create Account</Text>
          <View style={[s.gold, { backgroundColor: primary }]} />
          <Text style={s.headingSub}>Join Upahan to manage your property easily.</Text>

          {error ? (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color={COLORS.dangerPrimary} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Name row */}
          <View style={s.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>First Name *</Text>
              <InputField placeholder="First" value={form.firstName} onChangeText={set('firstName')} autoCapitalize="words" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Last Name *</Text>
              <InputField placeholder="Last" value={form.lastName} onChangeText={set('lastName')} autoCapitalize="words" />
            </View>
          </View>

          <Text style={s.label}>Phone Number</Text>
          <InputField icon="call-outline" placeholder="09XXXXXXXXX" value={form.phone} onChangeText={t => set('phone')(t.replace(/\D/g, '').slice(0, 11))} keyboardType="phone-pad" />

          <Text style={s.label}>Email Address *</Text>
          <InputField icon="mail-outline" placeholder="you@example.com" value={form.email} onChangeText={set('email')} keyboardType="email-address" />

          <Text style={s.label}>Password *</Text>
          <InputField icon="lock-closed-outline" placeholder="Minimum 8 characters" value={form.password} onChangeText={set('password')} secureTextEntry />
          {form.password.length > 0 && (
            <View style={{ width: '100%', marginTop: 6, marginBottom: 4 }}>
              {passwordCriteria.map((c, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <Text style={{ color: c.test(form.password) ? '#2E7D32' : '#C62828', fontSize: 13 }}>
                    {c.test(form.password) ? '✓' : '✗'}
                  </Text>
                  <Text style={{ color: c.test(form.password) ? '#2E7D32' : '#C62828', fontSize: 13 }}>
                    {c.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[s.btn, { backgroundColor: primary }, (loading || !allCriteriaMet) && { opacity: 0.65 }]}
            onPress={handleRegister}
            disabled={loading || !allCriteriaMet}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>COMPLETE REGISTRATION</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.linkRow} onPress={() => navigation.navigate('Login', { role })}>
            <Text style={s.linkGray}>Already have an account?  </Text>
            <Text style={[s.linkColored, { color: primary }]}>LOG IN</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.pageBg },
  scroll:    { padding: 24, paddingBottom: 40, alignItems: 'center' },
  brandRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24, alignSelf: 'flex-start' },
  houseBox:  { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.landlordLight, alignItems: 'center', justifyContent: 'center' },
  brandText: { fontSize: 15, fontWeight: '800', color: COLORS.landlordPrimary, letterSpacing: 2 },
  badge:     { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 20 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1.5 },
  heading:   { fontSize: 32, fontWeight: '700', fontFamily: 'serif', color: COLORS.textPrimary, marginBottom: 10 },
  gold:      { width: 40, height: 2, marginBottom: 10 },
  headingSub:{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, textAlign: 'center' },
  errorBox:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.dangerLight, borderRadius: 10, padding: 12, marginBottom: 12, width: '100%' },
  errorText: { flex: 1, fontSize: 13, color: COLORS.dangerPrimary },
  nameRow:   { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 0 },
  label:     { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, marginTop: 14, alignSelf: 'flex-start', width: '100%' },
  btn:       { width: '100%', height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 16 },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 1.5 },
  linkRow:   { flexDirection: 'row', alignItems: 'center' },
  linkGray:  { fontSize: 14, color: COLORS.textSecondary },
  linkColored:{ fontSize: 14, fontWeight: '700' },
});
