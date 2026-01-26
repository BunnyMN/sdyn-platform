# СДЗН Платформ - API Гарын авлага

## Ерөнхий мэдээлэл

- **Base URL**: `https://api.e-sdy.mn/api/v1`
- **Format**: JSON
- **Authentication**: Bearer Token (JWT)

## Authentication

### Нэвтрэх (Login)
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600,
    "token_type": "Bearer"
  }
}
```

### Бүртгүүлэх (Register)
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "Бат",
  "last_name": "Дорж",
  "phone": "99001122"
}
```

### Token шинэчлэх
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Гарах (Logout)
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

---

## Гишүүд (Members)

### Гишүүдийн жагсаалт
```http
GET /members
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | int | Хуудасны дугаар (default: 1) |
| limit | int | Хуудасны хэмжээ (default: 20) |
| search | string | Хайлтын түлхүүр үг |
| status | string | Статус (active, suspended, cancelled) |
| org_id | uuid | Байгууллагын ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "member_id": "SDY-2026-00001",
        "first_name": "Бат",
        "last_name": "Дорж",
        "email": "bat@example.com",
        "phone": "99001122",
        "status": "active",
        "organization": {
          "id": "uuid",
          "name": "Улаанбаатар хотын салбар"
        },
        "joined_at": "2026-01-15T10:30:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}
```

### Гишүүний дэлгэрэнгүй
```http
GET /members/:id
Authorization: Bearer <access_token>
```

### Гишүүн үүсгэх
```http
POST /members
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "Бат",
  "last_name": "Дорж",
  "email": "bat@example.com",
  "phone": "99001122",
  "birth_date": "1995-05-15",
  "gender": "male",
  "education": "bachelor",
  "occupation": "Программист",
  "organization_id": "uuid",
  "address": {
    "province": "Улаанбаатар",
    "district": "Баянзүрх",
    "detail": "5-р хороо, 15-р байр"
  }
}
```

### Гишүүн засварлах
```http
PUT /members/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "phone": "99002233",
  "occupation": "Менежер"
}
```

### Гишүүн устгах
```http
DELETE /members/:id
Authorization: Bearer <access_token>
```

### Гишүүний статус өөрчлөх
```http
POST /members/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "suspended",
  "reason": "Татвар төлөөгүй"
}
```

### Гишүүний түүх
```http
GET /members/:id/history
Authorization: Bearer <access_token>
```

---

## Байгууллага (Organizations)

### Байгууллагын жагсаалт
```http
GET /organizations
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| level | string | Түвшин (national, province, district) |
| parent_id | uuid | Эцэг байгууллагын ID |

### Байгууллага үүсгэх
```http
POST /organizations
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Дархан-Уул аймгийн салбар",
  "level": "province",
  "parent_id": "uuid",
  "province_code": "67"
}
```

### Байгууллагын гишүүд
```http
GET /organizations/:id/members
Authorization: Bearer <access_token>
```

### Байгууллагын статистик
```http
GET /organizations/:id/stats
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_members": 250,
    "active_members": 230,
    "new_members_this_month": 15,
    "fee_collection_rate": 85.5,
    "events_this_month": 3
  }
}
```

---

## Арга хэмжээ (Events)

### Арга хэмжээний жагсаалт
```http
GET /events
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Статус (upcoming, ongoing, completed, cancelled) |
| type | string | Төрөл (meeting, training, campaign, volunteer, other) |
| from | date | Эхлэх огноо |
| to | date | Дуусах огноо |

### Арга хэмжээ үүсгэх
```http
POST /events
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Залуучуудын чуулган 2026",
  "description": "Жилийн уулзалт",
  "type": "meeting",
  "start_date": "2026-03-15T09:00:00Z",
  "end_date": "2026-03-15T18:00:00Z",
  "location": "Улаанбаатар, Чингисийн талбай",
  "max_participants": 500,
  "organization_id": "uuid"
}
```

### Арга хэмжээнд бүртгүүлэх
```http
POST /events/:id/register
Authorization: Bearer <access_token>
```

### Ирц бүртгэх
```http
POST /events/:id/attendance
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "member_id": "uuid",
  "attended": true
}
```

### Оролцогчдын жагсаалт
```http
GET /events/:id/participants
Authorization: Bearer <access_token>
```

---

## Гишүүнчлэлийн татвар (Fees)

### Татварын жагсаалт
```http
GET /fees
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Статус (pending, paid, overdue) |
| year | int | Он |
| member_id | uuid | Гишүүний ID |

### Татвар үүсгэх
```http
POST /fees
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "member_id": "uuid",
  "amount": 50000,
  "year": 2026,
  "due_date": "2026-03-31"
}
```

### Татвар төлөх
```http
PUT /fees/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "paid",
  "paid_amount": 50000,
  "paid_at": "2026-01-20T14:30:00Z",
  "payment_method": "bank_transfer"
}
```

### Гишүүний татварын түүх
```http
GET /fees/member/:memberId
Authorization: Bearer <access_token>
```

### Олноор татвар үүсгэх
```http
POST /fees/bulk
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "organization_id": "uuid",
  "amount": 50000,
  "year": 2026,
  "due_date": "2026-03-31"
}
```

---

## Тайлан (Reports)

### Гишүүнчлэлийн тайлан
```http
GET /reports/members
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| from | date | Эхлэх огноо |
| to | date | Дуусах огноо |
| org_id | uuid | Байгууллагын ID |

### Санхүүгийн тайлан
```http
GET /reports/fees
Authorization: Bearer <access_token>
```

### Арга хэмжээний тайлан
```http
GET /reports/events
Authorization: Bearer <access_token>
```

### Dashboard
```http
GET /reports/dashboard
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_members": 5000,
    "active_members": 4500,
    "new_members_this_month": 120,
    "total_organizations": 25,
    "upcoming_events": 5,
    "fee_collection_rate": 78.5,
    "monthly_growth": [
      {"month": "2026-01", "new": 120, "cancelled": 5},
      {"month": "2025-12", "new": 95, "cancelled": 8}
    ]
  }
}
```

---

## Профайл (Profile)

### Өөрийн профайл харах
```http
GET /profile
Authorization: Bearer <access_token>
```

### Профайл засварлах
```http
PUT /profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "phone": "99003344",
  "address": {
    "district": "Сүхбаатар"
  }
}
```

### Өөрийн татварын түүх
```http
GET /profile/fees
Authorization: Bearer <access_token>
```

### Өөрийн арга хэмжээнүүд
```http
GET /profile/events
Authorization: Bearer <access_token>
```

---

## Алдааны хариу

### Алдааны формат
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Буруу мэдээлэл",
    "details": {
      "email": "Email хаяг буруу форматтай"
    }
  }
}
```

### HTTP Status кодууд
| Code | Description |
|------|-------------|
| 200 | Амжилттай |
| 201 | Үүсгэгдсэн |
| 400 | Буруу хүсэлт |
| 401 | Нэвтрээгүй |
| 403 | Эрх хүрэлцэхгүй |
| 404 | Олдсонгүй |
| 422 | Validation алдаа |
| 429 | Хэт олон хүсэлт |
| 500 | Серверийн алдаа |

---
*Баримт бичгийн хувилбар: 1.0*
*Сүүлд шинэчилсэн: 2026-01-26*
