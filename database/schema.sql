-- ============================================================
-- ADVENTURE PLATFORM - COMPLETE DATABASE SCHEMA
-- PostgreSQL 15+
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE difficulty_level AS ENUM ('EASY', 'MODERATE', 'DIFFICULT', 'EXTREME');
CREATE TYPE trek_status AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'SOLD_OUT', 'CANCELLED');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE payment_gateway AS ENUM ('RAZORPAY', 'STRIPE');
CREATE TYPE payment_method AS ENUM ('CARD', 'UPI', 'NET_BANKING', 'WALLET', 'EMI');
CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FLAT');
CREATE TYPE notification_type AS ENUM (
  'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PAYMENT_SUCCESS',
  'PAYMENT_FAILED', 'TREK_REMINDER', 'REVIEW_REQUEST',
  'COUPON_OFFER', 'SYSTEM_ALERT'
);


-- ============================================================
-- ROLES
-- ============================================================

CREATE TABLE roles (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE,  -- ROLE_ADMIN, ROLE_USER, ROLE_GUIDE
  description VARCHAR(255),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES
  ('ROLE_ADMIN', 'Platform administrator with full access'),
  ('ROLE_USER',  'Registered trekker/customer'),
  ('ROLE_GUIDE', 'Certified trek guide');

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id              BIGSERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  avatar_url      VARCHAR(500),
  date_of_birth   DATE,
  gender          VARCHAR(10),
  address         TEXT,
  city            VARCHAR(100),
  state           VARCHAR(100),
  country         VARCHAR(100) DEFAULT 'India',
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  email_verified  BOOLEAN DEFAULT FALSE,
  phone_verified  BOOLEAN DEFAULT FALSE,
  last_login_at   TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- ============================================================
-- USER_ROLES (Join Table)
-- ============================================================

CREATE TABLE user_roles (
  user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id   BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- ============================================================
-- GUIDES
-- ============================================================

CREATE TABLE guides (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
  name            VARCHAR(100) NOT NULL,
  bio             TEXT,
  photo_url       VARCHAR(500),
  phone           VARCHAR(20),
  email           VARCHAR(150),
  experience_years INT DEFAULT 0,
  languages       TEXT[],                    -- Array of languages spoken
  certifications  TEXT[],                    -- Array of certifications
  specializations TEXT[],                    -- e.g. {"High Altitude", "Rock Climbing"}
  avg_rating      DECIMAL(3,2) DEFAULT 0.00,
  total_treks     INT DEFAULT 0,
  is_available    BOOLEAN DEFAULT TRUE,
  is_verified     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TREKS
-- ============================================================

CREATE TABLE treks (
  id                  BIGSERIAL PRIMARY KEY,
  title               VARCHAR(200) NOT NULL,
  slug                VARCHAR(220) NOT NULL UNIQUE,
  short_description   VARCHAR(500) NOT NULL,
  description         TEXT NOT NULL,
  highlights          TEXT[],                -- Key highlights array
  inclusions          TEXT[],                -- What's included
  exclusions          TEXT[],                -- What's not included
  things_to_carry     TEXT[],
  location            VARCHAR(200) NOT NULL,
  state               VARCHAR(100) NOT NULL,
  region              VARCHAR(100),
  latitude            DECIMAL(10,8),
  longitude           DECIMAL(11,8),
  altitude_max        INT,                   -- in meters
  altitude_base       INT,                   -- in meters
  duration_days       INT NOT NULL,
  duration_nights     INT NOT NULL,
  difficulty          difficulty_level NOT NULL,
  price_per_person    DECIMAL(10,2) NOT NULL,
  price_child         DECIMAL(10,2),
  group_size_min      INT DEFAULT 1,
  group_size_max      INT DEFAULT 20,
  start_date          DATE,
  end_date            DATE,
  meeting_point       VARCHAR(300),
  nearest_airport     VARCHAR(200),
  nearest_railway     VARCHAR(200),
  status              trek_status DEFAULT 'DRAFT',
  is_featured         BOOLEAN DEFAULT FALSE,
  is_bestseller       BOOLEAN DEFAULT FALSE,
  avg_rating          DECIMAL(3,2) DEFAULT 0.00,
  total_reviews       INT DEFAULT 0,
  total_bookings      INT DEFAULT 0,
  cover_image_url     VARCHAR(500),
  meta_title          VARCHAR(200),
  meta_description    VARCHAR(500),
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_treks_slug ON treks(slug);
CREATE INDEX idx_treks_status ON treks(status);
CREATE INDEX idx_treks_difficulty ON treks(difficulty);
CREATE INDEX idx_treks_state ON treks(state);
CREATE INDEX idx_treks_featured ON treks(is_featured);
CREATE INDEX idx_treks_search ON treks USING gin(to_tsvector('english', title || ' ' || location || ' ' || state));

-- ============================================================
-- TREK_GUIDES (Join Table)
-- ============================================================

CREATE TABLE trek_guides (
  trek_id    BIGINT NOT NULL REFERENCES treks(id) ON DELETE CASCADE,
  guide_id   BIGINT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  is_lead    BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (trek_id, guide_id)
);

-- ============================================================
-- TREK IMAGES
-- ============================================================

CREATE TABLE trek_images (
  id              BIGSERIAL PRIMARY KEY,
  trek_id         BIGINT NOT NULL REFERENCES treks(id) ON DELETE CASCADE,
  image_url       VARCHAR(500) NOT NULL,
  public_id       VARCHAR(300),              -- Cloudinary public ID
  alt_text        VARCHAR(200),
  caption         VARCHAR(300),
  is_cover        BOOLEAN DEFAULT FALSE,
  display_order   INT DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trek_images_trek_id ON trek_images(trek_id);

-- ============================================================
-- ITINERARY
-- ============================================================

CREATE TABLE itinerary (
  id                BIGSERIAL PRIMARY KEY,
  trek_id           BIGINT NOT NULL REFERENCES treks(id) ON DELETE CASCADE,
  day_number        INT NOT NULL,
  title             VARCHAR(200) NOT NULL,
  description       TEXT NOT NULL,
  distance_km       DECIMAL(6,2),
  elevation_gain    INT,                     -- in meters
  elevation_loss    INT,                     -- in meters
  max_altitude      INT,                     -- in meters
  accommodation     VARCHAR(200),
  meals_included    TEXT[],                  -- {"Breakfast", "Lunch", "Dinner"}
  difficulty_day    difficulty_level,
  tips              TEXT,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trek_id, day_number)
);

CREATE INDEX idx_itinerary_trek_id ON itinerary(trek_id);

-- ============================================================
-- COUPONS
-- ============================================================

CREATE TABLE coupons (
  id              BIGSERIAL PRIMARY KEY,
  code            VARCHAR(50) NOT NULL UNIQUE,
  description     VARCHAR(300),
  discount_type   discount_type NOT NULL,
  discount_value  DECIMAL(10,2) NOT NULL,
  min_amount      DECIMAL(10,2) DEFAULT 0,
  max_discount    DECIMAL(10,2),             -- Cap for percentage discounts
  usage_limit     INT,                       -- NULL = unlimited
  used_count      INT DEFAULT 0,
  per_user_limit  INT DEFAULT 1,
  valid_from      TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until     TIMESTAMP WITH TIME ZONE NOT NULL,
  applicable_trek BIGINT REFERENCES treks(id) ON DELETE SET NULL, -- NULL = all treks
  is_active       BOOLEAN DEFAULT TRUE,
  created_by      BIGINT REFERENCES users(id),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active, valid_until);

-- ============================================================
-- BOOKINGS
-- ============================================================

CREATE TABLE bookings (
  id                  BIGSERIAL PRIMARY KEY,
  booking_ref         VARCHAR(20) NOT NULL UNIQUE, -- e.g. ADV-2024-00001
  trek_id             BIGINT NOT NULL REFERENCES treks(id),
  user_id             BIGINT NOT NULL REFERENCES users(id),
  coupon_id           BIGINT REFERENCES coupons(id),
  num_adults          INT NOT NULL DEFAULT 1,
  num_children        INT DEFAULT 0,
  trek_date           DATE NOT NULL,
  base_amount         DECIMAL(10,2) NOT NULL,
  discount_amount     DECIMAL(10,2) DEFAULT 0,
  tax_amount          DECIMAL(10,2) DEFAULT 0,
  final_amount        DECIMAL(10,2) NOT NULL,
  status              booking_status DEFAULT 'PENDING',
  emergency_contact   VARCHAR(100),
  emergency_phone     VARCHAR(20),
  special_requests    TEXT,
  medical_conditions  TEXT,
  pickup_location     VARCHAR(300),
  notes               TEXT,                  -- Admin notes
  cancelled_at        TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_trek_id ON bookings(trek_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_ref ON bookings(booking_ref);
CREATE INDEX idx_bookings_trek_date ON bookings(trek_date);

-- ============================================================
-- BOOKING TRAVELERS
-- ============================================================

CREATE TABLE booking_travelers (
  id                  BIGSERIAL PRIMARY KEY,
  booking_id          BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  name                VARCHAR(120) NOT NULL,
  age                 INT NOT NULL,
  gender              VARCHAR(20) NOT NULL,
  id_type             VARCHAR(40) NOT NULL,
  id_number           VARCHAR(80) NOT NULL,
  medical_conditions  TEXT,
  is_leader           BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_booking_travelers_booking_id ON booking_travelers(booking_id);

-- Booking reference sequence function
CREATE SEQUENCE booking_seq START 1;
CREATE OR REPLACE FUNCTION generate_booking_ref()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_ref := 'ADV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('booking_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_ref
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_ref IS NULL OR NEW.booking_ref = '')
  EXECUTE FUNCTION generate_booking_ref();

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
  id                  BIGSERIAL PRIMARY KEY,
  booking_id          BIGINT NOT NULL REFERENCES bookings(id),
  user_id             BIGINT NOT NULL REFERENCES users(id),
  amount              DECIMAL(10,2) NOT NULL,
  currency            VARCHAR(10) DEFAULT 'INR',
  gateway             payment_gateway NOT NULL,
  gateway_order_id    VARCHAR(200),          -- Razorpay order_id / Stripe PaymentIntent id
  gateway_payment_id  VARCHAR(200),          -- Razorpay payment_id
  gateway_signature   VARCHAR(500),          -- Razorpay signature
  status              payment_status DEFAULT 'PENDING',
  method              payment_method,
  paid_at             TIMESTAMP WITH TIME ZONE,
  refund_amount       DECIMAL(10,2),
  refund_id           VARCHAR(200),
  refunded_at         TIMESTAMP WITH TIME ZONE,
  failure_reason      VARCHAR(500),
  metadata            JSONB,                 -- Extra gateway data
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_gateway_order ON payments(gateway_order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE reviews (
  id              BIGSERIAL PRIMARY KEY,
  trek_id         BIGINT NOT NULL REFERENCES treks(id) ON DELETE CASCADE,
  user_id         BIGINT NOT NULL REFERENCES users(id),
  booking_id      BIGINT REFERENCES bookings(id),
  rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title           VARCHAR(200),
  body            TEXT NOT NULL,
  photos          TEXT[],                    -- Array of image URLs
  is_verified     BOOLEAN DEFAULT FALSE,     -- Verified purchase
  is_approved     BOOLEAN DEFAULT FALSE,     -- Admin approved
  helpful_count   INT DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id, user_id)               -- One review per booking
);

CREATE INDEX idx_reviews_trek_id ON reviews(trek_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);

-- ============================================================
-- WISHLIST
-- ============================================================

CREATE TABLE wishlist (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trek_id     BIGINT NOT NULL REFERENCES treks(id) ON DELETE CASCADE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, trek_id)
);

CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       VARCHAR(200) NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  action_url  VARCHAR(500),
  metadata    JSONB,                         -- Extra data (booking_id, trek_id, etc.)
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_treks_updated_at BEFORE UPDATE ON treks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_guides_updated_at BEFORE UPDATE ON guides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
