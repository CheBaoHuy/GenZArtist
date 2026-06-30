// Định dạng tiền VND: 500000 -> "500.000₫"
export function vnd(amount) {
  const n = Math.round(Number(amount) || 0);
  return n.toLocaleString('vi-VN') + '₫';
}
