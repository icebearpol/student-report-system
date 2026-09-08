import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getReportsByStatus } from '@campus/mock-data';
import type { ReportStatus } from '@campus/shared-types';
import { ReportCard } from '@/components/ReportCard';
import { theme } from '@/constants/theme';

export default function IssuesScreen(){
  const router = useRouter();
  const [view,setView]=useState<'list'|'map'>('list');
  const [filter,setFilter]=useState<ReportStatus|'all'>('all');
  // BACKEND SEAM: list loads through getReportsByStatus() only
  // (GET /api/reports?status=) — never touch mock arrays directly.
  const data = getReportsByStatus(filter);
  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <View style={styles.toggle}>
          <TouchableOpacity onPress={()=>setView('list')} style={[styles.toggleBtn, view==='list'&&styles.toggleActive]}><Text style={[styles.toggleText, view==='list'&&styles.toggleTextActive]}>List View</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>router.push('/public-map' as any)} style={[styles.toggleBtn, view==='map'&&styles.toggleActive]}><Text style={[styles.toggleText, view==='map'&&styles.toggleTextActive]}>Map View</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.filterBtn}><Ionicons name="filter" size={18} color={theme.colors.primary}/></TouchableOpacity>
      </View>
      {view==='map'? (
        <View style={styles.mapPlaceholder}><Ionicons name="map-outline" size={48} color={theme.colors.textSecondary}/><Text style={styles.mapText}>Map View — Public issues plotted</Text></View>
      ):(
        <FlatList data={data} keyExtractor={i=>i.id} renderItem={({item})=> <ReportCard report={item}/>} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
      )}
    </View>
  );
}
const styles=StyleSheet.create({
  container:{ flex:1, backgroundColor: theme.colors.background },
  toggleRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:16 },
  toggle:{ flexDirection:'row', backgroundColor:'#dcebef', borderRadius:20, padding:4, gap:4 },
  toggleBtn:{ paddingHorizontal:14, paddingVertical:6, borderRadius:16 }, toggleActive:{ backgroundColor:'#fff', shadowColor:'#0A3C58', shadowOpacity:0.08, shadowRadius:6, elevation:2 },
  toggleText:{ fontSize:12, fontWeight:'600', color: theme.colors.textSecondary }, toggleTextActive:{ color: theme.colors.primary },
  filterBtn:{ width:36, height:36, borderRadius:18, backgroundColor:'#e7f6fa', alignItems:'center', justifyContent:'center' },
  list:{ padding:16, paddingTop:0 },
  mapPlaceholder:{ flex:1, alignItems:'center', justifyContent:'center', gap:12 }, mapText:{ color: theme.colors.textSecondary },
});
