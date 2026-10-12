import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback } from 'react';
import { theme } from '@/constants/theme';
import { setPendingPin } from '@/lib/mapPickerStore';
import { CAMPUS_MAP_SOURCE, IMAGE_ASPECT, MAP_ASPECT, MAP_CROP, nearestBuilding } from '@/lib/campusMap';
import { BuildingGuide } from '@/components/BuildingGuide';

const HEADER_H = 52;
const MAX_ZOOM = 4;

export default function MapPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ x?: string; y?: string }>();
  const { width: winW, height: winH } = useWindowDimensions();

  const [pin, setPin] = useState<{ x: number; y: number } | null>(
    params.x && params.y ? { x: parseFloat(params.x), y: parseFloat(params.y) } : null
  );
  const [zoom, setZoom] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);

  const drop = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      };
    }, [])
  );

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const availH = Math.max(winH - HEADER_H, 200);
  const baseW = Math.min(winW, availH * MAP_ASPECT);
  const contentW = baseW * zoom;
  const contentH = contentW / MAP_ASPECT;
  const imageH = contentW / IMAGE_ASPECT;

  const placePin = (x: number, yFull: number) => {
    setPin({ x, y: yFull });
    drop.setValue(0);
    Animated.spring(drop, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
  };

  const handleTap = (evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    const x = Math.min(1, Math.max(0, locationX / contentW));
    const yFull = Math.min(MAP_CROP, Math.max(0, (locationY / contentH) * MAP_CROP));
    placePin(x, yFull);
  };

  const handleConfirm = () => {
    if (!pin) return;
    const near = nearestBuilding(pin.x, pin.y);
    setPendingPin(pin.x, pin.y, near?.name);
    router.back();
  };

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.5).toFixed(1)));
  const zoomOut = () => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)));

  const near = pin ? nearestBuilding(pin.x, pin.y) : null;
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.4] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const dropY = drop.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingLeft: Math.max(insets.left, 14), paddingRight: Math.max(insets.right, 14) },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Pin the Location</Text>

        <View style={styles.rightGroup}>
          <View style={styles.zoomGroup}>
            <TouchableOpacity onPress={zoomOut} disabled={zoom <= 1} style={styles.zoomBtn} hitSlop={6}>
              <Ionicons name="remove" size={18} color={zoom <= 1 ? theme.colors.border : theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
            <TouchableOpacity onPress={zoomIn} disabled={zoom >= MAX_ZOOM} style={styles.zoomBtn} hitSlop={6}>
              <Ionicons
                name="add"
                size={18}
                color={zoom >= MAX_ZOOM ? theme.colors.border : theme.colors.text}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setGuideOpen(true)} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="list" size={18} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleConfirm} disabled={!pin} hitSlop={10}>
            <Text style={[styles.confirmText, !pin && styles.confirmTextDisabled]}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ width: winW, height: availH, backgroundColor: '#eaf4f7' }}>
        <ScrollView
          horizontal
          bounces={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ minWidth: winW, alignItems: 'center' }}
        >
          <ScrollView
            bounces={false}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={{ width: contentW, height: availH }}
            contentContainerStyle={{ minHeight: availH, justifyContent: 'center' }}
          >
            <Pressable onPress={handleTap} style={{ width: contentW, height: contentH, overflow: 'hidden' }}>
              <Image
                source={CAMPUS_MAP_SOURCE}
                style={{ width: contentW, height: imageH }}
                resizeMode="stretch"
              />

              {pin && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.pinWrap,
                    {
                      left: pin.x * contentW,
                      top: (pin.y / MAP_CROP) * contentH,
                      opacity: drop,
                      transform: [{ translateY: dropY }],
                    },
                  ]}
                >
                  <Animated.View
                    style={[styles.pulse, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]}
                  />
                  <Ionicons name="location" size={36} color={theme.colors.danger} />
                </Animated.View>
              )}
            </Pressable>
          </ScrollView>
        </ScrollView>

        <View style={styles.infoBar} pointerEvents="none">
          <Ionicons
            name={pin ? 'checkmark-circle' : 'hand-left-outline'}
            size={15}
            color={pin ? '#7CF0B0' : '#fff'}
          />
          <Text style={styles.infoText}>
            {pin
              ? near
                ? `Near ${near.n} · ${near.name} — tap again to move`
                : 'Open area — tap again to move'
              : 'Tap the map to drop a pin. Use + to zoom in for accuracy.'}
          </Text>
        </View>
      </View>

      <BuildingGuide visible={guideOpen} onClose={() => setGuideOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: { fontSize: 15, fontWeight: '800', color: theme.colors.text },
  cancelText: { fontSize: 13.5, color: theme.colors.textSecondary, fontWeight: '600' },
  confirmText: { fontSize: 13.5, color: theme.colors.primaryCyan, fontWeight: '800' },
  confirmTextDisabled: { color: theme.colors.border },
  rightGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#eef6f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eef6f8',
    borderRadius: 18,
    paddingHorizontal: 4,
  },
  zoomBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  zoomText: { fontSize: 11, fontWeight: '700', color: theme.colors.text, minWidth: 36, textAlign: 'center' },
  pinWrap: {
    position: 'absolute',
    width: 36,
    height: 36,
    marginLeft: -18,
    marginTop: -36,
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
    left: 6,
    bottom: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.danger,
  },
  infoBar: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16,30,33,0.78)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  infoText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});