import { Jersey } from './Jersey';
import { RiderSpecialities } from './RiderSpecialities';

export interface RiderTDF extends RiderSpecialities {
  id: string;
  name: string;
  photo: string;
  nationality: string;
  flag: string;
  sum_specialities: number;
  win: number;
  gt_participation: number;
  classic_participation: number;
  jersey: Jersey;
  year_tdf: number;
  url: string;
};