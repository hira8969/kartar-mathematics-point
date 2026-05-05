export const formatDate = (value, options) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", options || { day: "2-digit", month: "short", year: "numeric" });
};
