    /**
     * Chạy file này trong Google Apps Script để export data ra SQL
     * Paste vào Apps Script Editor → Run → copy output từ Logs
     */
    function exportToSQL() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const lines = [];

    // ── KhachHang ──
    const kh = ss.getSheetByName('KhachHang');
    if (kh) {
        const data = kh.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
        const r = data[i];
        const vals = [
            sqlStr(r[0]),  // MaKH
            sqlStr(r[1]),  // HoTen
            sqlNum(r[2]),  // ChiSoCu
            sqlNum(r[3]),  // ChiSoMoi
            sqlNum(r[4]),  // DienSXTieuThu
            sqlNum(r[5]),  // DienMDKTieuThu
            sqlNum(r[6]),  // ThanhTienSX
            sqlNum(r[7]),  // ThanhTienMDK
            sqlNum(r[8]),  // NoCu
            sqlNum(r[9]),  // CongTien
            sqlNum(r[10]), // TongCong
            sqlStr(r[11]), // Thon
            sqlStr(r[12]), // Tram
            sqlStr(r[13]), // DiaChi
            sqlStr(r[14]), // SoCongTo
            sqlNum(r[15]), // SoDienTieuThu
            sqlStr(r[16]), // SoDT
            sqlStr(r[17]), // Zalo
            sqlStr(r[18]), // NgayCapNhat
            sqlNum(r[19]), // DinhMuc
            r[20] ? sqlNum(r[20]) : 'NULL', // DienSXRieng
            r[21] ? sqlNum(r[21]) : 'NULL', // DienMDKRieng
        ].join(',');
        lines.push(`INSERT INTO KhachHang (MaKH,HoTen,ChiSoCu,ChiSoMoi,DienSXTieuThu,DienMDKTieuThu,ThanhTienSX,ThanhTienMDK,NoCu,CongTien,TongCong,Thon,Tram,DiaChi,SoCongTo,SoDienTieuThu,SoDT,Zalo,NgayCapNhat,DinhMuc,DienSXRieng,DienMDKRieng) VALUES (${vals});`);
        }
    }

    // ── Tram ──
    const tram = ss.getSheetByName('Tram');
    if (tram) {
        const data = tram.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
        const r = data[i];
        lines.push(`INSERT INTO Tram (ma_tram,ten_tram) VALUES (${sqlStr(r[0])},${sqlStr(r[1])});`);
        }
    }

    // ── Thon ──
    const thon = ss.getSheetByName('Thon');
    if (thon) {
        const data = thon.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
        const r = data[i];
        lines.push(`INSERT INTO Thon (ma_thon,ten_thon) VALUES (${sqlStr(r[0])},${sqlStr(r[1])});`);
        }
    }

    // ── Dien ──
    const dien = ss.getSheetByName('Dien');
    if (dien) {
        const data = dien.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
        const r = data[i];
        lines.push(`INSERT INTO Dien (dien_sx,dien_mdk,dinh_muc) VALUES (${sqlNum(r[0])},${sqlNum(r[1])},${sqlNum(r[2])});`);
        }
    }

    // ── DienTram ──
    const dienTram = ss.getSheetByName('DienTram');
    if (dienTram) {
        const data = dienTram.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
        const r = data[i];
        lines.push(`INSERT INTO DienTram (ten_tram,dien_sx,dien_mdk) VALUES (${sqlStr(r[0])},${sqlNum(r[1])},${sqlNum(r[2])});`);
        }
    }

    Logger.log(lines.join('\n'));

    // Ghi ra file trên Google Drive để tránh bị cắt log
    const fileName = 'data_' + new Date().toISOString().slice(0,10) + '.sql';
    DriveApp.createFile(fileName, lines.join('\n'), MimeType.PLAIN_TEXT);
    Logger.log('✅ Đã tạo file: ' + fileName + ' (' + lines.length + ' câu SQL)');
    }

    function sqlStr(v) {
    if (v === null || v === undefined || v === '') return 'NULL';
    // Nếu là Date object hoặc chuỗi ngày dài → chuyển về YYYY-MM-DD
    if (v instanceof Date) return "'" + v.toISOString().slice(0, 10) + "'";
    const s = String(v);
    const d = new Date(s);
    if (!isNaN(d.getTime()) && s.length > 15) return "'" + d.toISOString().slice(0, 10) + "'";
    return "'" + s.replace(/'/g, "''") + "'";
    }

    function sqlNum(v) {
    const f = parseFloat(v);
    return isNaN(f) ? 0 : f;
    }
