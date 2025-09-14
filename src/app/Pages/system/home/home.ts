import { Component, OnInit } from '@angular/core';
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
}

@Component({
  selector: 'app-student-profile',
  standalone:false,
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {
  student: Student = (studentsData as any)[2]; // 3-id li student
  isDarkMode: boolean = false;
  
  levels: Level[] = [
    { name: 'Beginner', xp: 0 },
    { name: 'Novice', xp: 10 },
    { name: 'Junior', xp: 20 },
    { name: 'Intermediate', xp: 40 },
    { name: 'Adept', xp: 60 },
    { name: 'Senior', xp: 90 },
    { name: 'Advanced', xp: 120 },
    { name: 'Professional', xp: 160 },
    { name: 'Elite', xp: 200 },
    { name: 'Expert', xp: 250 },
    { name: 'Guru', xp: 300 },
    { name: 'Master', xp: 360 },
    { name: 'GrandMaster', xp: 430 },
    { name: 'Legend', xp: 500 }
  ];

  currentLevelIndex: number = 0;
  nextLevel: Level | null = null;
  progressPercentage: number = 0;

  months: string[] = [];
  selectedMonth: string = '';
  monthData: MonthData | null = null;

  totalScore: number = 0;
  attendanceScore: number = 0;
  homeworkScore: number = 0;
  tasksScore: number = 0;
  penaltyScore: number = 0;

  ngOnInit(): void {
    this.loadThemePreference();
    this.processStudentData();
    this.calculateScores();
  }

  private loadThemePreference(): void {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.isDarkMode = savedTheme === 'dark';
      } else {
        this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch (error) {
      console.error('Error accessing localStorage for theme:', error);
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }

  private processStudentData(): void {
    // Oylar ro'yxatini olish
    this.months = Object.keys(this.student.months).sort().reverse();
    this.selectedMonth = this.months[0] || '';
    this.monthData = this.student.months[this.selectedMonth] || null;

    // Darajani aniqlash
    const currentLevelName = this.student.level;
    this.currentLevelIndex = this.levels.findIndex(level => level.name === currentLevelName);
    
    if (this.currentLevelIndex < this.levels.length - 1) {
      this.nextLevel = this.levels[this.currentLevelIndex + 1];
    } else {
      this.nextLevel = null;
    }

    // Progress foizini hisoblash
    if (this.nextLevel) {
      const currentXP = this.levels[this.currentLevelIndex].xp;
      const nextXP = this.nextLevel.xp;
      const studentXP = this.calculateTotalXP();
      this.progressPercentage = Math.min(100, Math.max(0, (studentXP - currentXP) / (nextXP - currentXP) * 100));
    } else {
      this.progressPercentage = 100;
    }
  }

  private calculateTotalXP(): number {
    let totalXP = 0;
    
    for (const month of this.months) {
      const data = this.student.months[month];
      totalXP += data.davomat * 10; // Davomat - 10 bal
      totalXP += data.uy_vazifa * 10; // Uy ishi - 10 bal
      totalXP += data.tasks; // Tasks - 0 dan cheksiz
      totalXP -= data.jarima; // Jarima - minus
    }
    
    return totalXP;
  }

  private calculateScores(): void {
    if (!this.monthData) return;

    this.attendanceScore = this.monthData.davomat * 10;
    this.homeworkScore = this.monthData.uy_vazifa * 10;
    this.tasksScore = this.monthData.tasks;
    this.penaltyScore = this.monthData.jarima;
    
    this.totalScore = this.attendanceScore + this.homeworkScore + this.tasksScore - this.penaltyScore;
  }

  onMonthChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedMonth = target.value;
    this.monthData = this.student.months[this.selectedMonth];
    this.calculateScores();
  }
}