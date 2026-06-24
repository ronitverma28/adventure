CREATE TABLE IF NOT EXISTS booking_travelers (
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

CREATE INDEX IF NOT EXISTS idx_booking_travelers_booking_id ON booking_travelers(booking_id);
