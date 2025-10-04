// profile.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import * as studentsData from '../../../students.json';

interface MonthData {
  davomat: number;
  uy_vazifa: number;
  tasks: number;
  jarima: number;
}

interface Student {
  id: number;
  name: string;
  username: string;
  password: string;
  image: string;
  level: string;
  months: {
    [key: string]: MonthData;
  };
}

interface Level {
  name: string;
  xp: number;
  image: string;
}

@Component({
  selector: 'app-profile',
  standalone:false,
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  student: Student | null = null;
  showLogoutButton = false;
  
  levels: Level[] = [
    { name: 'Yalqov', xp: -100, image: 'Yalqov.png' },
    { name: 'Maymuncha', xp: -1, image: 'Maymuncha.png' },
    { name: 'Beginner', xp: 0, image: 'Beginner.png' },
    { name: 'Novice', xp: 10, image: 'Novice.png' },
    { name: 'Junior', xp: 20, image: 'Junior.png' },
    { name: 'Intermediate', xp: 40, image: 'Intermediate.png' },
    { name: 'Adept', xp: 60, image: 'Adept.png' },
    { name: 'Senior', xp: 90, image: 'Senior.png' },
    { name: 'Advanced', xp: 120, image: 'Advanced.png' },
    { name: 'Professional', xp: 160, image: 'Professional.png' },
    { name: 'Elite', xp: 200, image: 'Elite.png' },
    { name: 'Expert', xp: 250, image: 'Expert.png' },
    { name: 'Guru', xp: 300, image: 'Guru.png' },
    { name: 'Master', xp: 360, image: 'Master.png' },
    { name: 'GrandMaster', xp: 430, image: 'Grandmaster.png' },
    { name: 'Legend 3', xp: 500, image: 'Legend3.png' },
    { name: 'Legend 2', xp: 750, image: 'Legend2.png' },
    { name: 'Legend 1', xp: 1000, image: 'Legend1.png' }

  ];

  // Oylik ma'lumotlar (darslar soni va uy vazifa berilgan darslar soni)
  monthDetails: { [key: string]: { totalLessons: number, homeworkLessons: number } } = {
    "2025-08": { totalLessons: 0, homeworkLessons: 0 },
    "2025-09": { totalLessons: 16, homeworkLessons: 7 },
    "2025-10": { totalLessons: 1, homeworkLessons: 0 }
  };

  currentMonth = '2025-09'; // Joriy oy

  ngOnInit() {
    this.loadStudentData();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Agar logout tugmasi ko'rinayotgan bo'lsa va boshqa joyga bossa, yopish
    if (this.showLogoutButton) {
      const target = event.target as HTMLElement;
      if (!target.closest('.logout-container') && !target.closest('.three-dots')) {
        this.showLogoutButton = false;
      }
    }
  }

  private loadStudentData() {
    try {
      const students: Student[] = (studentsData as any).default || studentsData;
      const studentId = localStorage.getItem('studentId') || '3';
      this.student = students.find(s => s.id === parseInt(studentId)) || null;
    } catch (error) {
      console.error('Error loading student data:', error);
      // Fallback ma'lumotlar
      this.student = {
        id: 3,
        name: "Ibrohimjon",
        username: "ibrohimjon",
        password: "12946",
        image: "https://avatars.mds.yandex.net/i?id=0e56150aa276e02771636e69480b729e006fdd8f-5221285-images-thumbs&n=13",
        level: "OK",
        months: {
          "2025-08": { davomat: 6, uy_vazifa: 0, tasks: 78, jarima: 78 },
          "2025-09": { davomat: 100, uy_vazifa: 35, tasks: 411, jarima: 458 }
        }
      };
    }
  }

  toggleLogout() {
    this.showLogoutButton = !this.showLogoutButton;
  }

  logout() {
    // LocalStoragedan ma'lumotlarni o'chirish
    localStorage.removeItem('currentStudent');
    localStorage.removeItem('studentId');
    
    // Login sahifasiga yo'naltirish
    window.location.href = '/login';
  }

  // XP asosida darajani aniqlash
  getCurrentLevel(): Level {
    const totalXP = this.calculateTotalXP();
    
    // Eng yuqori darajani topish
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (totalXP >= this.levels[i].xp) {
        return this.levels[i];
      }
    }
    
    return this.levels[0]; // Eng past daraja
  }

  getNextLevel(): Level | null {
    const currentLevel = this.getCurrentLevel();
    const currentIndex = this.levels.findIndex(level => level.name === currentLevel.name);
    
    if (currentIndex < this.levels.length - 1) {
      return this.levels[currentIndex + 1];
    }
    
    return null; // Oxirgi darajada
  }


  



  getMonths(): string[] {
    if (!this.student || !this.student.months) return [];
    return Object.keys(this.student.months);
  }

  // profile.component.ts - formatMonth funksiyasini qo'shing
  formatMonth(monthKey: string): string {
    // Month key format: "2025-M09"
    const [year, month] = monthKey.split('-');
    const monthNum = parseInt(month.replace('M', ''), 10);
    
    const monthNames = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
    ];
    
    return `${year} ${monthNames[monthNum - 1]}`;
  }

  getMonthData(monthKey: string): MonthData {
    if (!this.student || !this.student.months || !this.student.months[monthKey]) {
      return { davomat: 0, uy_vazifa: 0, tasks: 0, jarima: 0 };
    }
    return this.student.months[monthKey];
  }

  getTotalMonths(): number {
    return this.getMonths().length;
  }

  getTotalTasks(): number {
    if (!this.student || !this.student.months) return 0;
    
    let totalTasks = 0;
    for (const monthKey of Object.keys(this.student.months)) {
      const monthData = this.student.months[monthKey];
      totalTasks += monthData.tasks;
    }
    return totalTasks;
  }

