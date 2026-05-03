-- Hedwig encrypted secrets (ciphertext only; key lives in URL fragment client-side).

CREATE TABLE IF NOT EXISTS public.secrets (
  id text PRIMARY KEY,
  ciphertext text NOT NULL,
  iv text NOT NULL,
  burn_on_read boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS secrets_expires_at_idx ON public.secrets (expires_at);

ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;

-- Atomic read (+ optional burn) under row lock so two concurrent callers cannot both receive a burn-after-read payload.
CREATE OR REPLACE FUNCTION public.fetch_secret(p_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.secrets%ROWTYPE;
BEGIN
  SELECT * INTO rec FROM public.secrets WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF rec.expires_at <= timezone('utc', now()) THEN
    DELETE FROM public.secrets WHERE id = p_id;
    RETURN NULL;
  END IF;

  IF rec.burn_on_read THEN
    DELETE FROM public.secrets WHERE id = p_id;
  END IF;

  RETURN jsonb_build_object(
    'ciphertext', rec.ciphertext,
    'iv', rec.iv,
    'burn_on_read', rec.burn_on_read
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fetch_secret(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fetch_secret(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.fetch_secret(text) TO postgres;
