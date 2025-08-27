import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  months: { [key: string]: MonthData };
}

interface RankingItem {
  student: Student;
  totalXP: number;
  rank: number;
  level: string;
}

@Component({
  selector: 'app-rating',
  standalone: false,
  templateUrl: './rating.html',
  styleUrls: ['./rating.scss']
})
export class Rating implements OnInit {
  students: Student[] = (studentsData as any).default || studentsData;
  ranking: RankingItem[] = [];
  currentStudent: Student | null = null;
  selectedSort: string = 'total';
  selectedMonth: string | null = null;
  isDarkMode: boolean = false;
  isMobile: boolean = window.innerWidth <= 767;

  sortOptions = [
    { value: 'total', label: 'Umumiy' },
    { value: 'davomat', label: 'Davomat' },
    { value: 'uy_vazifa', label: 'Uy vazifa' },
    { value: 'tasks', label: 'Topshiriq' },
    { value: 'jarima', label: 'Jarima' }
  ];

  availableMonths: string[] = [];

  ngOnInit() {
    this.loadCurrentStudent();
    this.loadThemePreference();
    this.applyTheme();
    this.loadAvailableMonths();
    this.calculateRanking();
    this.updateMobileStatus();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (!localStorage.getItem('theme')) {
        this.loadThemePreference();
        this.applyTheme();
      }
    });

    window.addEventListener('resize', () => {
      this.updateMobileStatus();
    });

    setInterval(() => {
      this.checkThemeChange();
    }, 1000);
  }

  @HostListener('window:resize')
  onResize() {
    this.updateMobileStatus();
  }

  private updateMobileStatus() {
    this.isMobile = window.innerWidth <= 767;
  }

  getShortLabel(label: string): string {
    switch(label) {
      case 'Umumiy': return 'Umumiy';
      case 'Davomat': return 'Davomat';
      case 'Uy vazifa': return 'Uy vaz.';
      case 'Topshiriq': return 'Topsh.';
      case 'Jarima': return 'Jarima';
      default: return label;
    }
  }

  private loadCurrentStudent() {
    try {
      const studentData = localStorage.getItem('currentStudent');
      this.currentStudent = studentData ? JSON.parse(studentData) : this.students[0];
    } catch (error) {
      console.error('Error loading current student from localStorage:', error);
      this.currentStudent = this.students[0];
    }
  }

  private loadThemePreference() {
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

  private applyTheme() {
    try {
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }

  private checkThemeChange() {
    try {
      const savedTheme = localStorage.getItem('theme');
      const currentTheme = this.isDarkMode ? 'dark' : 'light';
      if (savedTheme && savedTheme !== currentTheme) {
        this.isDarkMode = savedTheme === 'dark';
        this.applyTheme();
      }
    } catch (error) {
      console.error('Error checking theme change:', error);
    }
  }

  private loadAvailableMonths() {
    const allMonths = new Set<string>();
    this.students.forEach(student => {
      Object.keys(student.months).forEach(month => allMonths.add(month));
    });
    this.availableMonths = Array.from(allMonths).sort();
  }

  private calculateRanking() {
    this.ranking = this.students.map(student => {
      let totalXP = 0;
      if (this.selectedMonth) {
        const monthData = student.months[this.selectedMonth];
        if (monthData) {
          totalXP = monthData.davomat + monthData.uy_vazifa + monthData.tasks - (monthData.jarima || 0);
        }
      } else {
        totalXP = Object.values(student.months).reduce((sum, month) => {
          return sum + (month.davomat + month.uy_vazifa + month.tasks - (month.jarima || 0));
        }, 0);
      }
      return {
        student,
        totalXP,
        rank: 0,
        level: student.level
      };
    });
    this.sortRanking();
  }

  private sortRanking() {
    this.ranking.sort((a, b) => {
      const aData = a.student.months;
      const bData = b.student.months;

      let aValue = 0;
      let bValue = 0;

      if (this.selectedMonth) {
        const aMonth = aData[this.selectedMonth];
        const bMonth = bData[this.selectedMonth];
        aValue = this.getMetricValue(aMonth, this.selectedSort);
        bValue = this.getMetricValue(bMonth, this.selectedSort);
      } else {
        aValue = this.getTotalMetric(aData, this.selectedSort);
        bValue = this.getTotalMetric(bData, this.selectedSort);
      }

      if (this.selectedSort === 'jarima') {
        return aValue - bValue;
      }
      return bValue - aValue;
    });

    this.ranking = this.ranking.map((item, index) => ({ ...item, rank: index + 1 }));
  }

  private getMetricValue(month: MonthData | undefined, type: string): number {
    if (!month) return 0;
    switch (type) {
      case 'davomat': return month.davomat;
      case 'uy_vazifa': return month.uy_vazifa;
      case 'tasks': return month.tasks;
      case 'jarima': return month.jarima || 0;
      case 'total': return month.davomat + month.uy_vazifa + month.tasks - (month.jarima || 0);
      default: return 0;
    }
  }

  private getTotalMetric(months: { [key: string]: MonthData }, type: string): number {
    return Object.values(months).reduce((sum, month) => {
      switch (type) {
        case 'davomat': return sum + month.davomat;
        case 'uy_vazifa': return sum + month.uy_vazifa;
        case 'tasks': return sum + month.tasks;
        case 'jarima': return sum + (month.jarima || 0);
        case 'total': return sum + (month.davomat + month.uy_vazifa + month.tasks - (month.jarima || 0));
        default: return sum;
      }
    }, 0);
  }

  onSortChange(sortType: string) {
    this.selectedSort = sortType;
    this.calculateRanking();
  }

  onMonthChange(event: Event) {
    this.selectedMonth = (event.target as HTMLSelectElement).value;
    this.calculateRanking();
  }

  resetMonth() {
    this.selectedMonth = null;
    this.calculateRanking();
  }

  getTotal(student: Student, type: string): number {
    if (this.selectedMonth) {
      const month = student.months[this.selectedMonth];
      return this.getMetricValue(month, type);
    } else {
      return this.getTotalMetric(student.months, type);
    }
  }
}