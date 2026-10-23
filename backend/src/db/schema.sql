-- ============================================================================
--  NISHA BOUTIQUE — NEON (PostgreSQL) SCHEMA
--  Run once:  npm run migrate      (or paste this file in Neon → SQL Editor)
--  Safe to run again: every statement uses IF NOT EXISTS.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ───────────────────────────── 1. USERS (customers + admin) ─────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  avatar        TEXT        NOT NULL DEFAULT '',
  is_verified   BOOLEAN     NOT NULL DEFAULT FALSE,
  is_blocked    BOOLEAN     NOT NULL DEFAULT FALSE,
  login_count   INTEGER     NOT NULL DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_uidx ON users(phone) WHERE phone IS NOT NULL AND phone <> '';

-- ───────────────────────────── 2. LOGIN TRACKING ────────────────────────────
CREATE TABLE IF NOT EXISTS login_history (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  login_type  TEXT        NOT NULL,             -- 'user' | 'admin' | 'register'
  success     BOOLEAN     NOT NULL,
  reason      TEXT,                              -- e.g. 'wrong password', 'otp verified'
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS login_history_user_idx ON login_history(user_id, created_at DESC);

-- ───────────────────────────── 3. OTP CODES ─────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_codes (
  id         BIGSERIAL PRIMARY KEY,
  email      TEXT        NOT NULL,
  purpose    TEXT        NOT NULL CHECK (purpose IN ('register','login')),
  code_hash  TEXT        NOT NULL,
  attempts   INTEGER     NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS otp_codes_lookup_idx ON otp_codes(email, purpose, created_at DESC);

-- ───────────────────────────── 4. ADDRESSES ─────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  pincode       TEXT NOT NULL,
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────── 5. CATEGORIES ────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────── 6. PRODUCTS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   TEXT NOT NULL UNIQUE,              -- e.g. NishaBoutiqueBlouse001
  name         TEXT NOT NULL,
  category     TEXT NOT NULL,
  min_price    NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_price    NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock        INTEGER NOT NULL DEFAULT 10,
  sold         INTEGER NOT NULL DEFAULT 0,
  badge        TEXT NOT NULL DEFAULT '',
  description  TEXT NOT NULL DEFAULT '',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  sizes        TEXT[] NOT NULL DEFAULT '{}',
  colors       TEXT[] NOT NULL DEFAULT '{}',
  images       TEXT[] NOT NULL DEFAULT '{}',
  tags         TEXT[] NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);

-- ───────────────────────────── 7. REVIEWS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  name        TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

-- ───────────────────────────── 8. WISHLIST ──────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
  user_id    UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- ───────────────────────────── 9. COUPONS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT NOT NULL UNIQUE,
  description      TEXT,
  discount_type    TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value   NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount     NUMERIC(10,2),
  usage_limit      INTEGER,
  used_count       INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  end_date         TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────── 10. BANNERS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  subtitle    TEXT,
  image       TEXT,
  link        TEXT,
  button_text TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────── 11. ORDERS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     TEXT NOT NULL UNIQUE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- shipping address snapshot
  ship_name        TEXT, ship_phone TEXT, ship_line1 TEXT, ship_line2 TEXT,
  ship_city        TEXT, ship_state TEXT, ship_pincode TEXT,
  -- payment
  payment_method   TEXT NOT NULL CHECK (payment_method IN ('cod','razorpay')),
  payment_status   TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  -- money
  items_price      NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_price   NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price      NUMERIC(10,2) NOT NULL DEFAULT 0,
  coupon_code      TEXT,
  -- tracking
  order_status     TEXT NOT NULL DEFAULT 'placed'
                   CHECK (order_status IN ('placed','confirmed','packed','shipped','out_for_delivery','delivered','cancelled')),
  tracking_number  TEXT,
  courier          TEXT,
  delivered_at     TIMESTAMPTZ,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS orders_user_idx   ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(order_status);

-- ───────────────────────────── 12. ORDER ITEMS ──────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           BIGSERIAL PRIMARY KEY,
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  product_code TEXT,
  name         TEXT NOT NULL,
  image        TEXT,
  price        NUMERIC(10,2) NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  size         TEXT,
  color        TEXT
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

-- ───────────────────────────── 13. ORDER TRACKING (timeline) ────────────────
CREATE TABLE IF NOT EXISTS order_tracking (
  id         BIGSERIAL PRIMARY KEY,
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status     TEXT NOT NULL,
  note       TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS order_tracking_order_idx ON order_tracking(order_id, created_at);

-- ───────────────────────────── 14. PAYMENTS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                   BIGSERIAL PRIMARY KEY,
  order_id             UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method               TEXT NOT NULL,                 -- 'cod' | 'razorpay'
  amount               NUMERIC(10,2) NOT NULL,
  status               TEXT NOT NULL DEFAULT 'pending',
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  razorpay_signature   TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at              TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS payments_order_idx ON payments(order_id);

-- ───────────────────────────── 15. TESTIMONIALS (Happy Customers) ───────────
CREATE TABLE IF NOT EXISTS testimonials (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  photo      TEXT,
  location   TEXT,
  rating     INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  message    TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────── 16. CONTACT MESSAGES ─────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
