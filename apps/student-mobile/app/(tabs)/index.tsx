import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { currentStudent, mockReports, getReportsByUser } from '@campus/mock-data';
import { ReportCard } from '@/components/ReportCard';
import { theme } from '@/constants/theme';
import { fabShadow } from '@/constants/platformShadow';

export default function HomeScreen() {
  const router = useRouter();
  const reports = getReportsByUser(currentStudent.id);
  const open = mockReports.filter(r=>r.status==='pending').length;
  const progress = mockReports.filter(r=>r.status==='in_review').length;
  const resolved = mockReports.filter(r=>r.status==='resolved').length;
  const recent = [...mockReports].slice(0,3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom:24}} showsVerticalScrollIndicator={false}>
      {/* TopAppBar */}
      <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} style={styles.topBar}>
        <Ionicons name="menu" size={24} color="#fff" />
        <View style={styles.topBrand}>
          <Image source={require('@/assets/icon.png')} style={styles.topMark} resizeMode="contain" />
          <Text style={styles.topTitle}>CampusFix</Text>
        </View>
        <Ionicons name="notifications-outline" size={22} color="#fff" />
      </LinearGradient>

      {/* Hero */}
      <View style={styles.heroWrap}>
        <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} style={styles.hero}>
          <Text style={styles.heroHello}>Hello, Student!</Text>
          <Text style={styles.heroSub}>Here&apos;s your campus overview today.</Text>
          <View style={styles.chips}>
            <View style={styles.chip}><View style={[styles.dot,{backgroundColor: theme.colors.danger}]}/><Text style={styles.chipText}>Open: {open}</Text></View>
            <View style={styles.chip}><View style={[styles.dot,{backgroundColor: theme.colors.warning}]}/><Text style={styles.chipText}>In Progress: {progress}</Text></View>
            <View style={styles.chip}><View style={[styles.dot,{backgroundColor: theme.colors.success}]}/><Text style={styles.chipText}>Resolved: {resolved}</Text></View>
          </View>
          <TouchableOpacity onPress={()=>router.push('/new-report')} activeOpacity={0.9} style={styles.heroBtn}><Ionicons name="add-circle" size={20} color={theme.colors.primary}/><Text style={styles.heroBtnText}>Report an Issue</Text></TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          <TouchableOpacity onPress={()=>router.push('/new-report')} style={styles.actionCard}><View style={styles.actionIcon}><Ionicons name="camera-outline" size={26} color={theme.colors.primary}/></View><Text style={styles.actionText}>Camera / Report</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>router.push('/(tabs)/issues' as any)} style={styles.actionCard}><View style={styles.actionIcon}><Ionicons name="map-outline" size={26} color={theme.colors.primary}/></View><Text style={styles.actionText}>View Public Map</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>router.push('/(tabs)/history' as any)} style={styles.actionCard}><View style={styles.actionIcon}><Ionicons name="time-outline" size={26} color={theme.colors.primary}/></View><Text style={styles.actionText}>My History</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard,{borderColor:'rgba(239,68,68,0.2)'}]}><View style={[styles.actionIcon,{backgroundColor:'#ffdad6'}]}><Ionicons name="call" size={22} color={theme.colors.danger}/></View><Text style={styles.actionText}>Emergency</Text></TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.feedHeader}><Text style={styles.sectionTitle}>Recent Activity</Text><TouchableOpacity onPress={()=>router.push('/(tabs)/issues' as any)}><Text style={styles.viewAll}>View All</Text></TouchableOpacity></View>
        <View style={styles.feedCard}>
          {recent.map((r,i)=> (
            <TouchableOpacity key={r.id} onPress={()=>router.push(`/report/${r.id}` as any)} style={[styles.feedItem, i<recent.length-1 && {borderBottomWidth:1, borderBottomColor:'#dcebef'}]}>
              <View style={styles.feedThumb}><Ionicons name="image-outline" size={22} color={theme.colors.textSecondary}/></View>
              <View style={{flex:1}}>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}><Text style={styles.feedTitle} numberOfLines={1}>{r.title}</Text><View style={[styles.badge, {backgroundColor: r.status==='pending'? theme.colors.danger : r.status==='in_review'? theme.colors.warning : theme.colors.success}]}><Text style={styles.badgeText}>{r.status==='pending'?'Open': r.status==='in_review'?'In Progress':'Resolved'}</Text></View></View>
                <Text style={styles.feedDesc} numberOfLines={1}>{r.description}</Text>
                <Text style={styles.feedMeta}>{r.category} • {r.location}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* fallback my reports list below */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Reports</Text>
        {reports.length===0? <View style={styles.empty}><Ionicons name="document-text-outline" size={48} color={theme.colors.border}/><Text style={styles.emptyText}>Tap + to submit</Text></View> : reports.map(r=> <ReportCard key={r.id} report={r}/>)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14, backgroundColor: theme.colors.gradientStart },
  topBrand:{ flexDirection:'row', alignItems:'center', gap:8 },
  topMark:{ width:32, height:32 },
  topTitle:{ color:'#fff', fontSize:16, fontWeight:'600' },
  heroWrap:{ paddingHorizontal:16, marginTop:12 },
  hero:{ borderRadius:16, padding:16, overflow:'hidden' },
  heroHello:{ fontSize:28, fontWeight:'700', color:'#fff' },
  heroSub:{ color:'rgba(255,255,255,0.8)', marginTop:4 },
  chips:{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:16 },
  chip:{ flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'rgba(255,255,255,0.2)', paddingHorizontal:12, paddingVertical:6, borderRadius:20 },
  chipText:{ color:'#fff', fontSize:12, fontWeight:'600' },
  dot:{ width:8, height:8, borderRadius:4 },
  heroBtn:{ backgroundColor:'#fff', borderRadius:28, height:48, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, marginTop:18 },
  heroBtnText:{ color: theme.colors.primary, fontWeight:'600' },
  section:{ paddingHorizontal:16, marginTop:20 },
  sectionTitle:{ fontSize:18, fontWeight:'600', color: theme.colors.primary },
  grid:{ flexDirection:'row', flexWrap:'wrap', gap:12, marginTop:12 },
  actionCard:{ width:'48%', backgroundColor:'#fff', borderRadius:16, padding:16, alignItems:'center', gap:10, borderWidth:1, borderColor:'#dcebef', shadowColor:'#0A3C58', shadowOpacity:0.08, shadowRadius:12, elevation:3 },
  actionIcon:{ width:48, height:48, borderRadius:24, backgroundColor:'#dcebef', alignItems:'center', justifyContent:'center' },
  actionText:{ fontSize:13, fontWeight:'600', color: theme.colors.text, textAlign:'center' },
  feedHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  viewAll:{ color: theme.colors.primaryCyan, fontSize:12, fontWeight:'600' },
  feedCard:{ backgroundColor:'#fff', borderRadius:16, marginTop:8, overflow:'hidden', borderWidth:1, borderColor:'#dcebef' },
  feedItem:{ flexDirection:'row', gap:12, padding:12, alignItems:'center' },
  feedThumb:{ width:48, height:48, borderRadius:10, backgroundColor:'#dcebef', alignItems:'center', justifyContent:'center' },
  feedTitle:{ flex:1, fontWeight:'600', color: theme.colors.text, fontSize:13 },
  feedDesc:{ color: theme.colors.textSecondary, fontSize:12, marginTop:2 },
  feedMeta:{ color:'#72787e', fontSize:10, marginTop:2, letterSpacing:0.5 },
  badge:{ paddingHorizontal:8, paddingVertical:2, borderRadius:10, marginLeft:8 },
  badgeText:{ color:'#fff', fontSize:10, fontWeight:'600' },
  empty: { alignItems:'center', padding:16 },
  emptyText: { color: theme.colors.textSecondary, marginTop:8, fontSize:12 },
});
