import { useCallback, useRef, useState } from 'react';
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
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { ReportCategory, ReportPriority } from '@campus/shared-types';
import { REPORT_CATEGORY_LABELS, REPORT_PRIORITY_LABELS } from '@campus/shared-types';
import { theme } from '@/constants/theme';
import { upvoteReport, getCurrentUser, refreshMe } from '@/lib/auth';
import { createReport, getAllReports, rememberAnonymousReport, uploadPhotoBase64, checkDuplicates, Report, DuplicateMatch } from '@/lib/reports';
import { consumePendingPin } from '@/lib/mapPickerStore';

const categories = Object.keys(REPORT_CATEGORY_LABELS) as ReportCategory[];
const priorities = Object.keys(REPORT_PRIORITY_LABELS) as ReportPriority[];
const MAX_PHOTO_WIDTH = 1280;

type Overlay = null | 'photo' | 'upload' | 'check' | 'similar';

const OVERLAY_TEXT: Record<Exclude<Overlay, null>, { title: string; sub: string }> = {
  photo: { title: 'Preparing your photo...', sub: 'Making it smaller so it uploads quickly.' },
  upload: { title: 'Uploading your photo...', sub: 'Sending it to the server.' },
  similar: {
    title: 'Looking for similar reports...',
    sub: 'Our AI is checking whether someone already reported this problem.',
  },
  check: {
    title: 'Checking your report...',
    sub: 'Our AI is making sure this is a genuine campus issue. This can take a few seconds.',
  },
};

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findLikelyDuplicate(
  current: { title: string; location: string; category: string },
  existing: Report[]
): { report: Report; reason: string } | null {
  const loc = normalize(current.location);
  const cat = normalize(current.category);
  const titleWords = normalize(current.title).split(' ').filter((w) => w.length > 2);

  for (const r of existing) {
    const rLoc = normalize(r.location || '');
    const rCat = normalize(r.category || '');
    if (rLoc !== loc || rLoc === '') continue;
    if (rCat !== cat) continue;

    const rTitleWords = normalize(r.title).split(' ').filter((w) => w.length > 2);
    const sharedWords = titleWords.filter((w) => rTitleWords.includes(w));
    if (sharedWords.length > 0) {
      return {
        report: r,
        reason: `Same location ("${r.location}") and category, with matching keyword${sharedWords.length > 1 ? 's' : ''}: "${sharedWords.join('", "')}"`,
      };
    }
  }
  return null;
}

