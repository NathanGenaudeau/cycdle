drop table if exists rider;

create table rider (
  id uuid primary key not null,
  name text not null,
  team text,
  age integer not null,
  nationality text not null,
  weight integer,
  height decimal,
  specialities json,
  win integer not null,
  gt_participation integer not null,
  classic_participation integer not null
);