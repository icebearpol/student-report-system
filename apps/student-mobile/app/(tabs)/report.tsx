import { useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { View, Text } from 'react-native';

export default function ReportTabShim(){
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      router.push('/new-report' as any);
    }, [])
  );

  return <View style={{flex:1, alignItems:'center', justifyContent:'center'}}><Text>Opening report…</Text></View>;
}