// Umumiy davomat foizini hisoblash
getTotalAttendancePercentage(): number {
  if (!this.student || !this.student.months) return 0;
  
  let totalAttendedLessons = 0;
  let totalPossibleLessons = 0;
  
  for (const monthKey of Object.keys(this.student.months)) {
    const monthData = this.student.months[monthKey];
    const monthInfo = this.monthDetails[monthKey];
    
    if (monthInfo) {
      // Har 10 ball 1 darsga teng
      const attendedLessons = Math.floor(monthData.davomat / 10);
      totalAttendedLessons += Math.min(attendedLessons, monthInfo.totalLessons);
      totalPossibleLessons += monthInfo.totalLessons;
    }
  }
  
  if (totalPossibleLessons === 0) return 0;
  
  const percentage = (totalAttendedLessons / totalPossibleLessons) * 100;
  return Math.min(Math.round(percentage), 100);
}
// Umumiy uy vazifa foizini hisoblash
getTotalHomeworkPercentage(): number {
  if (!this.student || !this.student.months) return 0;
  
  let totalHomeworkScore = 0;
  let totalMaxHomeworkScore = 0;
  
  for (const monthKey of Object.keys(this.student.months)) {
    const monthData = this.student.months[monthKey];
    const monthInfo = this.monthDetails[monthKey];
    
    if (monthInfo) {
      totalHomeworkScore += monthData.uy_vazifa;
      // Har bir uy vazifasi 10 ballik
      totalMaxHomeworkScore += monthInfo.homeworkLessons * 10;
    }
  }
  
  if (totalMaxHomeworkScore === 0) return 0;
  
  const percentage = (totalHomeworkScore / totalMaxHomeworkScore) * 100;
  return Math.min(Math.round(percentage), 100);
}
// Umumiy uy vazifa o'rtacha bahosini hisoblash (10 ballik tizimda)
getAverageHomeworkScore(): number {
  if (!this.student || !this.student.months) return 0;
  
  let totalHomeworkScore = 0;
  let totalHomeworkCount = 0;
  
  for (const monthKey of Object.keys(this.student.months)) {
    const monthData = this.student.months[monthKey];
    const monthInfo = this.monthDetails[monthKey];
    
    if (monthInfo && monthInfo.homeworkLessons > 0) {
      // O'rtacha bahoni hisoblash
      const averageScore = monthData.uy_vazifa / monthInfo.homeworkLessons;
      totalHomeworkScore += averageScore;
      totalHomeworkCount++;
    }
  }
  
  if (totalHomeworkCount === 0) return 0;
  
  return Math.round((totalHomeworkScore / totalHomeworkCount) * 10) / 10; // 1 xona aniqlikda
}

