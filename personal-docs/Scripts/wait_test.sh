\t
select wait_event_type, wait_event from pg_stat_activity where pid != pg_backend_pid()
\watch 0.5