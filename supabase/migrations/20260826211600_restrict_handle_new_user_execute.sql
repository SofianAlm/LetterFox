-- handle_new_user() est une fonction SECURITY DEFINER : par défaut Postgres
-- accorde EXECUTE à PUBLIC, ce qui la rend appelable directement via
-- /rest/v1/rpc/handle_new_user avec la clé anon. Elle ne doit être déclenchée
-- que par le trigger on_auth_user_created, jamais appelée directement.
revoke execute on function public.handle_new_user() from public;
