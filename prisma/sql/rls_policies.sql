-- Row-Level Security policies for multi-user grocery list application.
-- Apply after running Prisma migrations.
--
-- These policies use the session variable app.current_user_id which is
-- set via SET LOCAL in each transaction by the application's withRLS helper.
-- Auth.js tables (users, accounts, sessions, verification_tokens) are NOT
-- covered by RLS because Auth.js manages its own scoping.

-- Enable RLS on domain tables
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_shares ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners (important if the app connects as the table owner)
ALTER TABLE grocery_lists FORCE ROW LEVEL SECURITY;
ALTER TABLE grocery_items FORCE ROW LEVEL SECURITY;
ALTER TABLE list_shares FORCE ROW LEVEL SECURITY;

-- ============================================================
-- grocery_lists policies
-- ============================================================

-- Owner has full access to their list
CREATE POLICY grocery_lists_owner ON grocery_lists
  USING (owner_id = current_setting('app.current_user_id', true));

-- Shared users can read lists shared with them
CREATE POLICY grocery_lists_shared_read ON grocery_lists
  FOR SELECT
  USING (id IN (
    SELECT list_id FROM list_shares
    WHERE user_id = current_setting('app.current_user_id', true)
  ));

-- ============================================================
-- grocery_items policies
-- ============================================================

-- Owner of the parent list has full access to items
CREATE POLICY grocery_items_owner ON grocery_items
  USING (list_id IN (
    SELECT id FROM grocery_lists
    WHERE owner_id = current_setting('app.current_user_id', true)
  ));

-- Shared users can read items on lists shared with them
CREATE POLICY grocery_items_shared_read ON grocery_items
  FOR SELECT
  USING (list_id IN (
    SELECT list_id FROM list_shares
    WHERE user_id = current_setting('app.current_user_id', true)
  ));

-- Shared users can update items (toggle purchase) on lists shared with them
CREATE POLICY grocery_items_shared_update ON grocery_items
  FOR UPDATE
  USING (list_id IN (
    SELECT list_id FROM list_shares
    WHERE user_id = current_setting('app.current_user_id', true)
  ));

-- ============================================================
-- list_shares policies
-- ============================================================

-- Owner of the list can manage (CRUD) all shares for their list
CREATE POLICY list_shares_owner ON list_shares
  USING (list_id IN (
    SELECT id FROM grocery_lists
    WHERE owner_id = current_setting('app.current_user_id', true)
  ));

-- Shared users can see their own share record
CREATE POLICY list_shares_self ON list_shares
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));
