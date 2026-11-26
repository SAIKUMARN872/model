import auth from "../lib/auth";

export const hasOrganization = (): boolean => {
  const user = auth.getUser<any>();

  return !!user?.organizationId;
};

export default hasOrganization;