-- This existing platform helper runs only as an event trigger, never as a public RPC.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
