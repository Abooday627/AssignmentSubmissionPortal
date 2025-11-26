# دليل البدء السريع - Quick Start Guide

## تشغيل المشروع في 5 خطوات

### 1️⃣ تثبيت المكتبات
```bash
pnpm install
```

### 2️⃣ إعداد قاعدة البيانات
```bash
# تشغيل MySQL
sudo systemctl start mysql

# إنشاء قاعدة البيانات
mysql -u root -p << EOF
CREATE DATABASE assignment_portal;
CREATE USER 'portal_user'@'localhost' IDENTIFIED BY 'NewPortalPass2025';
GRANT ALL PRIVILEGES ON assignment_portal.* TO 'portal_user'@'localhost';
FLUSH PRIVILEGES;
EOF
```

### 3️⃣ إعداد ملف .env
```bash
# تأكد من وجود ملف .env في المجلد الرئيسي
# وتعديل OWNER_OPEN_ID ليطابق Open ID الخاص بك
```

### 4️⃣ تطبيق مخطط قاعدة البيانات
```bash
pnpm db:push
```

### 5️⃣ تشغيل المشروع
```bash
# للتطوير
pnpm dev

# أو للإنتاج
pnpm build
pnpm start
```

## الوصول إلى المشروع

- **صفحة التقديم**: http://localhost:3000/
- **لوحة التحكم**: http://localhost:3000/admin

## إضافة أول جامعة

1. افتح http://localhost:3000/admin
2. سجل الدخول (تأكد من أنك Admin)
3. اضغط "Add University"
4. أدخل:
   - **Name**: اسم الجامعة
   - **Telegram Bot Token**: من @BotFather
   - **Telegram Chat ID**: رقم المحادثة/المجموعة

## إضافة تخصص

1. في لوحة التحكم، انتقل إلى تبويب "Specializations"
2. اضغط "Add Specialization"
3. اختر الجامعة وأدخل اسم التخصص

## الآن يمكن للطلاب تقديم الواجبات! 🎉

---

## الحصول على Telegram Bot Token

1. افتح [@BotFather](https://t.me/BotFather)
2. أرسل `/newbot`
3. اتبع التعليمات
4. احفظ الـ Token

## الحصول على Chat ID

### للمحادثة الخاصة:
1. افتح [@userinfobot](https://t.me/userinfobot)
2. احفظ الـ ID

### للمجموعة:
1. أضف البوت للمجموعة
2. أرسل رسالة
3. افتح: `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. ابحث عن `"chat":{"id":-1001234567890}`

---

## أوامر مفيدة

```bash
# تطوير
pnpm dev              # تشغيل في وضع التطوير
pnpm build            # بناء المشروع
pnpm start            # تشغيل الإنتاج
pnpm check            # فحص TypeScript
pnpm format           # تنسيق الكود
pnpm test             # تشغيل الاختبارات
pnpm db:push          # تحديث قاعدة البيانات
```

## مشاكل شائعة وحلولها

### ❌ Cannot connect to database
```bash
# تحقق من تشغيل MySQL
sudo systemctl status mysql
sudo systemctl start mysql
```

### ❌ Access denied to /admin
- تأكد من تسجيل الدخول
- تحقق من `OWNER_OPEN_ID` في `.env`

### ❌ Telegram notifications not working
- تحقق من Bot Token
- تأكد من إضافة البوت للمجموعة
- تحقق من Chat ID

---

**للمزيد من التفاصيل، راجع README_AR.md**
