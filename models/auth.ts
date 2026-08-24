export type AuthMode = "welcome" | "login" | "signup";

export type AuthForm = {
  email: string;
  username: string;
  password: string;
};

export const emptyAuthForm: AuthForm = {
  email: "",
  username: "",
  password: "",
};