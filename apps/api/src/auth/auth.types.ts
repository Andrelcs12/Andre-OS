export type AuthenticatedUser = {
  id: string;
  email: string;
};

export type SupabaseUserIdentity = {
  authUserId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};
