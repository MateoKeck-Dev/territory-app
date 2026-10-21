import React, { useState } from 'react';
import { Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PeriodBadge } from '../../components/Badges';
import { ProgressBar } from '../../components/ProgressBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SegmentedControl } from '../../components/SegmentedControl';
import { useChallenges } from '../../hooks/useChallenges';
import type { Challenge, ChallengeCategory } from '../../mocks/challenges';
import { useTheme } from '../../lib/theme';
import type { ChallengesStackParamList } from '../../navigation/types';

const CATEGORIES: ChallengeCategory[] = ['Walking', 'Mini games', 'Pack'];

export function ChallengesScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<ChallengesStackParamList, 'ChallengesMain'>;
}) {
  const { colors, fontSizes, fontWeights } = useTheme();
  const { byCategory } = useChallenges();
  const [category, setCategory] = useState<ChallengeCategory>('Walking');

  return (
    <ScreenContainer>
      <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>
        Challenges
      </Text>
      <Button label="View leaderboards" variant="secondary" onPress={() => navigation.navigate('Leaderboards')} />

      <SegmentedControl options={CATEGORIES} value={category} onChange={setCategory} />

      {byCategory(category).map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </ScreenContainer>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const complete = challenge.progress >= 1;

  return (
    <Card style={{ gap: spacing.sm }}>
      <PeriodBadge period={challenge.period} />
      <Text style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold }}>
        {challenge.title}
      </Text>
      <ProgressBar progress={challenge.progress} color={complete ? colors.success : undefined} />
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
        {complete ? 'Complete — ' : 'Reward: '}
        {challenge.reward}
      </Text>
    </Card>
  );
}
