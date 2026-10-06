# 👶 MomCare - Nhật Ký Theo Dõi Sinh Hoạt Bé Yêu

Ứng dụng web responsive dành cho Bố/Mẹ để theo dõi giờ giấc sinh hoạt của con hằng ngày (Cho bú, Giấc ngủ, Thay tã, Sức khỏe, Tăng trưởng).

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** React (Vite) + Tailwind CSS + Lucide Icons + Recharts + React Router DOM
- **Backend:** Python FastAPI + SQLAlchemy 2.0 + Pydantic v2 + Passlib (Bcrypt) + Python-Jose (JWT)
- **Database:** PostgreSQL 16 + Alembic Migrations
- **Containerization:** Docker & Docker Compose (Multi-stage builds)

---

## 🚀 Hướng Dẫn Khởi Chạy Với Docker (Khuyên Dùng)

```bash
# 1. Tạo file cấu hình từ template
cp .env.example .env

# 2. Khởi chạy tất cả các container
docker compose up --build -d
```

Sau khi các container chạy xong:
- **Web App (Frontend):** `http://localhost`
- **Swagger API Docs (Backend):** `http://localhost:8000/docs`
- **PostgreSQL Database:** Port `5432`

---

## 💻 Hướng Dẫn Khởi Chạy Thủ Công

### 1. Backend (Python FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
pip install -r requirements.txt

# Chạy migrations
alembic upgrade head

# Khởi chạy server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Truy cập Frontend tại: `http://localhost:5173`

---

## 📋 Tính Năng

### 🔐 Hệ thống xác thực
- Đăng ký / Đăng nhập
- **Ghi nhớ đăng nhập** (Refresh Token 90 ngày qua HttpOnly Cookie)
- Auto-refresh token khi hết hạn (401 auto-retry)

### 👶 Quản lý bé
- Tạo / sửa / xóa hồ sơ bé
- Hỗ trợ nhiều bé (FamilyMember many-to-many)

### 📝 Ghi nhận hoạt động
- **Timer bấm giờ** cho bú/ngủ
- **Quick-log 1 chạm** (Cho bú 🍼, Đi ngủ 🌙, Thay tã 👶, Sức khỏe 💊)
- Timeline nhật ký hôm nay
- Tạo / sửa / xóa hoạt động

### 📊 Thống kê
- Tổng hợp theo ngày (số lần bú, tổng ml, giờ ngủ, số tã)
- Biểu đồ 7 ngày gần nhất (Recharts bar chart)
- Chọn ngày xem lại

### 📏 Theo dõi tăng trưởng
- Ghi nhận cân nặng, chiều cao, vòng đầu
- Lịch sử tăng trưởng

### 📱 Mobile-first
- Bottom navigation bar trên mobile
- Touch-friendly buttons
- Responsive TailwindCSS

---

## 🗂️ API Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| `POST` | `/api/v1/auth/register` | Đăng ký |
| `POST` | `/api/v1/auth/login` | Đăng nhập |
| `POST` | `/api/v1/auth/refresh` | Refresh token |
| `POST` | `/api/v1/auth/logout` | Đăng xuất |
| `GET` | `/api/v1/auth/me` | User hiện tại |
| `GET` | `/api/v1/babies/` | Danh sách bé |
| `POST` | `/api/v1/babies/` | Thêm bé |
| `PUT` | `/api/v1/babies/{id}` | Cập nhật bé |
| `DELETE` | `/api/v1/babies/{id}` | Xóa bé |
| `GET` | `/api/v1/activities/` | Danh sách hoạt động |
| `POST` | `/api/v1/activities/` | Thêm hoạt động |
| `PUT` | `/api/v1/activities/{id}` | Cập nhật hoạt động |
| `DELETE` | `/api/v1/activities/{id}` | Xóa hoạt động |
| `GET` | `/api/v1/growth/` | Lịch sử tăng trưởng |
| `POST` | `/api/v1/growth/` | Ghi nhận tăng trưởng |
| `DELETE` | `/api/v1/growth/{id}` | Xóa log tăng trưởng |
| `GET` | `/api/v1/summary/daily` | Tổng hợp ngày |
| `GET` | `/api/v1/summary/weekly` | Tổng hợp 7 ngày |

---

## 🔐 Cơ Chế Remember Me

- **Access Token:** JWT ngắn hạn (30 phút) lưu trong localStorage
- **Refresh Token:** Lưu trong `HttpOnly Cookie` bảo mật (90 ngày)
- **Auto-retry:** Khi access token hết hạn, frontend tự động refresh và retry request
