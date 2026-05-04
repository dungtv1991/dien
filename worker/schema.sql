-- Xóa bảng cũ nếu có (chạy lần đầu)
DROP TABLE IF EXISTS KhachHang;
DROP TABLE IF EXISTS Tram;
DROP TABLE IF EXISTS Thon;
DROP TABLE IF EXISTS Dien;
DROP TABLE IF EXISTS DienTram;

-- Bảng khách hàng
CREATE TABLE KhachHang (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  MaKH        TEXT,
  HoTen       TEXT,
  ChiSoCu     REAL DEFAULT 0,
  ChiSoMoi    REAL DEFAULT 0,
  DienSXTieuThu  REAL DEFAULT 0,
  DienMDKTieuThu REAL DEFAULT 0,
  ThanhTienSX    REAL DEFAULT 0,
  ThanhTienMDK   REAL DEFAULT 0,
  NoCu           REAL DEFAULT 0,
  CongTien       REAL DEFAULT 0,
  TongCong       REAL DEFAULT 0,
  Thon           TEXT,
  Tram           TEXT,
  DiaChi         TEXT,
  SoCongTo       TEXT,
  SoDienTieuThu  REAL DEFAULT 0,
  SoDT           TEXT,
  Zalo           TEXT,
  NgayCapNhat    TEXT,
  DinhMuc        REAL DEFAULT 0,
  DienSXRieng    REAL,
  DienMDKRieng   REAL
);

-- Bảng trạm
CREATE TABLE Tram (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ma_tram  TEXT,
  ten_tram TEXT
);

-- Bảng thôn
CREATE TABLE Thon (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ma_thon  TEXT,
  ten_thon TEXT
);

-- Bảng giá điện chung
CREATE TABLE Dien (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  dien_sx  REAL DEFAULT 0,
  dien_mdk REAL DEFAULT 0,
  dinh_muc REAL DEFAULT 0
);

-- Bảng giá điện riêng theo trạm
CREATE TABLE DienTram (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ten_tram TEXT UNIQUE,
  dien_sx  REAL DEFAULT 0,
  dien_mdk REAL DEFAULT 0
);