export default function NewReportScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<ReportCategory>('maintenance');
  const [priority, setPriority] = useState<ReportPriority>('medium');
  const [anonymous, setAnonymous] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [verified, setVerified] = useState(false);
  const [urgentBlocked, setUrgentBlocked] = useState(false);
  const [mapX, setMapX] = useState<number | null>(null);
  const [mapY, setMapY] = useState<number | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<{ base64: string; mime: string } | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [dupReport, setDupReport] = useState<DuplicateMatch | null>(null);
  const [dupBadge, setDupBadge] = useState('');
  const [dupReason, setDupReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const uploaded = useRef<{ uri: string | null; url: string } | null>(null);

  const canUrgent = signedIn && verified && !urgentBlocked;

  useFocusEffect(
    useCallback(() => {
      const pending = consumePendingPin();
      if (pending) {
        setMapX(pending.x);
        setMapY(pending.y);
        if (pending.building) {
          setLocation((current) => (current.trim() ? current : (pending.building as string)));
        }
      }

      getCurrentUser().then((u) => {
        setSignedIn(!!u);
        setVerified(!!u?.emailVerified);
        setUrgentBlocked(!!u?.urgentBlocked);
        if (!u) setAnonymous(true);
      });
      refreshMe().then((u) => {
        if (u) {
          setSignedIn(true);
          setVerified(!!u.emailVerified);
          setUrgentBlocked(!!u.urgentBlocked);
        }
      });
    }, [])
  );

  const goHome = () => {
    router.replace('/(tabs)');
  };

  const finish = (message: string) => {
    if (Platform.OS === 'web') {
      setSuccessMessage(message);
      setTimeout(goHome, 1500);
    } else {
      Alert.alert('Report Submitted', message, [{ text: 'OK', onPress: goHome }]);
    }
  };

  const choosePriority = (value: ReportPriority) => {
    if (value === 'urgent' && !canUrgent) {
      if (!signedIn) {
        Alert.alert(
          'Account required',
          'Urgent reports need a signed-in school account so administrators can verify them. You can choose High priority instead.'
        );
      } else if (urgentBlocked) {
        Alert.alert(
          'Urgent is turned off',
          'Urgent reporting is turned off for your account because earlier urgent reports were not confirmed. Please use High priority.'
        );
      } else {
        Alert.alert('Verify your school email', 'Urgent reports are limited to accounts with a verified school email.', [
          { text: 'Not now', style: 'cancel' },
          { text: 'Verify', onPress: () => router.push('/verify-email' as any) },
        ]);
      }
      return;
    }
    setPriority(value);
  };

  const savePhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    setOverlay('photo');
    try {
      const context = ImageManipulator.manipulate(asset.uri);
      if (asset.width > MAX_PHOTO_WIDTH) {
        context.resize({ width: MAX_PHOTO_WIDTH });
      }
      const rendered = await context.renderAsync();
      const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.6, base64: true });
      if (!saved.base64) throw new Error('No image data');
      setPhotoUri(saved.uri);
      setPhotoData({ base64: saved.base64, mime: 'image/jpeg' });
    } catch (error) {
      console.log('Photo resize failed:', String(error));
      if (asset.base64) {
        setPhotoUri(asset.uri);
        setPhotoData({ base64: asset.base64, mime: asset.mimeType || 'image/jpeg' });
      } else {
        Alert.alert('Photo problem', 'We could not read that photo. Please try another one.');
      }
    } finally {
      setOverlay(null);
    }
  };

  const clearPhoto = () => {
    setPhotoUri(null);
    setPhotoData(null);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera access needed', 'Please allow camera access in Settings to photograph the issue.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
    if (!result.canceled) await savePhoto(result.assets[0]);
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5, base64: true });
    if (!result.canceled) await savePhoto(result.assets[0]);
  };

  const goNext = () => {
    if (step === 1 && !photoData) {
      Alert.alert('Photo required', 'Please take or choose a photo of the issue to continue.');
      return;
    }
    setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const actuallySubmit = async (confirmFlagged = false) => {
    setSubmitting(true);
    const needsUpload = !!photoData && !(uploaded.current && uploaded.current.uri === photoUri);
    setOverlay(needsUpload ? 'upload' : 'check');

    try {
      let imageUrl: string | undefined;
      if (photoData) {
        if (uploaded.current && uploaded.current.uri === photoUri) {
          imageUrl = uploaded.current.url;
        } else {
          imageUrl = await uploadPhotoBase64(photoData.base64, photoData.mime);
          uploaded.current = { uri: photoUri, url: imageUrl };
        }
      }

      setOverlay('check');
      const created = await createReport({
        title,
        description,
        location,
        category,
        priority,
        anonymous,
        imageUrl,
        confirmFlagged,
        ...(mapX !== null && mapY !== null ? { mapX, mapY } : {}),
      });

      setOverlay(null);
      setSubmitting(false);

      if (created.needsConfirmation) {
        Alert.alert(
          'This may not be a campus issue',
          `${created.reason}\n\nIf you submit anyway, an administrator will review it before it is shown to other students.`,
          [
            { text: 'Go back and edit', style: 'cancel' },
            { text: 'Submit anyway', onPress: () => actuallySubmit(true) },
          ]
        );
        return;
      }

      if (anonymous) {
        await rememberAnonymousReport(created.id);
      }
      const base = anonymous ? 'Your anonymous report has been submitted.' : 'Your report has been submitted successfully.';
      finish(created.notice ? `${base}\n\n${created.notice}` : base);
    } catch (error: any) {
      setOverlay(null);
      setSubmitting(false);
      if (error?.message?.includes('session has expired')) {
        Alert.alert('Session expired', 'Please log in again to continue.', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
      } else {
        Alert.alert('Submission failed', error?.message || 'Could not submit your report. Please try again.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !location.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields including building name.');
      return;
    }
    if (!photoData) {
      Alert.alert('Photo required', 'Please add a photo of the issue before submitting.');
      setStep(1);
      return;
    }

        const rulesCheck = async () => {
      const existingReports = await getAllReports();
      const match = findLikelyDuplicate({ title, location, category }, existingReports);
      if (!match) return false;
      setDupReport(match.report);
      setDupReason(match.reason);
      setDupBadge('Keyword match');
      return true;
    };

    setOverlay('similar');
    let found = false;
    try {
      const result = await checkDuplicates({
        title,
        description,
        location,
        category,
        ...(mapX !== null && mapY !== null ? { mapX, mapY } : {}),
      });
      if (result.available) {
        if (result.match) {
          setDupReport(result.match);
          setDupReason(result.reason || 'This looks like the same problem as an existing report.');
          setDupBadge(`AI match • ${Math.round((result.confidence || 0) * 100)}% sure`);
          found = true;
        }
      } else {
        found = await rulesCheck();
      }
    } catch {
      try {
        found = await rulesCheck();
      } catch {}
    }
    setOverlay(null);

    if (found) {
      setShowAI(true);
      return;
    }

    await actuallySubmit();

  const handleUpvoteExisting = async () => {
    if (!dupReport) return;
    try {
      await upvoteReport(dupReport.id);
    } catch {}
    setShowAI(false);
    if (Platform.OS === 'web') {
      setSuccessMessage('Thanks for upvoting the existing report.');
      setTimeout(goHome, 1500);
    } else {
      Alert.alert('Upvoted', 'Thanks for upvoting the existing report.', [{ text: 'OK', onPress: goHome }]);
    }
  };

  if (successMessage) {
    return (
      <View style={styles.successScreen}>
        <Ionicons name="checkmark-circle" size={56} color={theme.colors.success} />
        <Text style={styles.successText}>{successMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderTitle}>New Report</Text>
        <TouchableOpacity onPress={goHome} hitSlop={10}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressBg} />
        <View style={[styles.progressFill, { width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }]} />
        <View style={styles.steps}>
          <View style={styles.stepCol}>
            <View style={[styles.stepDot, step >= 1 && styles.stepActive]}>
              <Text style={[styles.stepNum, step >= 1 && styles.stepNumActive]}>1</Text>
            </View>
            <Text style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}>Media</Text>
          </View>
          <View style={styles.stepCol}>
            <View style={[styles.stepDot, step >= 2 && styles.stepActive]}>
              <Text style={[styles.stepNum, step >= 2 && styles.stepNumActive]}>2</Text>
            </View>
            <Text style={styles.stepLabel}>Details</Text>
          </View>
          <View style={styles.stepCol}>
            <View style={[styles.stepDot, step >= 3 && styles.stepActive]}>
              <Text style={[styles.stepNum, step >= 3 && styles.stepNumActive]}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Review</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.label}>Photo Evidence *</Text>
            {photoUri ? (
              <View>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <View style={styles.photoActions}>
                  <TouchableOpacity style={styles.photoActionBtn} onPress={takePhoto}>
                    <Ionicons name="camera-outline" size={16} color={theme.colors.primary} />
                    <Text style={styles.photoActionText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoActionBtn} onPress={clearPhoto}>
                    <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                    <Text style={[styles.photoActionText, { color: theme.colors.danger }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.photoPickRow}>
                <TouchableOpacity style={styles.photoPickBtn} onPress={takePhoto}>
                  <Ionicons name="camera-outline" size={30} color={theme.colors.primaryCyan} />
                  <Text style={styles.photoPickText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoPickBtn} onPress={pickPhoto}>
                  <Ionicons name="image-outline" size={30} color={theme.colors.primaryCyan} />
                  <Text style={styles.photoPickText}>From Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.helper}>Photos are automatically checked to make sure they show a real campus issue.</Text>

            <Text style={styles.label}>Building Name / Location *</Text>
            <View style={styles.glassInput}>
              <Ionicons name="business-outline" size={18} color={theme.colors.primaryCyan} />
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Science Center"
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.glassText}
              />
            </View>

            <TouchableOpacity
              style={styles.mapPinBtn}
              onPress={() =>
                router.push({
                  pathname: '/map-picker',
                  params: mapX !== null && mapY !== null ? { x: String(mapX), y: String(mapY) } : {},
                })
              }
            >
              <Ionicons
                name={mapX !== null ? 'checkmark-circle' : 'map-outline'}
                size={18}
                color={mapX !== null ? theme.colors.success : theme.colors.primaryCyan}
              />
              <Text style={styles.mapPinBtnText}>
                {mapX !== null ? 'Location pinned on map' : 'Pin location on map (optional)'}
              </Text>
            </TouchableOpacity>

            {!signedIn ? (
              <View style={styles.guestNotice}>
                <Ionicons name="eye-off-outline" size={18} color={theme.colors.primaryCyan} />
                <Text style={styles.guestNoticeText}>
                  You're browsing as a guest. This report has no account attached, and Urgent priority is unavailable.
                </Text>
              </View>
            ) : (
              <View style={styles.switchCard}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.switchTitle}>Submit Anonymously</Text>
                  <Text style={styles.switchSub}>
                    Hides your name from other students. Administrators can still see who sent it.
                  </Text>
                </View>
                <Switch
                  value={anonymous}
                  onValueChange={setAnonymous}
                  trackColor={{ false: '#c2c7ce', true: theme.colors.primaryCyan }}
                  thumbColor="#fff"
                />
              </View>
            )}
          </View>
        )}

        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Brief summary of the issue"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the issue in detail"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {REPORT_CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.chipRow}>
              {priorities.map((pri) => {
                const locked = pri === 'urgent' && !canUrgent;
                return (
                  <TouchableOpacity
                    key={pri}
                    style={[styles.chip, priority === pri && styles.chipActive, locked && styles.chipLocked]}
                    onPress={() => choosePriority(pri)}
                  >
                    {locked && <Ionicons name="lock-closed" size={12} color={theme.colors.textSecondary} />}
                    <Text style={[styles.chipText, priority === pri && styles.chipTextActive]}>
                      {REPORT_PRIORITY_LABELS[pri]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.helper}>
              Urgent is only for immediate danger and needs a verified school account. Administrators confirm every urgent report.
            </Text>
          </View>
        )}

        {step === 3 && (
          <View style={styles.card}>
            <Text style={styles.label}>Review</Text>
            <Text style={styles.reviewText}>Title: {title || '(empty)'}</Text>
            <Text style={styles.reviewText}>Location: {location || '(empty)'}</Text>
            <Text style={styles.reviewText}>
              Category: {REPORT_CATEGORY_LABELS[category]} • {REPORT_PRIORITY_LABELS[priority]}
            </Text>
            <Text style={styles.reviewText}>Photo: {photoData ? 'Attached' : 'None'}</Text>
            <Text style={styles.reviewText}>Map pin: {mapX !== null ? 'Set' : 'Not set'}</Text>
            <Text style={styles.reviewText}>Hidden from other students: {anonymous ? 'Yes' : 'No'}</Text>
            {signedIn && (
              <Text style={styles.helper}>
                Administrators can see which account sent a report, even when it is anonymous to other students.
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep((s) => (s - 1) as 1 | 2 | 3)}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => (step < 3 ? goNext() : handleSubmit())}
          activeOpacity={0.9}
          disabled={submitting}
        >
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueBtn}
          >
            <Text style={styles.submitText}>
              {step < 3 ? 'Continue' : submitting ? 'Please wait...' : 'Submit Report'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal visible={showAI} transparent animationType="fade" onRequestClose={() => setShowAI(false)}>
        <View style={styles.aiOverlay}>
          <View style={styles.aiCard}>
            <View style={styles.aiAccent} />
            <TouchableOpacity style={styles.aiClose} onPress={() => setShowAI(false)} hitSlop={12}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <View style={[styles.aiIcon, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                <Ionicons name="alert-circle-outline" size={26} color={theme.colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiTitle}>This might already be reported</Text>
                                <Text style={styles.aiSub}>{dupReason}</Text>
                {!!dupBadge && <Text style={styles.aiBadge}>{dupBadge}</Text>}
              </View>
            </View>

            {dupReport && (
              <View style={styles.dupCard}>
                <Text style={styles.dupCardTitle}>{dupReport.title}</Text>
                <Text style={styles.dupCardDesc} numberOfLines={3}>{dupReport.description}</Text>
                <Text style={styles.dupCardMeta}>
                  {dupReport.location} • {dupReport.upvotes || 0} upvote{(dupReport.upvotes || 0) === 1 ? '' : 's'}
                </Text>
              </View>
            )}

            <TouchableOpacity onPress={handleUpvoteExisting} style={{ marginTop: 16 }}>
              <LinearGradient colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} style={styles.aiPrimary}>
                <Ionicons name="thumbs-up" size={16} color="#fff" />
                <Text style={styles.aiPrimaryText}>Upvote Existing Report (+1)</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowAI(false);
                actuallySubmit();
              }}
              style={styles.aiSecondary}
            >
              <Text style={styles.aiSecondaryText}>This is a different issue — submit anyway</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {overlay && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingTitle}>{OVERLAY_TEXT[overlay].title}</Text>
            <Text style={styles.loadingSub}>{OVERLAY_TEXT[overlay].sub}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: theme.colors.background, padding: 24 },
  successText: { fontSize: 16, fontWeight: '600', color: theme.colors.text, textAlign: 'center' },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  topHeaderTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  cancelText: { fontSize: 14, fontWeight: '600', color: theme.colors.primaryCyan },
  progressWrap: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, position: 'relative' },
  progressBg: { position: 'absolute', top: 32, left: 24, right: 24, height: 2, backgroundColor: '#d6e5e9' },
  progressFill: { position: 'absolute', top: 32, left: 24, height: 2, backgroundColor: theme.colors.primaryCyan },
  steps: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  stepCol: { alignItems: 'center', gap: 6 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#d6e5e9', alignItems: 'center', justifyContent: 'center' },
  stepActive: { backgroundColor: theme.colors.primary },
  stepNum: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '500' },
  stepLabelActive: { color: theme.colors.primary, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 110 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#dcebef', gap: 12 },
  label: { fontSize: 13, fontWeight: '600', color: theme.colors.primary, marginTop: 8 },
  helper: { fontSize: 11.5, color: theme.colors.textSecondary, lineHeight: 16 },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 12, fontSize: 14, color: theme.colors.text },
  glassInput: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(232,247,251,0.5)', borderWidth: 1, borderColor: 'rgba(10,60,88,0.2)', borderRadius: 24, paddingHorizontal: 14, height: 52, marginTop: 4 },
  glassText: { flex: 1, color: theme.colors.text, fontSize: 14 },
  photoPreview: { width: '100%', height: 200, borderRadius: 16, backgroundColor: '#e7f6fa' },
  photoActions: { flexDirection: 'row', gap: 16, marginTop: 8 },
  photoActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  photoActionText: { fontSize: 13, fontWeight: '600', color: theme.colors.primary },
  photoPickRow: { flexDirection: 'row', gap: 12 },
  photoPickBtn: { flex: 1, height: 110, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(70,195,219,0.4)', backgroundColor: '#e7f6fa', alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoPickText: { fontSize: 12.5, fontWeight: '600', color: theme.colors.textSecondary },
  mapPinBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, padding: 12, marginTop: 4 },
  mapPinBtnText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  switchCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e7f6fa', borderRadius: 20, padding: 14, marginTop: 8 },
  switchTitle: { fontWeight: '600', color: theme.colors.primary, fontSize: 13 },
  switchSub: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2, lineHeight: 15 },
  guestNotice: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e7f6fa', borderRadius: 20, padding: 14, marginTop: 8 },
  guestNoticeText: { flex: 1, fontSize: 12, color: theme.colors.primary, fontWeight: '500' },
  textArea: { minHeight: 100 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipLocked: { opacity: 0.55 },
  chipText: { fontSize: 13, color: theme.colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  reviewText: { fontSize: 13, color: theme.colors.text, marginTop: 4 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, padding: 16, backgroundColor: 'rgba(255,255,255,0.92)', borderTopWidth: 1, borderTopColor: '#dcebef', alignItems: 'center' },
  backBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#c2c7ce' },
  backText: { fontWeight: '600', color: theme.colors.text },
  continueBtn: { height: 52, borderRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  aiOverlay: { flex: 1, backgroundColor: 'rgba(16,30,33,0.4)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  aiCard: { width: '100%', maxWidth: 380, backgroundColor: '#fff', borderRadius: 16, padding: 16, overflow: 'hidden' },
  aiAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: theme.colors.warning },
  aiClose: { position: 'absolute', top: 10, right: 10, padding: 6, zIndex: 10 },
  aiIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontWeight: '600', color: theme.colors.text, fontSize: 16 },
  aiSub: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 },
    aiBadge: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: '#e7f6fa', color: theme.colors.primary, fontSize: 11, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' },
  dupCard: { backgroundColor: theme.colors.surface, borderRadius: 12, padding: 12, marginTop: 14, borderWidth: 1, borderColor: theme.colors.border },
  dupCardTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  dupCardDesc: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  dupCardMeta: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 6 },
  aiPrimary: { height: 48, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  aiPrimaryText: { color: '#fff', fontWeight: '600' },
  aiSecondary: { height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#a5eeff', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  aiSecondaryText: { color: theme.colors.primary, fontWeight: '600' },
    loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16,30,33,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    zIndex: 50,
    elevation: 50,
  },
  loadingCard: { width: '100%', maxWidth: 320, backgroundColor: '#fff', borderRadius: 22, padding: 24, alignItems: 'center', gap: 10 },
  loadingTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.text, marginTop: 6, textAlign: 'center' },
  loadingSub: { fontSize: 12.5, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 18 },
})}