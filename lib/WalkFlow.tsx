import React, { useState } from 'react';

import type { Dog, WalkSummary as WalkSummaryData } from './api';
import HomeScreen from '../screens/HomeScreen';
import LiveWalkScreen from '../screens/LiveWalkScreen';
import WalkSummaryScreen from '../screens/WalkSummaryScreen';

type WalkFlowState =
  | { phase: 'idle' }
  | { phase: 'active'; walkId: string; startedAt: string }
  | { phase: 'summary'; summary: WalkSummaryData };

/**
 * Sub-navigator for the signed-in, has-a-dog state: home <-> live walk <->
 * post-walk summary. Same state-driven approach as RootNavigator — these
 * transitions are triggered by walk lifecycle events, not user routing.
 */
export default function WalkFlow({
  dog,
  ownerFirstName,
  onSignOut,
}: {
  dog: Dog;
  ownerFirstName: string;
  onSignOut: () => void;
}) {
  const [state, setState] = useState<WalkFlowState>({ phase: 'idle' });

  if (state.phase === 'active') {
    return (
      <LiveWalkScreen
        dog={dog}
        walkId={state.walkId}
        startedAt={state.startedAt}
        onEnded={(summary) => setState({ phase: 'summary', summary })}
      />
    );
  }

  if (state.phase === 'summary') {
    return (
      <WalkSummaryScreen
        dog={dog}
        summary={state.summary}
        onDone={() => setState({ phase: 'idle' })}
      />
    );
  }

  return (
    <HomeScreen
      dog={dog}
      ownerFirstName={ownerFirstName}
      onSignOut={onSignOut}
      onWalkStarted={(walkId, startedAt) => setState({ phase: 'active', walkId, startedAt })}
    />
  );
}
