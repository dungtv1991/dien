function doGet(e) {
  var sheetName = e.parameter.sheet || "KhachHang";
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Không tìm thấy sheet: " + sheetName }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getDataRange().getValues();
  var result = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (sheetName === "KhachHang") {
      result.push({
        row: i + 1,
        MaKH:           row[0],
        HoTen:          row[1],
        ChiSoCu:        row[2],
        ChiSoMoi:       row[3],
        DienSXTieuThu:  row[4],
        DienMDKTieuThu: row[5],
        ThanhTienSX:    row[6],
        ThanhTienMDK:   row[7],
        NoCu:           row[8],
        CongTien:       row[9],
        TongCong:       row[10],
        Thon:              row[11],
        Tram:              row[12],
        DiaChi:            row[13],
        SoCongTo:          row[14],
        SoDienTieuThu:     row[15],
        SoDT:              row[16],
        Zalo:              row[17],
        NgayCapNhat:       row[18],
        DinhMuc:           row[19]
      });
    } else if (sheetName === "Thon") {
      result.push({ row: i + 1, ma_thon: row[0], ten_thon: row[1] });
    } else if (sheetName === "Tram") {
      result.push({ row: i + 1, ma_tram: row[0], ten_tram: row[1] });
    } else if (sheetName === "Dien") {
      result.push({ row: i + 1, dien_sx: row[0], dien_mdk: row[1], dinh_muc: row[2] });
    }
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    var sheetName = requestData.sheet;

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Không tìm thấy sheet: " + sheetName }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --- SHEET KHACH HANG ---
    if (sheetName === "KhachHang") {
      var khRow = [
        requestData.MaKH,           requestData.HoTen,
        requestData.ChiSoCu,        requestData.ChiSoMoi,
        requestData.DienSXTieuThu,  requestData.DienMDKTieuThu,
        requestData.ThanhTienSX,    requestData.ThanhTienMDK,
        requestData.NoCu,           requestData.CongTien,
        requestData.TongCong,       requestData.Thon,
        requestData.Tram,           requestData.DiaChi,
        requestData.SoCongTo,       requestData.SoDienTieuThu,
        requestData.SoDT,           requestData.Zalo,
        requestData.NgayCapNhat,    requestData.DinhMuc
      ];
      if (requestData.action === "insert") {
        sheet.appendRow(khRow);
        return ok("Đã thêm Khách Hàng thành công");
      } else if (requestData.action === "update") {
        sheet.getRange(requestData.row, 1, 1, khRow.length).setValues([khRow]);
        return ok("Đã cập nhật Khách Hàng thành công");
      } else if (requestData.action === "delete") {
        sheet.deleteRow(requestData.row);
        return ok("Đã xóa Khách Hàng thành công");
      }
    }

    // --- SHEET DIEN ---
    else if (sheetName === "Dien") {
      if (requestData.action === "insert") {
        sheet.appendRow([requestData.dien_sx, requestData.dien_mdk, requestData.dinh_muc]);
        return ok("Đã thêm dữ liệu Điện thành công");
      } else if (requestData.action === "update") {
        sheet.getRange(requestData.row, 1, 1, 3).setValues([[requestData.dien_sx, requestData.dien_mdk, requestData.dinh_muc]]);
        return ok("Đã cập nhật dữ liệu Điện thành công");
      } else if (requestData.action === "delete") {
        sheet.deleteRow(requestData.row);
        return ok("Đã xóa dữ liệu Điện thành công");
      }
    }

    // --- SHEET THON ---
    else if (sheetName === "Thon") {
      if (requestData.action === "insert") {
        sheet.appendRow([requestData.ma_thon, requestData.ten_thon]);
        return ok("Đã thêm Thôn thành công");
      } else if (requestData.action === "update") {
        sheet.getRange(requestData.row, 1, 1, 2).setValues([[requestData.ma_thon, requestData.ten_thon]]);
        return ok("Đã cập nhật Thôn thành công");
      } else if (requestData.action === "delete") {
        sheet.deleteRow(requestData.row);
        return ok("Đã xóa Thôn thành công");
      }
    }

    // --- SHEET TRAM ---
    else if (sheetName === "Tram") {
      if (requestData.action === "insert") {
        sheet.appendRow([requestData.ma_tram, requestData.ten_tram]);
        return ok("Đã thêm Trạm thành công");
      } else if (requestData.action === "update") {
        sheet.getRange(requestData.row, 1, 1, 2).setValues([[requestData.ma_tram, requestData.ten_tram]]);
        return ok("Đã cập nhật Trạm thành công");
      } else if (requestData.action === "delete") {
        sheet.deleteRow(requestData.row);
        return ok("Đã xóa Trạm thành công");
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Hành động không hợp lệ" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function ok(msg) {
  return ContentService.createTextOutput(JSON.stringify({ status: "success", message: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
