-- Migration: 20260414_add_ticket_purchaser_info
-- Add purchaserName and purchaserPhone columns to Ticket table

ALTER TABLE "Ticket"
  ADD COLUMN IF NOT EXISTS "purchaserName" TEXT;

ALTER TABLE "Ticket"
  ADD COLUMN IF NOT EXISTS "purchaserPhone" TEXT;
