
drop policy if exists "registrations_public_insert" on public.registrations;

create policy "registrations_public_insert" on public.registrations
  for insert
  with check (
    char_length(full_name) between 1 and 120
    and char_length(email) between 5 and 255
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and ticket_type in ('standard','student','vip')
    and (company is null or char_length(company) <= 160)
    and (role is null or char_length(role) <= 120)
    and (dietary is null or char_length(dietary) <= 240)
    and (notes is null or char_length(notes) <= 1000)
  );
