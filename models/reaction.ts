export type ReactionValue = 1 | -1 | 0;

export type ReactionSummary = {
  likes: number;
  dislikes: number;
  userReaction: ReactionValue;
};

export const emptyReactionSummary: ReactionSummary = {
  likes: 0,
  dislikes: 0,
  userReaction: 0,
};