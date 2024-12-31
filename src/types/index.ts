export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: string;
  totalVotes: number;
  authorId: string;
  authorName: string;
  comments?: Comment[];
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

export interface Message {
  id: string;
  text: string;
  createdAt: Date;
  uid: string;
  displayName: string;
  photoURL?: string;
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  pollId: string;
}
/** Represents a poll option with its votes and voters */
export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

/** Represents a complete poll with all its data */
export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: string;
  totalVotes: number;
  authorId: string;
  authorName: string;
  comments?: Comment[];
}

/** Represents a chat message in the system */
export interface Message {
  id: string;
  text: string;
  createdAt: Date;
  uid: string;
  displayName: string;
  photoURL?: string;
}

/** Represents a comment on a poll */
export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  pollId: string;
}

/** Represents the current user state */
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string;
}

/** Represents a vote on a poll */
export interface Vote {
  pollId: string;
  optionId: string;
  userId: string;
  createdAt: Date;
}

/** Represents the poll creation form data */
export interface CreatePollFormData {
  question: string;
  options: { text: string }[];
}

export interface ChatMessage {
  id: string;
  text: string;
  createdAt: any; // Firestore Timestamp
  uid: string;
  displayName: string;
  photoURL?: string;
}

