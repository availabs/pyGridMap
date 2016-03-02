select index, avg(value), count(1) from gph_500 where header_id in
(
select id from header_values where "refTime" in
(
SELECT event_time
  FROM public.tropical_cyclone_index
  where phase = 5 and amplitude > 1
  group by event_time,name,year,month,day
  order by year,month,day
)
)
group by index