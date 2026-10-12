import { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CAMPUS_MAP_SOURCE, IMAGE_ASPECT, MAP_ASPECT, MAP_CROP } from '@/lib/campusMap';
import { theme } from '@/constants/theme';

export function PinnedMap({ x, y }: { x: number; y: number }) {
  const [width, setWidth] = useState(0);
  const height = width / MAP_ASPECT;

  return (
    <View style={styles.frame} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <View style={{ width, height, overflow: 'hidden' }}>
          <Image
            source={CAMPUS_MAP_SOURCE}
            style={{ width, height: width / IMAGE_ASPECT }}
            resizeMode="stretch"
          />
          <View style={{ position: 'absolute', left: x * width - 16, top: (y / MAP_CROP) * height - 32 }}>
            <Ionicons name="location" size={32} color={theme.colors.danger} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#eef6f8',
  },
});