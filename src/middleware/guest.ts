import auth from "../lib/auth";

export const isGuest = (): boolean => {
  return !auth.isAuthenticated();
};

export default isGuest;