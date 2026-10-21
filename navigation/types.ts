export type OnboardingStackParamList = {
  CreateDog: undefined;
  MeetHouse: undefined;
  WelcomeGift: undefined;
  SignUp: undefined;
  MotionPermission: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  DogProfile: undefined;
  Inventory: undefined;
  Shop: undefined;
};

export type PlayStackParamList = {
  PlayMain: undefined;
  ComingSoon: { gameName: string; emoji: string };
};

export type ChallengesStackParamList = {
  ChallengesMain: undefined;
  Leaderboards: undefined;
};

export type SocialStackParamList = {
  SocialMain: undefined;
  FriendHouse: { friendId: string };
  AddFriends: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Play: undefined;
  Walk: undefined;
  Challenges: undefined;
  Social: undefined;
};

export type WalkStackParamList = {
  WalkStart: undefined;
  WalkActive: undefined;
  WalkRecap: undefined;
  DropReveal: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  WalkFlow: undefined;
};
