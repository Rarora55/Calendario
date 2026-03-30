declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        displayName: string | null;
        avatarUrl: string | null;
        provider: "google";
      };
    }
  }
}

export {};
