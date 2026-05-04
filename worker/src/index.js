const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

function ok(message) {
  return json({ status: 'success', message });
}

function err(message, status = 400) {
  return json({ status: 'error', message }, status);
}

export default {
  async fetch(request, env) {
    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    try {
      if (request.method === 'GET') {
        return await handleGet(request, env);
      }
      if (request.method === 'POST') {
        return await handlePost(request, env);
      }
      return err('Method not allowed', 405);
    } catch (e) {
      return err(e.message, 500);
    }
  },
};

// ── GET ──────────────────────────────────────────────
async function handleGet(request, env) {
  const url = new URL(request.url);
  const sheet = url.searchParams.get('sheet') || 'KhachHang';

  switch (sheet) {
    case 'KhachHang': {
      const { results } = await env.DB.prepare(
        'SELECT * FROM KhachHang ORDER BY id'
      ).all();
      // Map id → row để tương thích với frontend hiện tại
      return json(results.map(r => ({ ...r, row: r.id })));
    }
    case 'Tram': {
      const { results } = await env.DB.prepare(
        'SELECT * FROM Tram ORDER BY id'
      ).all();
      return json(results.map(r => ({ ...r, row: r.id })));
    }
    case 'Thon': {
      const { results } = await env.DB.prepare(
        'SELECT * FROM Thon ORDER BY id'
      ).all();
      return json(results.map(r => ({ ...r, row: r.id })));
    }
    case 'Dien': {
      const { results } = await env.DB.prepare(
        'SELECT * FROM Dien LIMIT 1'
      ).all();
      return json(results.map(r => ({ ...r, row: r.id })));
    }
    case 'DienTram': {
      const { results } = await env.DB.prepare(
        'SELECT * FROM DienTram ORDER BY ten_tram'
      ).all();
      return json(results.map(r => ({ ...r, row: r.id })));
    }
    default:
      return err('Sheet không tồn tại: ' + sheet);
  }
}

// ── POST ─────────────────────────────────────────────
async function handlePost(request, env) {
  const body = await request.json();
  const { sheet, action } = body;

  switch (sheet) {
    case 'KhachHang':
      return await handleKhachHang(env, action, body);
    case 'Dien':
      return await handleDien(env, action, body);
    case 'DienTram':
      return await handleDienTram(env, action, body);
    case 'Tram':
      return await handleTram(env, action, body);
    case 'Thon':
      return await handleThon(env, action, body);
    default:
      return err('Sheet không tồn tại: ' + sheet);
  }
}

