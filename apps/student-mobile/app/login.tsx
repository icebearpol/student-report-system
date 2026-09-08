import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { BrandHeader } from '@/components/BrandHeader';
import { login } from '@/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('alex.chen@university.edu');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setError(''); setLoading(true);
    try { await login(email, password); router.replace('/(tabs)'); } catch (e:any){ setError(e.message);} finally{ setLoading(false); }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} style={styles.hero}>
        <BrandHeader variant="hero" />
      </LinearGradient>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome Back</Text>
        <Text style={styles.cardSub}>Sign in to access your dashboard and points.</Text>
        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
          <TextInput value={email} onChangeText={setEmail} placeholder="Student Email" placeholderTextColor={theme.colors.textSecondary} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={theme.colors.textSecondary} style={styles.input} secureTextEntry={!show} />
          <TouchableOpacity onPress={()=>setShow(!show)}><Ionicons name={show? 'eye-off-outline':'eye-outline'} size={20} color={theme.colors.textSecondary} /></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.forgot}><Text style={styles.forgotText}>Forgot Password?</Text></TouchableOpacity>
        <TouchableOpacity disabled={loading} onPress={onLogin} activeOpacity={0.9} style={styles.btnWrap}>
          <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.btn}>
            <Text style={styles.btnText}>{loading?'Signing in…':'Login'}</Text><Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.footer}><Text style={styles.footerText}>New here? </Text><Link href={"/signup" as any}><Text style={styles.link}>Create an Account</Text></Link></View>
        <Link href={"/anonymous" as any} style={styles.anonLink}><Text style={styles.anonText}>Continue anonymously →</Text></Link>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor: theme.colors.background },
  hero:{ alignItems:'center', justifyContent:'center', paddingTop:24, paddingBottom:20, paddingHorizontal:24 },
  card:{ backgroundColor:'#fff', borderTopLeftRadius:36, borderTopRightRadius:36, marginTop:-30, padding:24, flex:1, shadowColor:'#0A3C58', shadowOpacity:0.08, shadowRadius:20, elevation:8 },
  cardTitle:{ fontSize:20, fontWeight:'600', color: theme.colors.primary },
  cardSub:{ fontSize:14, color: theme.colors.textSecondary, marginTop:4 },
  errorBox:{ backgroundColor:'#ffdad6', borderRadius:8, padding:10, marginTop:12 },
  errorText:{ color:'#93000a', fontSize:13 },
  inputRow:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(232,247,251,0.5)', borderWidth:1, borderColor:'rgba(10,60,88,0.2)', borderRadius:24, paddingHorizontal:16, height:56, marginTop:16, gap:10 },
  input:{ flex:1, fontSize:15, color: theme.colors.text },
  forgot:{ alignSelf:'flex-end', marginTop:10 }, forgotText:{ color: theme.colors.primaryCyan, fontWeight:'600', fontSize:13 },
  btnWrap:{ marginTop:20 }, btn:{ height:56, borderRadius:28, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  btnText:{ color:'#fff', fontWeight:'600', fontSize:15 },
  footer:{ flexDirection:'row', justifyContent:'center', marginTop:20 }, footerText:{ color: theme.colors.textSecondary, fontSize:13 }, link:{ color: theme.colors.primary, fontWeight:'600' },
  anonLink:{ alignSelf:'center', marginTop:12 }, anonText:{ color: theme.colors.primaryCyan, fontWeight:'600' },
});
