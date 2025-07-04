drop table if exists riderTDF;

create table riderTDF (
  id uuid primary key not null,
  name text not null,
  photo text,
  nationality text not null,
  flag text,
  win integer not null,
  gt_participation integer not null,
  classic_participation integer not null,
  one_day_races decimal not null,
  general_classification decimal not null,
  time_trial decimal not null,
  sprint decimal not null,
  climber decimal not null,
  hills decimal not null,
  sum_specialities decimal not null,
  jersey enum('yellow', 'kom', 'green', 'white', 'combativity') not null,
  year_tdf integer not null,
  url text not null
);