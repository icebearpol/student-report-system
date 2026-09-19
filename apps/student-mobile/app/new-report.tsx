import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReportCategory, ReportPriority } from '@campus/shared-types';
import {
  REPORT_CATEGORY_LABELS,
  REPORT_PRIORITY_LABELS,
} from '@campus/shared-types';
import { theme } from '@/constants/theme';
import { mockReports } from '@campus/mock-data';
import { checkDuplicateMock } from '@campus/ui-components';
import { upvoteReport } from '@/lib/auth';

const categories = Object.keys(REPORT_CATEGORY_LABELS) as ReportCategory[];
const priorities = Object.keys(REPORT_PRIORITY_LABELS) as ReportPriority[];

export default function NewReportScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1|2|3>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<ReportCategory>('maintenance');
  const [priority, setPriority] = useState<ReportPriority>('medium');
  const [anonymous, setAnonymous] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [dupReport, setDupReport] = useState<any>(null);
  const [dist, setDist] = useState(15);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !location.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields including building name.');
      return;
    }
    // deterministic mock AI duplicate check
    const dup = checkDuplicateMock({ category, location, title }, mockReports.map(r=>({id:r.id, category:r.category, location:r.location, title:r.title})));
    if (dup && !showAI) {
      const r = mockReports.find(x=>x.id===dup.reportId);
      setDupReport(r); setDist(dup.distanceM); setShowAI(true); return;
    }
    setShowAI(false);
    Alert.alert(
      'Report Submitted',
      anonymous ? 'Your anonymous report has been submitted.' : 'Your report has been submitted successfully.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header spacer for modal */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBg} />
        <View style={[styles.progressFill, { width: step===1? '33%': step===2? '66%':'100%' }]} />
        <View style={styles.steps}>
          <View style={styles.stepCol}><View style={[styles.stepDot, step>=1 && styles.stepActive]}><Text style={[styles.stepNum, step>=1 && styles.stepNumActive]}>1</Text></View><Text style={[styles.stepLabel, step===1 && styles.stepLabelActive]}>Media</Text></View>
          <View style={styles.stepCol}><View style={[styles.stepDot, step>=2 && styles.stepActive]}><Text style={[styles.stepNum, step>=2 && styles.stepNumActive]}>2</Text></View><Text style={styles.stepLabel}>Details</Text></View>
          <View style={styles.stepCol}><View style={[styles.stepDot, step>=3 && styles.stepActive]}><Text style={[styles.stepNum, step>=3 && styles.stepNumActive]}>3</Text></View><Text style={styles.stepLabel}>Review</Text></View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step===1 && (
          <View style={styles.card}>
            <Text style={styles.label}>Photo Evidence *</Text>
            <TouchableOpacity style={styles.dashed} activeOpacity={0.8}>
              <View style={{flexDirection:'row', gap:16}}><Ionicons name="camera-outline" size={36} color={theme.colors.primaryCyan}/><Ionicons name="image-outline" size={36} color={theme.colors.primaryCyan}/></View>
              <Text style={styles.dashedText}>Tap to take photo{'\n'}or upload from gallery</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Building Name / Location *</Text>
            <View style={styles.glassInput}><Ionicons name="business-outline" size={18} color={theme.colors.primaryCyan}/><TextInput value={location} onChangeText={setLocation} placeholder="e.g. Science Center" placeholderTextColor={theme.colors.textSecondary} style={styles.glassText} /></View>
            <Text style={styles.label}>Issue Category</Text>
            <View style={styles.glassInput}><Ionicons name="apps-outline" size={18} color={theme.colors.primaryCyan}/><Text style={styles.glassText}>{REPORT_CATEGORY_LABELS[category]}</Text><Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} /></View>
            <View style={styles.switchCard}>
              <View><Text style={styles.switchTitle}>Submit Anonymously</Text><Text style={styles.switchSub}>Hide my identity from public view</Text></View>
              <Switch value={anonymous} onValueChange={setAnonymous} trackColor={{false:'#c2c7ce', true: theme.colors.primaryCyan}} thumbColor="#fff" />
            </View>
          </View>
        )}
        {step===2 && (
          <View style={styles.card}>
            <Text style={styles.label}>Title *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Brief summary of the issue" placeholderTextColor={theme.colors.textSecondary} />
            <Text style={styles.label}>Description *</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Describe the issue in detail" placeholderTextColor={theme.colors.textSecondary} multiline numberOfLines={4} textAlignVertical="top" />
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {categories.map((cat) => (
                <TouchableOpacity key={cat} style={[styles.chip, category === cat && styles.chipActive]} onPress={() => setCategory(cat)}>
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{REPORT_CATEGORY_LABELS[cat]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.chipRow}>
              {priorities.map((pri) => (
                <TouchableOpacity key={pri} style={[styles.chip, priority === pri && styles.chipActive]} onPress={() => setPriority(pri)}>
                  <Text style={[styles.chipText, priority === pri && styles.chipTextActive]}>{REPORT_PRIORITY_LABELS[pri]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {step===3 && (
          <View style={styles.card}>
            <Text style={styles.label}>Review</Text>
            <Text style={styles.reviewText}>Title: {title || '(empty)'}</Text>
            <Text style={styles.reviewText}>Location: {location || '(empty)'}</Text>
            <Text style={styles.reviewText}>Category: {REPORT_CATEGORY_LABELS[category]} • {REPORT_PRIORITY_LABELS[priority]}</Text>
            <Text style={styles.reviewText}>Anonymous: {anonymous ? 'Yes' : 'No'}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        {step>1 && <TouchableOpacity style={styles.backBtn} onPress={()=>setStep((s)=> (s-1) as any)}><Text style={styles.backText}>Back</Text></TouchableOpacity>}
        <TouchableOpacity style={{flex:1}} onPress={()=> step<3 ? setStep((s)=> (s+1) as any) : handleSubmit()} activeOpacity={0.9}>
          <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.continueBtn}>
            <Text style={styles.submitText}>{step<3? 'Continue':'Submit Report'}</Text><Ionicons name="arrow-forward" size={18} color="#fff"/>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal visible={showAI} transparent animationType="fade">
        <View style={styles.aiOverlay}>
          <View style={styles.aiCard}>
            <View style={styles.aiAccent}/>
            <TouchableOpacity style={styles.aiClose} onPress={()=>setShowAI(false)}><Ionicons name="close" size={20} color={theme.colors.textSecondary}/></TouchableOpacity>
            <View style={{flexDirection:'row', gap:12, alignItems:'flex-start'}}>
              <View style={[styles.aiIcon, {backgroundColor:'rgba(245,158,11,0.12)'}]}><Ionicons name="hardware-chip-outline" size={26} color={theme.colors.warning}/></View>
              <View style={{flex:1}}>
                <Text style={styles.aiTitle}>Similar Issue Already Reported Near You!</Text>
                <Text style={styles.aiSub}>Our AI detected a highly similar report nearby. Upvoting helps prioritize fixes faster.</Text>
              </View>
            </View>
            <View style={{flexDirection:'row', gap:12, marginTop:16}}>
              <View style={{flex:1, alignItems:'center', gap:6}}><Text style={styles.aiLabel}>Your Photo</Text><View style={styles.aiPhoto}><Ionicons name="image-outline" size={28} color={theme.colors.textSecondary}/></View></View>
              <View style={{justifyContent:'center'}}><Ionicons name="swap-horizontal-outline" size={18} color={theme.colors.textSecondary}/></View>
              <View style={{flex:1, alignItems:'center', gap:6}}><Text style={styles.aiLabel}>Existing</Text><View style={styles.aiPhoto}><Ionicons name="image" size={28} color={theme.colors.textSecondary}/><View style={styles.distBadge}><Ionicons name="location" size={10} color={theme.colors.text}/><Text style={styles.distText}>{dist}m</Text></View></View></View>
            </View>
            {dupReport && <Text style={styles.dupTitle}>{dupReport.title} • {dupReport.location}</Text>}
            <TouchableOpacity onPress={async()=>{ if(dupReport) await upvoteReport(dupReport.id); setShowAI(false); Alert.alert('Upvoted','Thanks for upvoting the existing report.'); router.back(); }} style={{marginTop:16}}>
              <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} style={styles.aiPrimary}><Ionicons name="thumbs-up" size={16} color="#fff"/><Text style={styles.aiPrimaryText}>Upvote Existing Report (+1)</Text></LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{ setShowAI(false); handleSubmit(); }} style={styles.aiSecondary}><Text style={styles.aiSecondaryText}>Proceed with New Report Anyway</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  progressWrap:{ paddingHorizontal:24, paddingTop:16, paddingBottom:8, position:'relative' },
  progressBg:{ position:'absolute', top:32, left:24, right:24, height:2, backgroundColor:'#d6e5e9' },
  progressFill:{ position:'absolute', top:32, left:24, height:2, backgroundColor: theme.colors.primaryCyan },
  steps:{ flexDirection:'row', justifyContent:'space-between', paddingHorizontal:8 },
  stepCol:{ alignItems:'center', gap:6 }, stepDot:{ width:28, height:28, borderRadius:14, backgroundColor:'#d6e5e9', alignItems:'center', justifyContent:'center' }, stepActive:{ backgroundColor: theme.colors.primary },
  stepNum:{ fontSize:12, fontWeight:'700', color: theme.colors.textSecondary }, stepNumActive:{ color:'#fff' },
  stepLabel:{ fontSize:11, color: theme.colors.textSecondary, fontWeight:'500' }, stepLabelActive:{ color: theme.colors.primary, fontWeight:'700' },
  content: { padding: 16, paddingBottom: 100 },
  card:{ backgroundColor:'#fff', borderRadius:16, padding:16, borderWidth:1, borderColor:'#dcebef', gap:12 },
  label: { fontSize: 13, fontWeight: '600', color: theme.colors.primary, marginTop: 8 },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 12, fontSize: 14, color: theme.colors.text },
  glassInput:{ flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'rgba(232,247,251,0.5)', borderWidth:1, borderColor:'rgba(10,60,88,0.2)', borderRadius:24, paddingHorizontal:14, height:52, marginTop:4 },
  glassText:{ flex:1, color: theme.colors.text, fontSize:14 },
  dashed:{ height:130, borderRadius:24, borderWidth:2, borderStyle:'dashed', borderColor:'rgba(70,195,219,0.4)', backgroundColor:'#e7f6fa', alignItems:'center', justifyContent:'center', gap:8 },
  dashedText:{ color: theme.colors.textSecondary, fontSize:12, textAlign:'center' },
  switchCard:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:'#e7f6fa', borderRadius:20, padding:14, marginTop:8 },
  switchTitle:{ fontWeight:'600', color: theme.colors.primary, fontSize:13 }, switchSub:{ fontSize:11, color: theme.colors.textSecondary },
  textArea: { minHeight: 100 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop:4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 13, color: theme.colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  reviewText:{ fontSize:13, color: theme.colors.text, marginTop:4 },
  bottomBar:{ position:'absolute', bottom:0, left:0, right:0, flexDirection:'row', gap:12, padding:16, backgroundColor:'rgba(255,255,255,0.9)', borderTopWidth:1, borderTopColor:'#dcebef', alignItems:'center' },
  backBtn:{ paddingHorizontal:16, paddingVertical:12, borderRadius:20, backgroundColor:'#fff', borderWidth:1, borderColor:'#c2c7ce' }, backText:{ fontWeight:'600', color: theme.colors.text },
  continueBtn:{ height:52, borderRadius:26, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  aiOverlay:{ flex:1, backgroundColor:'rgba(16,30,33,0.4)', alignItems:'center', justifyContent:'center', padding:16 },
  aiCard:{ width:'100%', maxWidth:380, backgroundColor:'#fff', borderRadius:16, padding:16, overflow:'hidden' },
  aiAccent:{ position:'absolute', top:0, left:0, right:0, height:4, backgroundColor: theme.colors.warning },
  aiClose:{ position:'absolute', top:12, right:12, padding:4 },
  aiIcon:{ width:44, height:44, borderRadius:22, alignItems:'center', justifyContent:'center' },
  aiTitle:{ fontWeight:'600', color: theme.colors.text, fontSize:16 }, aiSub:{ color: theme.colors.textSecondary, fontSize:12, marginTop:4 },
  aiLabel:{ fontSize:10, fontWeight:'600', letterSpacing:0.5, color: theme.colors.textSecondary }, aiPhoto:{ width:'100%', aspectRatio:1, borderRadius:12, borderWidth:1, borderColor:'#c2c7ce', alignItems:'center', justifyContent:'center', overflow:'hidden' },
  distBadge:{ position:'absolute', bottom:6, right:6, backgroundColor:'rgba(255,255,255,0.9)', paddingHorizontal:6, paddingVertical:2, borderRadius:6, flexDirection:'row', gap:4, alignItems:'center' }, distText:{ fontSize:10, fontWeight:'700' },
  dupTitle:{ fontSize:12, color: theme.colors.textSecondary, marginTop:8, textAlign:'center' },
  aiPrimary:{ height:48, borderRadius:24, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 }, aiPrimaryText:{ color:'#fff', fontWeight:'600' },
  aiSecondary:{ height:44, borderRadius:22, borderWidth:2, borderColor:'#a5eeff', alignItems:'center', justifyContent:'center', marginTop:10 }, aiSecondaryText:{ color: theme.colors.primary, fontWeight:'600' },
});
