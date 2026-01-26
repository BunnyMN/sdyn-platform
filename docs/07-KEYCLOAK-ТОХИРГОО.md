# СДЗН Платформ - Keycloak тохиргоо

## Нэвтрэх

- **URL**: https://auth.e-sdy.mn/admin/master/console/
- **Username**: admin
- **Password**: .env файлаас `KEYCLOAK_ADMIN_PASSWORD`

## Realm тохиргоо

### SDYN Realm үүсгэгдсэн
- **Realm name**: sdyn
- **Display name**: СДЗН
- **Registration**: Идэвхтэй
- **Reset password**: Идэвхтэй
- **Remember me**: Идэвхтэй

## Clients

### sdyn-web (Frontend)
| Тохиргоо | Утга |
|----------|------|
| Client ID | sdyn-web |
| Client Protocol | openid-connect |
| Access Type | public |
| Standard Flow | Enabled |
| Direct Access Grants | Enabled |
| Valid Redirect URIs | https://e-sdy.mn/* |
| Web Origins | https://e-sdy.mn |

### sdyn-admin (Admin Portal)
| Тохиргоо | Утга |
|----------|------|
| Client ID | sdyn-admin |
| Client Protocol | openid-connect |
| Access Type | public |
| Standard Flow | Enabled |
| Direct Access Grants | Enabled |
| Valid Redirect URIs | https://admin.e-sdy.mn/* |
| Web Origins | https://admin.e-sdy.mn |

### sdyn-api (Backend)
| Тохиргоо | Утга |
|----------|------|
| Client ID | sdyn-api |
| Client Protocol | openid-connect |
| Access Type | confidential |
| Service Accounts | Enabled |
| Direct Access Grants | Enabled |
| Valid Redirect URIs | https://api.e-sdy.mn/* |

## Roles

### Realm Roles
| Role | Тайлбар |
|------|---------|
| national_admin | Үндэсний түвшний админ - бүх эрхтэй |
| province_admin | Аймгийн түвшний админ |
| district_admin | Дүүргийн түвшний админ |
| member | Энгийн гишүүн (default) |

### Role Mapping хийх
1. Users > хэрэглэгч сонгох
2. Role Mappings таб
3. Available Roles-оос role сонгох
4. Add selected дарах

## Google Identity Provider

### Шаардлага
- Google Cloud Console-оос OAuth 2.0 credentials

### Тохиргоо

1. **Identity Providers** руу орох
2. **Add provider** > **Google** сонгох
3. Дараах мэдээлэл оруулах:

| Field | Value |
|-------|-------|
| Alias | google |
| Display Name | Google |
| Client ID | `<GOOGLE_CLIENT_ID>` |
| Client Secret | `<GOOGLE_CLIENT_SECRET>` |
| Default Scopes | openid email profile |
| Sync Mode | import |
| Trust Email | On |
| First Login Flow | first broker login |

### Google Cloud Console тохиргоо

1. https://console.cloud.google.com/ руу орох
2. Project сонгох эсвэл шинээр үүсгэх
3. **APIs & Services** > **Credentials**
4. **Create Credentials** > **OAuth client ID**
5. **Application type**: Web application
6. **Authorized redirect URIs** нэмэх:
   ```
   https://auth.e-sdy.mn/realms/sdyn/broker/google/endpoint
   ```
7. **Create** дарах
8. Client ID, Client Secret хуулах

## Facebook Identity Provider

### Тохиргоо

1. **Identity Providers** > **Add provider** > **Facebook**
2. Мэдээлэл оруулах:

| Field | Value |
|-------|-------|
| Alias | facebook |
| Display Name | Facebook |
| Client ID | `<FACEBOOK_APP_ID>` |
| Client Secret | `<FACEBOOK_APP_SECRET>` |
| Default Scopes | email public_profile |

### Facebook Developer тохиргоо

1. https://developers.facebook.com/ руу орох
2. App үүсгэх
3. **Facebook Login** нэмэх
4. **Valid OAuth Redirect URIs**:
   ```
   https://auth.e-sdy.mn/realms/sdyn/broker/facebook/endpoint
   ```

## User Federation

### LDAP холболт (хэрэв хэрэгтэй бол)

