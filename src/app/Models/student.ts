export interface Student {
  id: number;
  name: string;
  username: string;
  password: string;
  image: string; // Faqat image qoldi, avatar olib tashlandi
  level: string;
  months: {
    [key: string]: {
      davomat: number;
      uy_vazifa: number;
      tasks: number;
      jarima: number; // Yangi qo'shilgan maydon
    }
  };
}

export interface XpValues {
  davomat: number;
  uy_vazifa: number;
  tasks: number;
  jarima: number; // Yangi qo'shilgan maydon
}

export interface StudentData {
  students: Student[];
  xpValues: XpValues;
}

export interface RankingItem {
  student: Student;
  totalXP: number;
  rank: number;
  level: string;
}

export interface MonthlyData {
  monthKey: string;
  monthName: string;
  davomat: number;
  uy_vazifa: number;
  tasks: number;
  jarima: number; // Yangi qo'shilgan maydon
  totalXP: number;
}
