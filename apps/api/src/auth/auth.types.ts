export type AuthenticatedUser = {
  id: string;
  email: string;
};

export type GoogleProfileData = {
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};
