import auth from "../lib/auth";

export const isAdmin = (): boolean => {
  const user = auth.getUser<any>();

  return user?.role === "admin";
};

export default isAdmin;