// ── KhachHang ─────────────────────────────────────────
async function handleKhachHang(env, action, b) {
  if (action === 'insert') {
    await env.DB.prepare(`
      INSERT INTO KhachHang
        (MaKH,HoTen,ChiSoCu,ChiSoMoi,DienSXTieuThu,DienMDKTieuThu,
         ThanhTienSX,ThanhTienMDK,NoCu,CongTien,TongCong,
         Thon,Tram,DiaChi,SoCongTo,SoDienTieuThu,SoDT,Zalo,
         NgayCapNhat,DinhMuc,DienSXRieng,DienMDKRieng)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      b.MaKH, b.HoTen, n(b.ChiSoCu), n(b.ChiSoMoi),
      n(b.DienSXTieuThu), n(b.DienMDKTieuThu),
      n(b.ThanhTienSX), n(b.ThanhTienMDK),
      n(b.NoCu), n(b.CongTien), n(b.TongCong),
      b.Thon, b.Tram, b.DiaChi, b.SoCongTo,
      n(b.SoDienTieuThu), b.SoDT, b.Zalo,
      b.NgayCapNhat, n(b.DinhMuc),
      b.DienSXRieng || null, b.DienMDKRieng || null
    ).run();
    return ok('Đã thêm Khách Hàng thành công');
  }

  if (action === 'update') {
    await env.DB.prepare(`
      UPDATE KhachHang SET
        MaKH=?,HoTen=?,ChiSoCu=?,ChiSoMoi=?,
        DienSXTieuThu=?,DienMDKTieuThu=?,
        ThanhTienSX=?,ThanhTienMDK=?,
        NoCu=?,CongTien=?,TongCong=?,
        Thon=?,Tram=?,DiaChi=?,SoCongTo=?,
        SoDienTieuThu=?,SoDT=?,Zalo=?,
        NgayCapNhat=?,DinhMuc=?,
        DienSXRieng=?,DienMDKRieng=?
      WHERE id=?
    `).bind(
      b.MaKH, b.HoTen, n(b.ChiSoCu), n(b.ChiSoMoi),
      n(b.DienSXTieuThu), n(b.DienMDKTieuThu),
      n(b.ThanhTienSX), n(b.ThanhTienMDK),
      n(b.NoCu), n(b.CongTien), n(b.TongCong),
      b.Thon, b.Tram, b.DiaChi, b.SoCongTo,
      n(b.SoDienTieuThu), b.SoDT, b.Zalo,
      b.NgayCapNhat, n(b.DinhMuc),
      b.DienSXRieng || null, b.DienMDKRieng || null,
      b.row
    ).run();
    return ok('Đã cập nhật Khách Hàng thành công');
  }

  if (action === 'delete') {
    await env.DB.prepare('DELETE FROM KhachHang WHERE id=?').bind(b.row).run();
    return ok('Đã xóa Khách Hàng thành công');
  }

  return err('Action không hợp lệ');
}

// ── Dien ──────────────────────────────────────────────
async function handleDien(env, action, b) {
  if (action === 'insert') {
    await env.DB.prepare(
      'INSERT INTO Dien (dien_sx, dien_mdk, dinh_muc) VALUES (?,?,?)'
    ).bind(n(b.dien_sx), n(b.dien_mdk), n(b.dinh_muc)).run();
    return ok('Đã thêm dữ liệu Điện thành công');
  }
  if (action === 'update') {
    await env.DB.prepare(
      'UPDATE Dien SET dien_sx=?, dien_mdk=?, dinh_muc=? WHERE id=?'
    ).bind(n(b.dien_sx), n(b.dien_mdk), n(b.dinh_muc), b.row).run();
    return ok('Đã cập nhật dữ liệu Điện thành công');
  }
  if (action === 'delete') {
    await env.DB.prepare('DELETE FROM Dien WHERE id=?').bind(b.row).run();
    return ok('Đã xóa dữ liệu Điện thành công');
  }
  return err('Action không hợp lệ');
}

// ── DienTram ──────────────────────────────────────────
async function handleDienTram(env, action, b) {
  if (action === 'upsert') {
    await env.DB.prepare(`
      INSERT INTO DienTram (ten_tram, dien_sx, dien_mdk)
      VALUES (?, ?, ?)
      ON CONFLICT(ten_tram) DO UPDATE SET
        dien_sx  = excluded.dien_sx,
        dien_mdk = excluded.dien_mdk
    `).bind(b.ten_tram, n(b.dien_sx), n(b.dien_mdk)).run();
    return ok('Đã lưu giá điện trạm ' + b.ten_tram);
  }
  if (action === 'delete') {
    await env.DB.prepare('DELETE FROM DienTram WHERE id=?').bind(b.row).run();
    return ok('Đã xóa giá điện trạm');
  }
  return err('Action không hợp lệ');
}

// ── Tram ──────────────────────────────────────────────
async function handleTram(env, action, b) {
  if (action === 'insert') {
    await env.DB.prepare(
      'INSERT INTO Tram (ma_tram, ten_tram) VALUES (?,?)'
    ).bind(b.ma_tram, b.ten_tram).run();
    return ok('Đã thêm Trạm thành công');
  }
  if (action === 'update') {
    await env.DB.prepare(
      'UPDATE Tram SET ma_tram=?, ten_tram=? WHERE id=?'
    ).bind(b.ma_tram, b.ten_tram, b.row).run();
    return ok('Đã cập nhật Trạm thành công');
  }
  if (action === 'delete') {
    await env.DB.prepare('DELETE FROM Tram WHERE id=?').bind(b.row).run();
    return ok('Đã xóa Trạm thành công');
  }
  return err('Action không hợp lệ');
}

// ── Thon ──────────────────────────────────────────────
async function handleThon(env, action, b) {
  if (action === 'insert') {
    await env.DB.prepare(
      'INSERT INTO Thon (ma_thon, ten_thon) VALUES (?,?)'
    ).bind(b.ma_thon, b.ten_thon).run();
    return ok('Đã thêm Thôn thành công');
  }
  if (action === 'update') {
    await env.DB.prepare(
      'UPDATE Thon SET ma_thon=?, ten_thon=? WHERE id=?'
    ).bind(b.ma_thon, b.ten_thon, b.row).run();
    return ok('Đã cập nhật Thôn thành công');
  }
  if (action === 'delete') {
    await env.DB.prepare('DELETE FROM Thon WHERE id=?').bind(b.row).run();
    return ok('Đã xóa Thôn thành công');
  }
  return err('Action không hợp lệ');
}

// ── Helper ────────────────────────────────────────────
function n(v) {
  const f = parseFloat(v);
  return isNaN(f) ? 0 : f;
}
