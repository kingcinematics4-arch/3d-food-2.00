-- supabase/policies.sql
-- Row-Level Security (RLS) policies for Multi-Tenant Hotel Isolation and Public Ordering

-- ----------------------------------------------------
-- 1. HOTELS
-- ----------------------------------------------------
-- Allow authenticated users or service_role to create a hotel during onboarding
CREATE POLICY "hotel_insert" ON public.hotels
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow linked hotel owners/staff to view their hotel
CREATE POLICY "hotel_select" ON public.hotels
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.hotel_users hu WHERE hu.hotel_id = hotels.id AND hu.user_id = auth.uid())
    OR auth.role() = 'service_role'
    OR true -- Public guest menu lookup by slug
  );

-- Allow hotel owners/staff to update their hotel
CREATE POLICY "hotel_update" ON public.hotels
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.hotel_users hu WHERE hu.hotel_id = hotels.id AND hu.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.hotel_users hu WHERE hu.hotel_id = hotels.id AND hu.user_id = auth.uid())
  );

-- ----------------------------------------------------
-- 2. HOTEL_USERS (Link table)
-- ----------------------------------------------------
CREATE POLICY "hotel_users_select" ON public.hotel_users
  FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "hotel_users_insert" ON public.hotel_users
  FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "hotel_users_update" ON public.hotel_users
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------
-- 3. CATEGORIES & MENU_ITEMS (Public Guest Viewable & Hotel Admin Manageable)
-- ----------------------------------------------------
CREATE POLICY "categories_select" ON public.categories
  FOR SELECT USING (true); -- Public diners can view menu categories

CREATE POLICY "categories_manage" ON public.categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.hotel_users hu WHERE hu.hotel_id = categories.hotel_id AND hu.user_id = auth.uid())
  );

CREATE POLICY "menu_items_select" ON public.menu_items
  FOR SELECT USING (true); -- Public diners can view menu items

CREATE POLICY "menu_items_manage" ON public.menu_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.hotel_users hu WHERE hu.hotel_id = menu_items.hotel_id AND hu.user_id = auth.uid())
  );

-- ----------------------------------------------------
-- 4. ORDERS & ORDER_ITEMS (Public Diners Insert & Hotel Staff Manage)
-- ----------------------------------------------------
CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT WITH CHECK (true); -- Public diners can submit orders via QR code

CREATE POLICY "orders_select" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.hotel_users hu WHERE hu.hotel_id = orders.hotel_id AND hu.user_id = auth.uid())
    OR auth.role() = 'service_role'
    OR true -- Customer live order tracking
  );

CREATE POLICY "orders_update" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.hotel_users hu WHERE hu.hotel_id = orders.hotel_id AND hu.user_id = auth.uid())
  );

CREATE POLICY "order_items_insert" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "order_items_select" ON public.order_items
  FOR SELECT USING (true);

-- ----------------------------------------------------
-- 5. REVIEWS & QR_CODES
-- ----------------------------------------------------
CREATE POLICY "reviews_insert" ON public.reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "reviews_select" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "qr_codes_select" ON public.qr_codes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.hotel_users hu WHERE hu.hotel_id = qr_codes.hotel_id AND hu.user_id = auth.uid())
  );

CREATE POLICY "qr_codes_manage" ON public.qr_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.hotel_users hu WHERE hu.hotel_id = qr_codes.hotel_id AND hu.user_id = auth.uid())
  );
