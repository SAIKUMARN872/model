export const formatCurrency = (
  amount: number,
  currency = "USD"
) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatNumber = (value: number) =>
  new Intl.NumberFormat().format(value);

export const truncate = (
  text: string,
  length = 50
): string =>
  text.length > length
    ? `${text.slice(0, length)}...`
    : text;

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};