// Reytingdagi o'rinni hisoblash (barcha o'quvchilar orasida)
getRankPosition(): number {
  try {
    const students: Student[] = (studentsData as any).default || studentsData;
    const studentId = localStorage.getItem('studentId') || '3';
    const currentStudentId = parseInt(studentId);
    
    // Barcha o'quvchilarning umumiy XP larini hisoblaymiz
    const studentsWithTotalXP = students.map(student => {
      let totalXP = 0;
      
      // Har bir o'quvchining barcha oylaridagi XP ni hisoblaymiz
      for (const monthKey of Object.keys(student.months)) {
        const monthData = student.months[monthKey];
        totalXP += monthData.davomat;
        totalXP += monthData.uy_vazifa;
        totalXP += monthData.tasks;
        totalXP -= monthData.jarima;
      }
      
      return {
        id: student.id,
        name: student.name,
        totalXP: totalXP
      };
    });
    
    // O'quvchilarni XP bo'yicha kamayish tartibida saralaymiz
    studentsWithTotalXP.sort((a, b) => b.totalXP - a.totalXP);
    
    // Joriy o'quvchining o'rnini topamiz
    const currentStudentIndex = studentsWithTotalXP.findIndex(student => student.id === currentStudentId);
    
    // Index 0-based, shuning uchun +1 qilamiz
    return currentStudentIndex !== -1 ? currentStudentIndex + 1 : studentsWithTotalXP.length + 1;
    
  } catch (error) {
    console.error('Error calculating rank position:', error);
    return 5; // Fallback qiymat
  }
}

  // Joriy oy uchun davomat ballini hisoblash
  getCurrentMonthAttendanceScore(): number {
    const monthData = this.getMonthData(this.currentMonth);
    const monthInfo = this.monthDetails[this.currentMonth];
    
    if (!monthInfo || monthInfo.totalLessons === 0) return 0;
    
    const attendancePercentage = (monthData.davomat / monthInfo.totalLessons) * 100;
    return Math.min(10, Math.round(attendancePercentage / 10));
  }

  // Joriy oy uchun uy vazifa ballini hisoblash
  getCurrentMonthHomeworkScore(): number {
    const monthData = this.getMonthData(this.currentMonth);
    const monthInfo = this.monthDetails[this.currentMonth];
    
    if (!monthInfo || monthInfo.homeworkLessons === 0) return 0;
    
    return Math.min(10, Math.round(monthData.uy_vazifa));
  }

  // Joriy oy uchun davomat XP sini hisoblash
  getCurrentMonthAttendanceXP(): number {
    const monthData = this.getMonthData(this.currentMonth);
    return monthData.davomat; // Davomat ballari = XP
  }

    // Joriy oy uchun qatnashgan darslar sonini hisoblash
  getCurrentMonthAttendedLessons(): number {
    const monthData = this.getMonthData(this.currentMonth);
    return Math.floor(monthData.davomat / 10); // Har 10 ball 1 darsga teng
  }

  // Joriy oy uchun davomat foizini hisoblash
  getCurrentMonthAttendancePercentage(): number {
    const attendedLessons = this.getCurrentMonthAttendedLessons();
    const monthInfo = this.monthDetails[this.currentMonth];
    
    if (!monthInfo || monthInfo.totalLessons === 0) return 0;
    
    const percentage = (attendedLessons / monthInfo.totalLessons) * 100;
    return Math.min(Math.round(percentage), 100); // Maksimum 100%
  }

  // Joriy oy uchun uy vazifa XP sini hisoblash (o'zgarishsiz)
  getCurrentMonthHomeworkXP(): number {
    const monthData = this.getMonthData(this.currentMonth);
    return monthData.uy_vazifa; // Uy vazifa ballari = XP
  }

  // Joriy oy uchun uy vazifa foizini to'g'ri hisoblash
  getCurrentMonthHomeworkPercentage(): number {
    const monthData = this.getMonthData(this.currentMonth);
    const monthInfo = this.monthDetails[this.currentMonth];
    
    if (!monthInfo || monthInfo.homeworkLessons === 0) return 0;
    
    // Maksimal ball = darslar soni * 10 (har bir uy vazifasi 10 ballik)
    const maxPossibleScore = monthInfo.homeworkLessons * 10;
    
    // Foizni hisoblash
    const percentage = (monthData.uy_vazifa / maxPossibleScore) * 100;
    return Math.min(Math.round(percentage), 100); // Maksimum 100%
  }

  // Joriy oydagi XP ni hisoblash (soddalashtirilgan)
  calculateCurrentMonthXP(): number {
    const monthData = this.getMonthData(this.currentMonth);
    const attendanceXP = this.getCurrentMonthAttendanceXP();
    const homeworkXP = this.getCurrentMonthHomeworkXP();
    const tasksXP = monthData.tasks;
    const penaltyDeduction = monthData.jarima;
    
    return attendanceXP + homeworkXP + tasksXP - penaltyDeduction;
  }

  // Joriy oy uchun darajani aniqlash
  getCurrentMonthLevel(): Level {
    const monthXP = this.calculateCurrentMonthXP();
    
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (monthXP >= this.levels[i].xp) {
        return this.levels[i];
      }
    }
    
    return this.levels[0];
  }

