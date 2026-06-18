# ✨ CSV Compare - Frontend UI

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Badge"/>
  <img src="https://img.shields.io/badge/Vite-6.0.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite Badge"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS Badge"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Badge"/>
</p>

<p align="center">
  <a href="#-features">Tính Năng</a> •
  <a href="#%EF%B8%8F-tech-stack">Công Nghệ</a> •
  <a href="#-key-components">Các Component Chính</a> •
  <a href="#%EF%B8%8F-getting-started">Cài Đặt & Chạy</a> •
  <a href="#-directory-structure">Cấu Trúc Thư Mục</a>
</p>

---

## 📝 Giới Thiệu

**CSV Compare - Frontend UI** là giao diện người dùng trực quan, hiện đại giúp người dùng dễ dàng upload và so sánh sự khác biệt giữa hai phiên bản file CSV. Kết nối trực tiếp với [CSV Compare Backend Engine](file:///c:/DevSpace/Working/fumirai-ltd/compare-csv/compare-csv-be), giao diện cung cấp cái nhìn tổng quan trực quan nhất và hỗ trợ hiển thị dữ liệu cực lớn mượt mà nhờ công nghệ cuộn ảo (**Virtual Scrolling**).

Với giao diện được thiết kế hiện đại sử dụng **Tailwind CSS v4** mới nhất, ứng dụng mang lại trải nghiệm tối ưu trên cả desktop lẫn các thiết bị di động.

---

## 🚀 Features (Tính Năng Nổi Bật)

* **📂 Form Upload Trực Quan**: Kéo thả hoặc chọn trực tiếp file `base` và `target`, đồng thời nhập trường Khóa chính (`primaryKey`) dễ dàng. Có thông báo lỗi chi tiết khi upload sai định dạng file.
* **📊 Bảng So Sánh Thông Minh (Diff Table)**:
  * Hiển thị danh sách kết quả so sánh dạng bảng phân trang.
  * Phân biệt trạng thái bằng màu sắc trực quan (Xanh lá cho dòng mới `ADDED`, Đỏ cho dòng bị xóa `DELETED`, Vàng cho dòng bị sửa `MODIFIED`).
  * Chỉ ra chi tiết cột nào bị thay đổi (từ giá trị cũ sang giá trị mới) đối với các dòng bị chỉnh sửa (`MODIFIED`).
* **⚡ Hiệu Năng Cuộn Virtualized**: Tích hợp `@tanstack/react-virtual` giúp render hàng chục ngàn dòng trong bảng kết quả một cách mượt mà mà không lo đơ/lag trình duyệt.
* **🔍 Bộ Lọc Trạng Thái & Phân Trang**: Lọc kết quả theo các trạng thái khác nhau (Tất cả, Added, Deleted, Modified, Unchanged) kết hợp tính năng phân trang tiện lợi.
* **🔄 Chuyển Đổi Nhanh**: Dễ dàng đặt lại phiên làm việc hiện tại để thực hiện so sánh hai file khác.

---

## 🛠️ Tech Stack (Công Nghệ Sử Dụng)

* **Core**: [React 19](https://react.dev/) (Sử dụng Hook mới, React Server/Client Architecture ready)
* **Build Tool**: [Vite 6](https://vite.dev/) (Khởi động cực nhanh, HMR siêu tốc)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Dùng plugin chính thức cho Vite `@tailwindcss/vite` với hiệu năng biên dịch vượt trội)
* **Virtualization**: [@tanstack/react-virtual](https://tanstack.com/virtual/latest)
* **Ngôn Ngữ**: [TypeScript](https://www.typescriptlang.org/) v6

---

## 🧩 Key Components (Các Component Chính)

1. **`UploadForm.tsx`**: Component xử lý form upload. Cung cấp khu vực kéo thả file, kiểm tra định dạng file phía client, gửi request so sánh (`multipart/form-data`) lên Backend và xử lý các trạng thái Loading/Error.
2. **`DiffTable.tsx`**: Component chính quản lý bảng kết quả. Nó gọi API phân trang kết quả từ Backend dựa trên `jobId` hiện tại, quản lý trạng thái phân trang, bộ lọc và tích hợp tính năng Virtualization.
3. **`DiffRow.tsx`**: Component hiển thị chi tiết cho từng dòng kết quả. Tự động kiểm tra trạng thái dòng để tô màu nền và định dạng các cột thay đổi.
4. **`constants.ts`**: Lưu trữ các hằng số, cấu hình phân trang và nhãn nhãn hiển thị cho các trạng thái.

---

## ⚙️ Getting Started (Cài Đặt & Chạy)

### 📋 Yêu Cầu Hệ Thống
* Node.js v18.x trở lên.
* Trình quản lý gói `pnpm` (khuyến nghị).

### 🛠️ Cài Đặt Dependencies
Chạy lệnh sau tại thư mục root của Frontend:
```bash
pnpm install
```

### 🚀 Khởi Chạy Development (Dev Mode)
Chạy ứng dụng trong môi trường phát triển:
```bash
pnpm run dev
```
Ứng dụng sẽ chạy tại địa chỉ mặc định của Vite (thường là [http://localhost:3000](http://localhost:3000) hoặc cổng được chỉ định trong terminal).

> [!NOTE]  
> Mặc định Frontend sẽ kết nối tới Backend tại `http://localhost:8080`. Hãy chắc chắn rằng [CSV Compare Backend Engine](file:///c:/DevSpace/Working/fumirai-ltd/compare-csv/compare-csv-be) đang chạy trước khi bắt đầu so sánh file.

### 📦 Build & Chạy Production
1. **Build mã nguồn tối ưu**:
   ```bash
   pnpm run build
   ```
2. **Xem trước bản build production**:
   ```bash
   pnpm run preview
   ```

---

## 📁 Directory Structure (Cấu Trúc Thư Mục)

```text
compare-csv-fe/
├── src/
│   ├── components/      # Chứa các React Component (UploadForm, DiffTable,...)
│   │   ├── DiffTable/   # Thư mục riêng cho bảng so sánh (DiffTable, DiffRow, constants)
│   │   └── UploadForm.tsx
│   ├── hooks/           # Custom React hooks (nếu có)
│   ├── types/           # Định nghĩa các TypeScript Interface / Types cho FE
│   ├── App.tsx          # Quản lý luồng hiển thị chính (Upload Form <-> Bảng Diff)
│   ├── index.css        # Cấu hình Tailwind CSS v4 directives
│   ├── main.tsx         # Điểm khởi đầu khởi chạy React DOM
│   └── vite-env.d.ts    # Cấu hình TypeScript cho Vite env variables
├── public/              # Chứa các tài nguyên tĩnh như logo, favicon
├── index.html           # File HTML chính
├── vite.config.ts       # Cấu hình Vite & plugin Tailwind CSS v4
├── tsconfig.json        # Cấu hình TypeScript
└── package.json         # Danh sách thư viện & scripts của Frontend
```

---

## 📄 License
Dự án được cấp phép dưới quyền sở hữu [MIT License](LICENSE).