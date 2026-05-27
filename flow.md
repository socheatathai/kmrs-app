Merchant Register
        ↓
Select Plan
(Free / Starter / Pro)
        ↓
Create Subscription
        ↓
Create Shop
        ↓
Create Categories
        ↓
Add Products
        ↓
Generate QR Code
        ↓
Public URL Generated
kmrs.app/brown
        ↓
Customer Scans QR
        ↓
Customer Views Digital Menu

┌────────────────────┐
│       User         │
│--------------------│
│ id                 │
│ name               │
│ email              │
│ password           │
│ role               │
└─────────┬──────────┘
          │
          │ 1 User
          │
          ▼
┌────────────────────┐
│   Subscription     │
│--------------------│
│ id                 │
│ userId             │
│ planId             │
│ status             │
│ startedAt          │
│ expiredAt          │
└─────────┬──────────┘
          │
          │ many subscriptions
          │
          ▼
┌────────────────────┐
│       Plan         │
│--------------------│
│ id                 │
│ name               │
│ price              │
│ maxShops           │
│ maxProducts        │
│ maxQrCodes         │
└────────────────────┘
┌────────────────────┐
│       User         │
└─────────┬──────────┘
          │ owns
          ▼
┌────────────────────┐
│       Shop         │
│--------------------│
│ id                 │
│ ownerId            │
│ name               │
│ slug               │
│ logoUrl            │
│ coverUrl           │
└─────────┬──────────┘
          │
          ├──────────────┐
          │              │
          ▼              ▼
┌────────────────┐  ┌────────────────┐
│    Category    │  │     QrCode     │
│----------------│  │----------------│
│ id             │  │ id             │
│ shopId         │  │ shopId         │
│ name           │  │ url            │
└───────┬────────┘  └────────────────┘
        │
        │ has many
        ▼
┌────────────────────┐
│      Product       │
│--------------------│
│ id                 │
│ shopId             │
│ categoryId         │
│ name               │
│ description        │
│ price              │
│ imageUrl           │
└────────────────────┘
