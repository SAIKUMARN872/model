export const formatDate = (
  date: Date | string,
  locale = "en-US"
): string => {
  return new Date(date).toLocaleDateString(locale);
};

export const formatDateTime = (
  date: Date | string,
  locale = "en-US"
): string => {
  return new Date(date).toLocaleString(locale);
};

export const now = (): Date => new Date();

export const daysBetween = (
  start: Date,
  end: Date
): number => {
  const diff = end.getTime() - start.getTime();

  return Math.floor(diff / (1000 * 60 * 60 * 24));
};