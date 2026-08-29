import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
export default function ReportTabShim(){
  const router=useRouter();
  useEffect(()=>{ const t=setTimeout(()=>router.replace('/new-report' as any), 100); return ()=>clearTimeout(t); },[]);
  return <View style={{flex:1, alignItems:'center', justifyContent:'center'}}><Text>Opening report…</Text></View>;
}