1. **User Federation** > **Add provider** > **ldap**
2. Тохиргоо:
   - Connection URL: ldap://ldap.example.com
   - Users DN: ou=users,dc=example,dc=com
   - Bind DN: cn=admin,dc=example,dc=com
   - Bind Credential: password

## Email тохиргоо

### SMTP Server

1. **Realm Settings** > **Email**
2. Тохиргоо:

| Field | Value |
|-------|-------|
| Host | smtp.example.com |
| Port | 587 |
| From | noreply@e-sdy.mn |
| From Display Name | СДЗН |
| Enable SSL | Off |
| Enable StartTLS | On |
| Authentication | On |
| Username | smtp_user |
| Password | smtp_password |

### Email Templates

1. **Realm Settings** > **Themes**
2. **Email Theme**: keycloak (эсвэл custom)

Custom template-ийн хувьд:
```
/opt/keycloak/themes/sdyn/email/html/
  - email-verification.ftl
  - password-reset.ftl
  - etc.
```

## Login Theme

### Custom Theme суулгах

1. Theme файлуудыг бэлтгэх:
```
/opt/keycloak/themes/sdyn/
├── login/
│   ├── theme.properties
│   ├── resources/
│   │   ├── css/
│   │   └── img/
│   └── messages/
└── email/
```

2. Volume mount:
```yaml
keycloak:
  volumes:
    - ./keycloak/themes/sdyn:/opt/keycloak/themes/sdyn:ro
```

3. Realm Settings > Themes > Login Theme: sdyn

## Authentication Flow

### Browser Flow
1. **Authentication** > **Flows** > **browser**
2. Өөрчлөх боломжтой алхамууд:
   - Cookie
   - Identity Provider Redirector
   - Forms (Username/Password)
   - OTP

### 2FA (Two-Factor Authentication)

1. **Authentication** > **Required Actions**
2. **Configure OTP** идэвхжүүлэх
3. Default Action болгох

## Sessions

### Session тохиргоо

1. **Realm Settings** > **Sessions**

| Тохиргоо | Санал болгох утга |
|----------|-------------------|
| SSO Session Idle | 30 минут |
| SSO Session Max | 8 цаг |
| Client Session Idle | 30 минут |
| Client Session Max | 8 цаг |
| Offline Session Idle | 30 хоног |

## Token тохиргоо

1. **Realm Settings** > **Tokens**

| Тохиргоо | Санал болгох утга |
|----------|-------------------|
| Default Signature Algorithm | RS256 |
| Access Token Lifespan | 5 минут |
| Access Token Lifespan For Implicit Flow | 15 минут |
| Client Login Timeout | 5 минут |

## CLI Commands

### Хэрэглэгч үүсгэх
```bash
docker exec sdyn-keycloak /opt/keycloak/bin/kcadm.sh create users \
  -r sdyn \
  -s username=testuser \
  -s email=test@example.com \
  -s enabled=true \
  -s firstName=Test \
  -s lastName=User
```

### Нууц үг тохируулах
```bash
docker exec sdyn-keycloak /opt/keycloak/bin/kcadm.sh set-password \
  -r sdyn \
  --username testuser \
  --new-password password123
```

### Role өгөх
```bash
docker exec sdyn-keycloak /opt/keycloak/bin/kcadm.sh add-roles \
  -r sdyn \
  --uusername testuser \
  --rolename member
```

### Хэрэглэгчдийн жагсаалт
```bash
docker exec sdyn-keycloak /opt/keycloak/bin/kcadm.sh get users -r sdyn
```

## Troubleshooting

### Login ажиллахгүй байвал
```bash
# Keycloak log шалгах
docker compose logs keycloak | grep -i error

# Database холболт шалгах
docker exec sdyn-keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user admin \
  --password <password>
```

### Token invalid
- Access token хугацаа дууссан эсэх
- Realm зөв эсэх
- Client ID зөв эсэх

### Redirect URI error
- Valid Redirect URIs-д зөв URL байгаа эсэх
- Trailing slash шалгах

---
*Баримт бичгийн хувилбар: 1.0*
*Сүүлд шинэчилсэн: 2026-01-26*
