import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { currentStudent, getReportsByUser } from '@campus/mock-data';
import { theme } from '@/constants/theme';

type Filter='all'|'active'|'resolved';
export default function MyReportsScreen(){
  const router=useRouter();
  const [filter,setFilter]=useState<Filter>('all');
  const reports=getReportsByUser(currentStudent.id);
  const filtered = filter==='all'? reports : filter==='active'? reports.filter(r=>r.status!=='resolved' && r.status!=='rejected') : reports.filter(r=>r.status==='resolved');
  // pick first report to show timeline demo (first filtered or first overall)
  const demo = filtered[0] ?? reports[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding:16, paddingBottom:32}}>
      <Text style={styles.title}>My Reports</Text>
      <View style={styles.filters}>
        {(['all','active','resolved'] as Filter[]).map(f=>(
          <TouchableOpacity key={f} onPress={()=>setFilter(f)} style={[styles.fBtn, filter===f && styles.fActive]}><Text style={[styles.fText, filter===f && styles.fTextActive]}>{f==='all'?'All': f==='active'?'Active':'Resolved'}</Text></TouchableOpacity>
        ))}
      </View>

      {filtered.length===0? <View style={styles.empty}><Ionicons name="document-outline" size={40} color={theme.colors.textSecondary}/><Text style={styles.emptyText}>No reports in this filter</Text></View> : null}

      {demo && (
        <View style={styles.card}>
          <View style={styles.summary}>
            <View style={styles.thumb}><Ionicons name="image-outline" size={24} color={theme.colors.textSecondary}/></View>
            <View style={{flex:1}}>
              <Text style={styles.cardTitle}>{demo.title}</Text>
              <View style={{flexDirection:'row', gap:6, alignItems:'center', marginTop:2}}><Ionicons name="location-outline" size={14} color={theme.colors.textSecondary}/><Text style={styles.loc}>{demo.location}</Text></View>
            </View>
          </View>

          <View style={styles.timeline}>
            <View style={styles.line} />
            <View style={styles.nodeRow}>
              <View style={[styles.dot, {backgroundColor: theme.colors.success}]}><Ionicons name="checkmark" size={12} color="#fff"/></View>
              <View><Text style={[styles.nodeTitle,{color: theme.colors.success}]}>Submitted</Text><Text style={styles.nodeSub}>Oct 24, 09:00 AM</Text></View>
            </View>
            <View style={styles.nodeRow}>
              <View style={[styles.dot, {backgroundColor: theme.colors.review}]}><Ionicons name="eye-outline" size={12} color="#fff"/></View>
              <View><Text style={[styles.nodeTitle,{color: theme.colors.review}]}>Under Review</Text><Text style={styles.nodeSub}>Oct 24, 10:15 AM</Text></View>
            </View>
            <View style={styles.nodeRow}>
              <View style={[styles.dot, {backgroundColor: theme.colors.warning, borderWidth:2, borderColor:'#fff', shadowColor: theme.colors.warning}]}><Ionicons name="construct-outline" size={12} color="#fff"/></View>
              <View><Text style={[styles.nodeTitle,{color: theme.colors.warning}]}>Technician Assigned</Text><Text style={styles.nodeSub}>Oct 25, 08:30 AM</Text></View>
            </View>
            <View style={[styles.nodeRow, {opacity:0.5}]}>
              <View style={[styles.dot, {backgroundColor:'#d6e5e9'}]} />
              <View><Text style={[styles.nodeTitle,{color: theme.colors.textSecondary}]}>Resolved</Text><Text style={styles.nodeSub}>Pending</Text></View>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.9} style={{marginTop:16}} onPress={()=>router.push(`/report/${demo.id}` as any)}>
            <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.chatBtn}>
              <Ionicons name="chatbubble-outline" size={18} color="#fff"/><Text style={styles.chatText}>Open Chat with Admin/Tech</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {filtered.map(r=> (
        <TouchableOpacity key={r.id} onPress={()=>router.push(`/report/${r.id}` as any)} style={styles.listItem}>
          <Text style={styles.listTitle}>{r.title}</Text><Text style={styles.listSub}>{r.location} • {r.status}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const styles=StyleSheet.create({
  container:{ flex:1, backgroundColor: theme.colors.background },
  title:{ fontSize:20, fontWeight:'700', color: theme.colors.primary },
  filters:{ flexDirection:'row', gap:8, marginTop:12 },
  fBtn:{ paddingHorizontal:14, paddingVertical:6, borderRadius:20, backgroundColor:'#fff', borderWidth:1, borderColor:'#dcebef' },
  fActive:{ backgroundColor:'#6ee4fd', borderColor:'#6ee4fd' },
  fText:{ fontSize:12, fontWeight:'600', color: theme.colors.textSecondary }, fTextActive:{ color:'#004e5a' },
  empty:{ alignItems:'center', padding:24 }, emptyText:{ color: theme.colors.textSecondary, marginTop:8 },
  card:{ backgroundColor:'#fff', borderRadius:16, padding:16, marginTop:16, borderWidth:1, borderColor:'#dcebef', shadowColor:'#0A3C58', shadowOpacity:0.08, shadowRadius:12, elevation:4 },
  summary:{ flexDirection:'row', gap:12, alignItems:'center', borderBottomWidth:1, borderBottomColor:'#dcebef', paddingBottom:12 },
  thumb:{ width:56, height:56, borderRadius:12, backgroundColor:'#e7f6fa', alignItems:'center', justifyContent:'center' },
  cardTitle:{ fontWeight:'600', color: theme.colors.primary, fontSize:14 }, loc:{ fontSize:12, color: theme.colors.textSecondary },
  timeline:{ marginTop:12, paddingLeft:16, gap:16, position:'relative' },
  line:{ position:'absolute', left:7, top:8, bottom:8, width:2, backgroundColor:'#d6e5e9' },
  nodeRow:{ flexDirection:'row', gap:12, alignItems:'center' },
  dot:{ width:22, height:22, borderRadius:11, alignItems:'center', justifyContent:'center', marginLeft:-16, borderWidth:2, borderColor:'#fff' },
  nodeTitle:{ fontWeight:'600', fontSize:13 }, nodeSub:{ fontSize:11, color: theme.colors.textSecondary },
  chatBtn:{ height:48, borderRadius:24, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  chatText:{ color:'#fff', fontWeight:'600' },
  listItem:{ backgroundColor:'#fff', borderRadius:12, padding:12, marginTop:10, borderWidth:1, borderColor:'#dcebef' },
  listTitle:{ fontWeight:'600', color: theme.colors.text }, listSub:{ fontSize:12, color: theme.colors.textSecondary, marginTop:2 },
});
