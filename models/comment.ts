export type Comment = {
  id: string;
  username: string;
  body: string;
  createdAt: string;
  isMine: boolean;
};

export const MAX_COMMENT_LENGTH = 500;