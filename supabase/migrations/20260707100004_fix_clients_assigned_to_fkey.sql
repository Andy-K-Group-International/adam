ALTER TABLE public.clients DROP CONSTRAINT clients_assigned_to_fkey;
ALTER TABLE public.clients ADD CONSTRAINT clients_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;
