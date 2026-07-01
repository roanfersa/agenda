alter table professionals add column if not exists trial_ends_at timestamptz default (now() + interval '7 days');
update professionals set trial_ends_at = coalesce(criado_em, now()) + interval '7 days' where trial_ends_at is null;
