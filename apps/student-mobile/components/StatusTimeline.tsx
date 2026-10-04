import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@campus/ui-components';
import { STATUS_STEPS } from '@campus/shared-types';
import type { TicketStatus } from '@campus/shared-types';

interface Props {
  currentStatus: TicketStatus;
}

export function StatusTimeline({ currentStatus }: Props) {
  const currentIdx = STATUS_STEPS.indexOf(
    currentStatus === 'Awaiting Input' ? 'In Progress' : (currentStatus as typeof STATUS_STEPS[number])
  );

  return (
    <View style={styles.container}>
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <View key={step} style={styles.step}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: done ? colors.success : colors.border,
                  borderColor: active ? colors.primary : 'transparent',
                  borderWidth: active ? 2 : 0,
                },
              ]}
            />
            <Text
              style={[
                styles.label,
                { color: done ? colors.text : colors.textMuted, fontWeight: active ? '700' : '400' },
              ]}
            >
              {step}
            </Text>
            {idx < STATUS_STEPS.length - 1 && (
              <View
                style={[
                  styles.line,
                  { backgroundColor: idx < currentIdx ? colors.success : colors.border },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  label: { fontSize: 13 },
  line: {
    position: 'absolute',
    left: 6,
    top: 16,
    width: 2,
    height: 16,
  },
});
