import auth from "../lib/auth";

export const requireAuth = (): boolean => {
  return auth.isAuthenticated();
};

export default requireAuth;