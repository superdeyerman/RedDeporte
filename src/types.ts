import { Timestamp } from 'firebase/firestore';

export type Rank = 'Recruit' | 'Soldier' | 'Warrior' | 'Elite' | 'Commander';
export type PhysicalLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type Goal = 'Mass' | 'Fat Loss' | 'Performance';
export type CompetitionType = 'Transformation' | 'Habits' | 'Performance';
export type CompetitionStatus = 'Upcoming' | 'Active' | 'Validating' | 'Finished';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'recruit' | 'admin';
  age?: number;
  weight?: number;
  height?: number;
  sex?: string;
  physicalLevel?: PhysicalLevel;
  goal?: Goal;
  measurements?: {
    chest: number;
    waist: number;
    legs: number;
    arms: number;
  };
  habits?: {
    nutrition: string;
    exercise: string;
    sleep: string;
  };
  rank: Rank;
  streak: number;
  lastMissionDate: string;
  totalPoints: number;
  isProfileComplete: boolean;
  createdAt: Timestamp;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  type: CompetitionType;
  startDate: Timestamp;
  endDate: Timestamp;
  status: CompetitionStatus;
  prizePool: number;
  participants: string[]; // UIDs
  rules: string[];
  winnerId?: string;
}

export interface Evidence {
  id: string;
  competitionId: string;
  userId: string;
  userName: string;
  type: 'photo' | 'video';
  url: string;
  timestamp: Timestamp;
  votes: string[]; // UIDs
  isValidated: boolean;
  metrics?: {
    value: number;
    unit: string;
  };
}

export interface Contribution {
  id: string;
  competitionId: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'User' | 'Sponsor' | 'Viewer';
  timestamp: Timestamp;
}

export interface Mission {
  date: string;
  breakfast: boolean;
  lunch: boolean;
  snack: boolean;
  dinner: boolean;
  workout: boolean;
  mental: boolean;
  isCompleted: boolean;
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  desc: string;
}

export interface Plan {
  date: string;
  nutrition: {
    breakfast: string;
    lunch: string;
    snack: string;
    dinner: string;
  };
  workout: {
    exercises: Exercise[];
  };
  mentalMission: string;
}

export interface Post {
  id: string;
  uid: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  imageUrl?: string;
  createdAt: Timestamp;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  attendees: string[];
}
