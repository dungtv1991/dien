// ── GAS Web App URL ──
const GAS_URL = localStorage.getItem('gas_url')
  || 'https://script.google.com/macros/s/AKfycbwWGj2_wgq30WYDDadP7srK1SYdpSua2V_2mh8rWvo6TOGZPLZ8tDFGa8SVeE4sGhU/exec';

// Gọi GAS GET
async function gasGet(sheet) {
  if (!GAS_URL) throw new Error('Chưa cấu hình GAS URL. Vào Trang Chủ để cài đặt.');
  const res = await fetch(`${GAS_URL}?sheet=${sheet}`);
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message);
  return data;
}

// Gọi GAS POST (dùng text/plain để tránh CORS preflight)
async function gasPost(payload) {
  if (!GAS_URL) throw new Error('Chưa cấu hình GAS URL. Vào Trang Chủ để cài đặt.');
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message);
  return data;
}
