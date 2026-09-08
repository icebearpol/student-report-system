import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { BrandHeader } from '@/components/BrandHeader';

export default function AnonymousScreen(){
  const router=useRouter();
  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} style={styles.hero}>
        <BrandHeader variant="anonymous" />
      </LinearGradient>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.h2}>Ready to report?</Text>
        <Text style={styles.p}>Help improve our campus infrastructure quickly and securely.</Text>
        <View style={styles.privacy}>
          <Ionicons name="shield-checkmark" size={22} color={theme.colors.primaryCyan} />
          <View style={{flex:1}}>
            <Text style={styles.privacyTitle}>Privacy First</Text>
            <Text style={styles.privacyText}>No personal identifiers are stored. Your location and report details are completely anonymized.</Text>
          </View>
        </View>
        <TouchableOpacity onPress={()=>router.push('/(tabs)' as any)} activeOpacity={0.9} style={styles.btnWrap}>
          <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.btn}>
            <Text style={styles.btnText}>Proceed Anonymously</Text><Ionicons name="arrow-forward" size={16} color="#fff"/>
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.footer}><Text style={styles.footerText}>Want to earn points or track personal reports?</Text><TouchableOpacity onPress={()=>router.push('/login' as any)}><Text style={styles.link}>Sign In</Text></TouchableOpacity></View>
      </View>
    </View>
  );
}
const styles=StyleSheet.create({
  container:{ flex:1, backgroundColor: theme.colors.background },
  hero:{ height:'60%', alignItems:'center', justifyContent:'center', paddingBottom:40 },
  h2:{ fontSize:20, fontWeight:'600', color: theme.colors.text, marginTop:16 },
  p:{ fontSize:14, color: theme.colors.textSecondary, textAlign:'center', marginTop:6, marginBottom:16 },
  sheet:{ position:'absolute', bottom:0, width:'100%', height:'50%', backgroundColor:'#fff', borderTopLeftRadius:36, borderTopRightRadius:36, padding:24, alignItems:'center', shadowColor:'#0A3C58', shadowOpacity:0.12, shadowRadius:30, elevation:12 },
  handle:{ width:48, height:6, borderRadius:3, backgroundColor:'#d6e5e9', position:'absolute', top:10 },
  privacy:{ flexDirection:'row', gap:12, backgroundColor: theme.colors.background, borderWidth:1, borderColor:'rgba(70,195,219,0.2)', borderRadius:20, padding:14, width:'100%' },
  privacyTitle:{ fontWeight:'600', fontSize:13, color: theme.colors.text }, privacyText:{ fontSize:12, color: theme.colors.textSecondary, marginTop:2 },
  btnWrap:{ width:'100%', marginTop:16 }, btn:{ height:52, borderRadius:26, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  btnText:{ color:'#fff', fontWeight:'600' },
  footer:{ alignItems:'center', marginTop:16 }, footerText:{ fontSize:12, color: theme.colors.textSecondary }, link:{ color: theme.colors.primaryCyan, fontWeight:'600', fontSize:13, marginTop:4 },
});
