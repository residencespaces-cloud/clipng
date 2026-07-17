export function fmt(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

export function clipperCpm(cpm: number) {
  return Math.round(cpm * 0.8);
}