// Umumiy XP ni hisoblash (soddalashtirilgan versiya)
calculateTotalXP(): number {
  if (!this.student || !this.student.months) return 0;
  
  let totalXP = 0;
  
  for (const monthKey of Object.keys(this.student.months)) {
    const monthData = this.student.months[monthKey];
    
    // Barcha ballarni qo'shamiz
    totalXP += monthData.davomat;    // Davomat ballari
    totalXP += monthData.uy_vazifa;  // Uy vazifa ballari  
    totalXP += monthData.tasks;      // Topshiriq ballari
    totalXP -= monthData.jarima;     // Jarimani ayiramiz
  }
  
  return totalXP;
}

  // Umumiy davomat XP sini hisoblash
  getAttendanceXP(): number {
    if (!this.student || !this.student.months) return 0;
    
    let totalXP = 0;
    for (const monthKey of Object.keys(this.student.months)) {
      const monthData = this.student.months[monthKey];
      totalXP += monthData.davomat;
    }
    return totalXP;
  }

  // Umumiy uy vazifa XP sini hisoblash
  getHomeworkXP(): number {
    if (!this.student || !this.student.months) return 0;
    
    let totalXP = 0;
    for (const monthKey of Object.keys(this.student.months)) {
      const monthData = this.student.months[monthKey];
      totalXP += monthData.uy_vazifa;
    }
    return totalXP;
  }

  // Umumiy uy vazifa bahosini hisoblash
  getHomeworkScore(): number {
    if (!this.student || !this.student.months) return 0;
    
    const months = Object.values(this.student.months);
    if (months.length === 0) return 0;
    
    const totalHomework = months.reduce((sum, month) => sum + (month.uy_vazifa || 0), 0);
    const averageHomework = totalHomework / months.length;
    return Math.min(10, Math.round(averageHomework));
  }

  getTotalPenalty(): number {
    if (!this.student || !this.student.months) return 0;
    return Object.values(this.student.months).reduce((sum, month) => sum + (month.jarima || 0), 0);
  }

  calculateMonthTotal(monthKey: string): number {
    const monthData = this.getMonthData(monthKey);
    return monthData.davomat + monthData.uy_vazifa + monthData.tasks - monthData.jarima;
  }

  getLevelProgress(): number {
    const totalXP = this.calculateTotalXP();
    const currentLevel = this.getCurrentLevel();
    const nextLevel = this.getNextLevel();
    
    if (!nextLevel) return 100;
    
    const xpInCurrentLevel = totalXP - currentLevel.xp;
    const xpNeeded = nextLevel.xp - currentLevel.xp;
    
    return Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100));
  }

  getXPToNextLevel(): number {
    const totalXP = this.calculateTotalXP();
    const nextLevel = this.getNextLevel();
    
    if (!nextLevel) return 0;
    
    return Math.max(0, nextLevel.xp - totalXP);
  }

  getNextLevelXP(): number {
    const nextLevel = this.getNextLevel();
    return nextLevel ? nextLevel.xp : this.getCurrentLevel().xp;
  }

  getCurrentLevelXP(): number {
    return this.getCurrentLevel().xp;
  }


