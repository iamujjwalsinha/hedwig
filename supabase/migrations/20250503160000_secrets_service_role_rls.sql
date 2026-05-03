-- Let JWT role service_role pass RLS on public.secrets when using direct .insert() from the server.
-- Run after 20250503000000_secrets.sql (or paste in SQL editor if POST /api/secret hits RLS).
-- Requires SUPABASE_SERVICE_ROLE_KEY to be the real service_role secret—not the anon key.

DROP POLICY IF EXISTS secrets_service_role_all ON public.secrets;

CREATE POLICY secrets_service_role_all ON public.secrets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
