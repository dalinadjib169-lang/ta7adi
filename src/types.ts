export type Rank = 'worm' | 'eagle' | 'tiger' | 'lion' | 'dragon';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  points: number;
  level: number;
  unlockedLevels: number[];
  levelScores: Record<number, number>;
  rank: Rank;
  role: 'student' | 'teacher';
  bonusPoints: number;
  lastBonusDate?: string;
  lastActive: number;
  isOnline: boolean;
}

export interface Challenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerRank?: Rank;
  challengedId: string;
  challengedName: string;
  challengedRank?: Rank;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled' | 'playing';
  challengerScore?: number;
  challengerTime?: number;
  challengerLevel?: number;
  challengerAnswers?: string[];
  challengedScore?: number;
  challengedTime?: number;
  challengedLevel?: number;
  challengedAnswers?: string[];
  winnerId?: string;
  pointsTransferred?: boolean;
  timestamp: number;
  questions?: Question[];
}

export interface Question {
  id: string;
  type: 'text' | 'image';
  answerType: 'choice' | 'input';
  content: string;
  subContent?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  imageUrl?: string;
  timer: number;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
