/**
 * Paste toàn bộ file này vào Google Apps Script Editor
 * Điền ACCOUNT_ID và API_TOKEN rồi chạy hàm importToDB()
 *
 * Lấy thông tin tại:
 * - ACCOUNT_ID: dash.cloudflare.com → bên phải màn hình
 * - API_TOKEN:  dash.cloudflare.com → My Profile → API Tokens
 *               → Create Token → D1 Edit
 */

const ACCOUNT_ID  = 'REPLACE_YOUR_ACCOUNT_ID';
const API_TOKEN   = 'REPLACE_YOUR_API_TOKEN';
const DATABASE_ID = '6d9b01f9-c343-4918-93db-dbbec04b0c80';
const D1_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

function importToDB() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  importTram(ss);
  importThon(ss);
  importDien(ss);
  importDienTram(ss);
  importKhachHang(ss);
  Logger.log('✅ Import hoàn tất!');
}

function d1Exec(sql) {
  const res = UrlFetchApp.fetch(D1_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + API_TOKEN,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify({ sql: sql }),
    muteHttpExceptions: true,
  });
  const body = JSON.parse(res.getContentText());
  if (!body.success) throw new Error(JSON.stringify(body.errors));
  return body;
}

function importKhachHang(ss) {
  const sheet = ss.getSheetByName('KhachHang');
  if (!sheet) { Logger.log('Không tìm thấy sheet KhachHang'); return; }
  const data = sheet.getDataRange().getValues();
  Logger.log('Importing KhachHang: ' + (data.length - 1) + ' rows...');

  d1Exec('DELETE FROM KhachHang');

  // Gửi từng batch 20 rows để tránh timeout
  const BATCH = 20;
  for (let i = 1; i < data.length; i += BATCH) {
    const sqls = [];
    for (let j = i; j < Math.min(i + BATCH, data.length); j++) {
      const r = data[j];
      sqls.push(
        `INSERT INTO KhachHang (MaKH,HoTen,ChiSoCu,ChiSoMoi,DienSXTieuThu,DienMDKTieuThu,` +
        `ThanhTienSX,ThanhTienMDK,NoCu,CongTien,TongCong,Thon,Tram,DiaChi,SoCongTo,` +
        `SoDienTieuThu,SoDT,Zalo,NgayCapNhat,DinhMuc,DienSXRieng,DienMDKRieng) VALUES (` +
        [s(r[0]),s(r[1]),n(r[2]),n(r[3]),n(r[4]),n(r[5]),
         n(r[6]),n(r[7]),n(r[8]),n(r[9]),n(r[10]),
         s(r[11]),s(r[12]),s(r[13]),s(r[14]),n(r[15]),s(r[16]),s(r[17]),
         d(r[18]),n(r[19]),
         r[20]?n(r[20]):'NULL', r[21]?n(r[21]):'NULL'
        ].join(',') + ')'
      );
    }
    d1Exec(sqls.join(';\n'));
    Logger.log('  Rows ' + i + ' → ' + Math.min(i + BATCH - 1, data.length - 1));
  }
  Logger.log('✅ KhachHang xong');
}

function importTram(ss) {
  const sheet = ss.getSheetByName('Tram');
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  d1Exec('DELETE FROM Tram');
  const sqls = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    sqls.push(`INSERT INTO Tram (ma_tram,ten_tram) VALUES (${s(r[0])},${s(r[1])})`);
  }
  if (sqls.length) d1Exec(sqls.join(';\n'));
  Logger.log('✅ Tram xong (' + sqls.length + ' rows)');
}

function importThon(ss) {
  const sheet = ss.getSheetByName('Thon');
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  d1Exec('DELETE FROM Thon');
  const sqls = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    sqls.push(`INSERT INTO Thon (ma_thon,ten_thon) VALUES (${s(r[0])},${s(r[1])})`);
  }
  if (sqls.length) d1Exec(sqls.join(';\n'));
  Logger.log('✅ Thon xong (' + sqls.length + ' rows)');
}

function importDien(ss) {
  const sheet = ss.getSheetByName('Dien');
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  d1Exec('DELETE FROM Dien');
  const sqls = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    sqls.push(`INSERT INTO Dien (dien_sx,dien_mdk,dinh_muc) VALUES (${n(r[0])},${n(r[1])},${n(r[2])})`);
  }
  if (sqls.length) d1Exec(sqls.join(';\n'));
  Logger.log('✅ Dien xong');
}

function importDienTram(ss) {
  const sheet = ss.getSheetByName('DienTram');
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  d1Exec('DELETE FROM DienTram');
  const sqls = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    sqls.push(`INSERT INTO DienTram (ten_tram,dien_sx,dien_mdk) VALUES (${s(r[0])},${n(r[1])},${n(r[2])})`);
  }
  if (sqls.length) d1Exec(sqls.join(';\n'));
  Logger.log('✅ DienTram xong');
}

// ── Helpers ──
function s(v) {
  if (v === null || v === undefined || v === '') return 'NULL';
  return "'" + String(v).replace(/'/g, "''") + "'";
}
function n(v) {
  const f = parseFloat(v);
  return isNaN(f) ? 0 : f;
}
function d(v) {
  if (!v) return 'NULL';
  if (v instanceof Date) return "'" + v.toISOString().slice(0, 10) + "'";
  const dt = new Date(String(v));
  if (!isNaN(dt.getTime())) return "'" + dt.toISOString().slice(0, 10) + "'";
  return s(v);
}
