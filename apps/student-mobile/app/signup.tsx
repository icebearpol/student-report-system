import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { signup } from '@/lib/auth';

export default function SignupScreen(){
  const router=useRouter();
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [pw,setPw]=useState(''); const [confirm,setConfirm]=useState(''); const [show,setShow]=useState(false); const [terms,setTerms]=useState(false); const [err,setErr]=useState(''); const [loading,setLoading]=useState(false);
  async function onSubmit(){
    if(pw!==confirm){setErr('Passwords do not match'); return;}
    if(!terms){setErr('Please accept Privacy Policy and Terms'); return;}
    setErr(''); setLoading(true);
    try{ await signup(name||email.split('@')[0], email, pw); router.replace('/(tabs)'); }catch(e:any){setErr(e.message)}finally{setLoading(false)}
  }
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerWrap}>
        <Image source={require('@/assets/campus-fix-logo.png')} style={styles.headerLogo} resizeMode="contain" />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.sub}>Join the community and help see change on campus.</Text>
        {err? <View style={styles.eb}><Text style={styles.et}>{err}</Text></View>:null}
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputRow}><Ionicons name="person-outline" size={18} color={theme.colors.textSecondary}/><TextInput value={name} onChangeText={setName} placeholder="Jane Doe" placeholderTextColor={theme.colors.textSecondary} style={styles.input}/></View>
        <Text style={styles.label}>Student Email</Text>
        <View style={styles.inputRow}><Ionicons name="mail-outline" size={18} color={theme.colors.textSecondary}/><TextInput value={email} onChangeText={setEmail} placeholder="jane.doe@university.edu" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={theme.colors.textSecondary} style={styles.input}/></View>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputRow}><Ionicons name="lock-closed-outline" size={18} color={theme.colors.textSecondary}/><TextInput value={pw} onChangeText={setPw} placeholder="••••••••" secureTextEntry={!show} placeholderTextColor={theme.colors.textSecondary} style={styles.input}/><TouchableOpacity onPress={()=>setShow(!show)}><Ionicons name={show?'eye-off-outline':'eye-outline'} size={18} color={theme.colors.textSecondary}/></TouchableOpacity></View>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputRow}><Ionicons name="lock-closed-outline" size={18} color={theme.colors.textSecondary}/><TextInput value={confirm} onChangeText={setConfirm} placeholder="••••••••" secureTextEntry placeholderTextColor={theme.colors.textSecondary} style={styles.input}/></View>
        <TouchableOpacity onPress={()=>setTerms(!terms)} style={styles.terms}><View style={[styles.box, terms && styles.boxChecked]}>{terms? <Ionicons name="checkmark" size={14} color="#fff"/>:null}</View><Text style={styles.termsText}>I agree to the Privacy Policy and Terms of Service.</Text></TouchableOpacity>
        <TouchableOpacity disabled={loading} onPress={onSubmit} style={styles.btnWrap}><LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.btn}><Text style={styles.btnText}>{loading?'Creating…':'Create Account'}</Text><Ionicons name="arrow-forward" size={18} color="#fff"/></LinearGradient></TouchableOpacity>
        <View style={styles.footer}><Text style={styles.footerText}>Already have an account? </Text><Link href={"/login" as any}><Text style={styles.link}>Sign In</Text></Link></View>
      </View>
    </ScrollView>
  );
}
const styles=StyleSheet.create({
  container:{ flex:1, backgroundColor: theme.colors.background },
  content:{ padding:24, paddingTop:60 },
  header:{ fontSize:32, fontWeight:'700', textAlign:'center', color: theme.colors.gradientStart, marginBottom:20 },
  headerWrap:{ alignItems:'center', justifyContent:'center', marginBottom:20 },
  headerLogo:{ width:160, height:48 },
  card:{ backgroundColor:'#fff', borderRadius:36, padding:24, gap:4, shadowColor:'#0A3C58', shadowOpacity:0.08, shadowRadius:20, elevation:6 },
  title:{ fontSize:24, fontWeight:'600', color: theme.colors.primary, textAlign:'center' },
  sub:{ fontSize:13, color: theme.colors.textSecondary, textAlign:'center', marginBottom:8 },
  eb:{ backgroundColor:'#ffdad6', borderRadius:8, padding:10, marginBottom:8 }, et:{ color:'#93000a', fontSize:13 },
  label:{ fontSize:12, fontWeight:'500', color: theme.colors.textSecondary, marginTop:8, marginLeft:8 },
  inputRow:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(232,247,251,0.5)', borderWidth:1, borderColor:'rgba(10,60,88,0.2)', borderRadius:12, paddingHorizontal:14, height:52, gap:10, marginTop:4 },
  input:{ flex:1, fontSize:15, color: theme.colors.text },
  terms:{ flexDirection:'row', gap:10, marginTop:12, alignItems:'flex-start' }, box:{ width:22, height:22, borderRadius:6, borderWidth:1, borderColor: theme.colors.outline, alignItems:'center', justifyContent:'center' }, boxChecked:{ backgroundColor: theme.colors.primaryCyan, borderColor: theme.colors.primaryCyan },
  termsText:{ flex:1, fontSize:13, color: theme.colors.textSecondary },
  btnWrap:{ marginTop:16 }, btn:{ height:56, borderRadius:28, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  btnText:{ color:'#fff', fontWeight:'600' },
  footer:{ flexDirection:'row', justifyContent:'center', marginTop:16 }, footerText:{ color: theme.colors.textSecondary, fontSize:13 }, link:{ color: theme.colors.primaryCyan, fontWeight:'600' },
});
