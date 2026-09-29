export type ChallengeFormGroup = {
  title: string;
  connection: string;
  words: string[];
};

export type ChallengeForm = {
  title: string;
  groups: ChallengeFormGroup[];
};

export const emptyChallengeForm: ChallengeForm = {
  title: "",
  groups: [0, 1, 2, 3].map(() => ({
    title: "",
    connection: "",
    words: ["", "", "", ""],
  })),
};

export const challengeGroupColors = ["blue", "green", "orange", "purple"] as const;