// ── GAS Web App URL ──
const GAS_URL = localStorage.getItem('gas_url')
  || 'https://script.google.com/macros/s/AKfycbwWGj2_wgq30WYDDadP7srK1SYdpSua2V_2mh8rWvo6TOGZPLZ8tDFGa8SVeE4sGhU/exec';

// ── Global loading overlay ──
(function () {
  const style = document.createElement('style');
  style.textContent = `
    #gas-loading-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0,0,0,.25);
      align-items: center;
      justify-content: center;
    }
    #gas-loading-overlay.visible { display: flex; }
    #gas-loading-box {
      background: #fff;
      border-radius: 12px;
      padding: 18px 28px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,.18);
      font-family: 'Inter', Arial, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }
    #gas-loading-spinner {
      width: 22px;
      height: 22px;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: gas-spin .7s linear infinite;
      flex-shrink: 0;
    }
    @keyframes gas-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'gas-loading-overlay';
  overlay.innerHTML = `
    <div id="gas-loading-box">
      <div id="gas-loading-spinner"></div>
      <span id="gas-loading-text">Đang kết nối...</span>
    </div>`;
  document.body.appendChild(overlay);
})();

let _gasLoadingCount = 0;

function _gasShowLoading(text) {
  _gasLoadingCount++;
  const el = document.getElementById('gas-loading-text');
  if (el) el.textContent = text || 'Đang kết nối...';
  const ov = document.getElementById('gas-loading-overlay');
  if (ov) ov.classList.add('visible');
}

function _gasHideLoading() {
  _gasLoadingCount = Math.max(0, _gasLoadingCount - 1);
  if (_gasLoadingCount === 0) {
    const ov = document.getElementById('gas-loading-overlay');
    if (ov) ov.classList.remove('visible');
  }
}

// Gọi GAS GET
async function gasGet(sheet) {
  if (!GAS_URL) throw new Error('Chưa cấu hình GAS URL. Vào Trang Chủ để cài đặt.');
  _gasShowLoading(`Đang tải ${sheet}...`);
  try {
    const res = await fetch(`${GAS_URL}?sheet=${sheet}`);
    const data = await res.json();
    if (data.status === 'error') throw new Error(data.message);
    return data;
  } finally {
    _gasHideLoading();
  }
}

// Gọi GAS POST (dùng text/plain để tránh CORS preflight)
async function gasPost(payload) {
  if (!GAS_URL) throw new Error('Chưa cấu hình GAS URL. Vào Trang Chủ để cài đặt.');
  _gasShowLoading('Đang lưu...');
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.status === 'error') throw new Error(data.message);
    return data;
  } finally {
    _gasHideLoading();
  }
}
