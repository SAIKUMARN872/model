export const isEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isPhone = (phone: string): boolean => {
  return /^[0-9]{10}$/.test(phone);
};

export const minLength = (
  value: string,
  length: number
): boolean => value.length >= length;

export const maxLength = (
  value: string,
  length: number
): boolean => value.length <= length;

export const isRequired = (value: unknown): boolean => {
  return value !== undefined && value !== null && value !== "";
};