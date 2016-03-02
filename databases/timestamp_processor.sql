UPDATE public.tropical_cyclone_index
   SET 
   --event_time = date_trunc('hour',date '1858-11-17 00:00:00' + interval '1 day' * "time")
   event_time = to_timestamp(to_char(year, '9999') || '-' || to_char(month, '00') || '-' || to_char(day, '00') || ' 00:00:00', 'YYYY-MM-DD HH24:MI:SS')
   where event_time is null;