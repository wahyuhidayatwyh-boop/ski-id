-- Migration: Add contact_phone column to events table
-- This allows admins to set a custom WhatsApp number for each event

-- Add the column to events table
ALTER TABLE events 
ADD COLUMN contact_phone TEXT;

-- Set default value for existing records (optional)
-- UPDATE events SET contact_phone = '628123456789' WHERE contact_phone IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN events.contact_phone IS 'Nomor WhatsApp narahubung untuk acara ini (format: 628xxxxxxxxxx)';