// Berilgan oy uchun darajani aniqlash
getMonthLevel(monthKey: string): Level {
  const monthXP = this.calculateMonthTotal(monthKey);
  
  // Eng yuqori darajani topish
  for (let i = this.levels.length - 1; i >= 0; i--) {
    if (monthXP >= this.levels[i].xp) {
      return this.levels[i];
    }
  }
  
  return this.levels[0]; // Eng past daraja
}

// Berilgan oy uchun qatnashgan darslar sonini hisoblash
getMonthAttendedLessons(monthKey: string): number {
  const monthData = this.getMonthData(monthKey);
  return Math.floor(monthData.davomat / 10); // Har 10 ball 1 darsga teng
}

// Berilgan oy uchun jami darslar sonini olish
getMonthTotalLessons(monthKey: string): number {
  const monthInfo = this.monthDetails[monthKey];
  return monthInfo ? monthInfo.totalLessons : 0;
}

// Berilgan oy uchun davomat foizini hisoblash
getMonthAttendancePercentage(monthKey: string): number {
  const attendedLessons = this.getMonthAttendedLessons(monthKey);
  const totalLessons = this.getMonthTotalLessons(monthKey);
  
  if (totalLessons === 0) return 0;
  
  const percentage = (attendedLessons / totalLessons) * 100;
  return Math.min(Math.round(percentage), 100);
}

// Berilgan oy uchun maksimal uy vazifa ballini hisoblash
getMonthMaxHomeworkScore(monthKey: string): number {
  const monthInfo = this.monthDetails[monthKey];
  return monthInfo ? monthInfo.homeworkLessons * 10 : 0; // Har biri 10 ballik
}

// Berilgan oy uchun uy vazifa foizini hisoblash
getMonthHomeworkPercentage(monthKey: string): number {
  const monthData = this.getMonthData(monthKey);
  const maxScore = this.getMonthMaxHomeworkScore(monthKey);
  
  if (maxScore === 0) return 0;
  
  const percentage = (monthData.uy_vazifa / maxScore) * 100;
  return Math.min(Math.round(percentage), 100);
}
// profile.component.ts

// profile.component.ts
formatMonthDisplay(monthKey: string): string {
  const [year, month] = monthKey.split('M');
  const monthNames = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ];
  
  const monthIndex = parseInt(month, 10) - 1;
  if (monthIndex >= 0 && monthIndex < 12) {
    return `${monthNames[monthIndex]} ${year}`;
  }
  
  return monthKey;
}
// Berilgan oy uchun jami XP ni hisoblash
// calculateMonthTotal(monthKey: string): number {
//   const monthData = this.getMonthData(monthKey);
//   return monthData.davomat + monthData.uy_vazifa + monthData.tasks - monthData.jarima;
// }
}

