import { TeamLevel } from './TeamLevel';
import { RiderSpecialities } from './RiderSpecialities';

export interface Rider extends RiderSpecialities {
  id: string;
  url: string;
  name: string;
  photo: string;
  team: string;
  teamLevel: TeamLevel;
  age: number;
  nationality: string;
  flag: string;
  weight: number;
  height: number;
  uciRank: number;
  sum_specialities: number;
  win: number;
  gt_participation: number;
  classic_participation: number;
};