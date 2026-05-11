-- Passwords: admin123, demo123, test12345 (shared for the three attendee seeds)
-- Events: none seeded — create and publish events from Admin → Operations after login.
-- If the events table is out of date vs. database/schema.sql, import schema + seed again or run rebuild_events_registration.sql.
INSERT INTO users (name, email, password, role) VALUES
(
  'Admin',
  'admin@test.com',
  '$2b$10$sBsBpSRrNNVhEHqMj9qk0uAnbF5a6El.XhGNZ7.YfqO03rJKuu7Ya',
  'admin'
),
(
  'Demo Patron',
  'demo@test.com',
  '$2b$10$SHOlCK9nTG/FTy5JhgXYMumH9qaKZeOM74Z6WiuBBMPtNeJDKWU0i',
  'attendee'
),
(
  'Alex Rivera',
  'alex@events.test',
  '$2b$10$LUm1lo8eIDIRpAMLkJXAC.hR0ndx0Q9NqmEZ/nXzOL/iTr1aZc9g2',
  'attendee'
),
(
  'Sam Okonkwo',
  'sam@events.test',
  '$2b$10$LUm1lo8eIDIRpAMLkJXAC.hR0ndx0Q9NqmEZ/nXzOL/iTr1aZc9g2',
  'attendee'
),
(
  'Jordan Lee',
  'jordan@events.test',
  '$2b$10$LUm1lo8eIDIRpAMLkJXAC.hR0ndx0Q9NqmEZ/nXzOL/iTr1aZc9g2',
  'attendee'
);
