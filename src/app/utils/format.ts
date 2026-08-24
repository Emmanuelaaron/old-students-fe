export const fmtUGX = (n: number) => `UGX ${n.toLocaleString()}`;

export const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const fmtMonth = (ym: string) => {
  const [y, m] = ym.split("-");
  return new Date(+y, +m - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
};

export const nowYM = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const todayISO = () => new Date().toISOString().split("T")[0];
