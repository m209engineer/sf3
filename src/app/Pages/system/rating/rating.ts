import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as studentsData from '../../../students.json';
import * as shopItemsData from '../../../shopitems.json';

interface MonthData {
  davomat: number;
  uy_vazifa: number;
  tasks: number;
  jarima: number;
}

interface StudentItem {
  itemId: number;
  purchaseDate: string;
  equipped: boolean;
}

interface Student {
  id: number;
  name: string;
  username: string;
  password: string;
  image: string;
  level: string;
  coins: number;
  convertedXP: number;
  excludedMonths: string[];
  months: { [key: string]: MonthData };
  inventory: StudentItem[];
}

interface RankingItem {
  student: Student;
  totalXP: number;
  rank: number;
  level: string;
}

interface ShopItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'badge' | 'theme' | 'special' | 'utility';
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  available: boolean;
}

@Component({
  selector: 'app-rating',
  standalone: false,
  templateUrl: './rating.html',
  styleUrls: ['./rating.scss']
})
export class Rating implements OnInit {
  students: Student[] = (studentsData as any).default || studentsData;
  shopItems: ShopItem[] = (shopItemsData as any).default || shopItemsData;
  ranking: RankingItem[] = [];
  currentStudent: Student | null = null;
  selectedSort: string = 'total';
  selectedMonth: string | null = null;
  isDarkMode: boolean = false;
  isMobile: boolean = window.innerWidth <= 767;

  // Animatsiya uchun o'zgaruvchilar
  showAnimation = false;
  animationStudent: Student | null = null;
  animationLevel: string = '';
  animationParticles: any[] = [];

  // Darajalar va ularning XP chegaralari
  levels = [
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
    { name: 'Grandmaster', xp: 430 },
    { name: 'Legend3', xp: 500 },
    { name: 'Legend2', xp: 750 },
    { name: 'Legend1', xp: 1000 }
  ];

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

  // O'quvchining voz kechgan oylarini olish
  private getExcludedMonths(student: Student): string[] {
    return student.excludedMonths || [];
  }

  // Voz kechilgan oylardagi jami XP ni hisoblash
  private getExcludedMonthsXP(student: Student): number {
    const excludedMonths = this.getExcludedMonths(student);
    let totalExcludedXP = 0;
    
    for (const monthKey of excludedMonths) {
      const monthData = student.months[monthKey];
      if (monthData) {
        totalExcludedXP += monthData.davomat + monthData.uy_vazifa + monthData.tasks - monthData.jarima;
      }
    }
    
    return totalExcludedXP;
  }

  // Hisobga olinadigan oylarni olish (excluded oylarsiz)
  private getIncludedMonths(student: Student): string[] {
    const allMonths = Object.keys(student.months);
    const excludedMonths = this.getExcludedMonths(student);
    
    return allMonths.filter(month => !excludedMonths.includes(month));
  }

  // ========== YANGILANGAN METHODLAR ==========

  private calculateRanking() {
    this.ranking = this.students.map(student => {
      let totalXP = 0;
      
      if (this.selectedMonth) {
        // Oy filterida - barcha ma'lumotlar to'liq
        const monthData = student.months[this.selectedMonth];
        if (monthData) {
          totalXP = monthData.davomat + monthData.uy_vazifa + monthData.tasks - (monthData.jarima || 0);
        }
      } else {
        // Umumiy filterda - voz kechilgan oylar chiqariladi
        const includedMonths = this.getIncludedMonths(student);
        totalXP = includedMonths.reduce((sum, monthKey) => {
          const monthData = student.months[monthKey];
          return sum + (monthData.davomat + monthData.uy_vazifa + monthData.tasks - (monthData.jarima || 0));
        }, 0);
      }
      
      const levelName = this.getLevelName(totalXP);
      
      return {
        student,
        totalXP,
        rank: 0,
        level: levelName
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
        aValue = this.getTotalMetric(a.student, this.selectedSort);
        bValue = this.getTotalMetric(b.student, this.selectedSort);
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

  private getTotalMetric(student: Student, type: string): number {
    // Agar umumiy filter bo'lsa, faqat hisobga olingan oylar
    if (!this.selectedMonth) {
      const includedMonths = this.getIncludedMonths(student);
      return includedMonths.reduce((sum, monthKey) => {
        const month = student.months[monthKey];
        return sum + this.getSingleMetricValue(month, type);
      }, 0);
    }
    
    // Oy filterida yoki boshqa holatlarda - barcha oylar
    return Object.values(student.months).reduce((sum, month) => {
      return sum + this.getSingleMetricValue(month, type);
    }, 0);
  }

  private getSingleMetricValue(month: MonthData, type: string): number {
    switch (type) {
      case 'davomat': return month.davomat;
      case 'uy_vazifa': return month.uy_vazifa;
      case 'tasks': return month.tasks;
      case 'jarima': return month.jarima || 0;
      case 'total': return month.davomat + month.uy_vazifa + month.tasks - (month.jarima || 0);
      default: return 0;
    }
  }

  // XP ga qarab daraja nomini topish
  getLevelName(xp: number): string {
    if (xp < 0) {
      if (xp > -100){
        return "Maymuncha";
      } else {
        return "Yalqov";
      }
    }
    
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (xp >= this.levels[i].xp) {
        return this.levels[i].name;
      }
    }
    
    return 'Beginner';
  }

  // Daraja logosini olish
  getLevelImage(levelName: string): string {
    return `/${levelName}.png`;
  }

  // Logoga double click bosilganda
  onLevelDoubleClick(student: Student, totalXP: number) {
    const levelName = this.getLevelName(totalXP);
    
    this.animationStudent = student;
    this.animationLevel = levelName;
    this.showAnimation = true;
    
    // Zarlar yaratish
    this.createParticles();
    
    // 3 soniyadan keyin animatsiyani yopish
    setTimeout(() => {
      this.showAnimation = false;
      this.animationStudent = null;
      this.animationParticles = [];
    }, 3000);
  }

  // Zarlar yaratish
  createParticles() {
    this.animationParticles = [];
    for (let i = 0; i < 50; i++) {
      this.animationParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 5,
        duration: Math.random() * 2 + 1,
        delay: Math.random() * 1
      });
    }
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

  // HTML uchun - har doim to'liq ma'lumot (voz kechilgan oyllar ham)
  getTotal(student: Student, type: string): number {
    if (this.selectedMonth) {
      const month = student.months[this.selectedMonth];
      return this.getMetricValue(month, type);
    } else {
      // Umumiy filterda ham ko'rinishda to'liq ma'lumot
      return this.getAllMonthsMetric(student.months, type);
    }
  }

  // Barcha oyllar uchun metrikani hisoblash (ko'rinish uchun)
  private getAllMonthsMetric(months: { [key: string]: MonthData }, type: string): number {
    return Object.values(months).reduce((sum, month) => {
      return sum + this.getSingleMetricValue(month, type);
    }, 0);
  }

  // ========== YANGI METHODLAR ==========

  // O'quvchining joriy XP sini olish
  getCurrentXP(student: Student): number {
    const includedMonths = this.getIncludedMonths(student);
    return includedMonths.reduce((sum, monthKey) => {
      const monthData = student.months[monthKey];
      return sum + (monthData.davomat + monthData.uy_vazifa + monthData.tasks - (monthData.jarima || 0));
    }, 0);
  }

  // Convert qilish mumkin bo'lgan XP ni hisoblash
  getConvertibleXP(student: Student): number {
    const currentXP = this.getCurrentXP(student);
    const legendThreshold = 1000;
    
    if (currentXP < legendThreshold) return 0;
    
    return currentXP - legendThreshold - student.convertedXP;
  }

  // Tanga olish uchun link generatsiya qilish
  generateConvertLink(student: Student, xpAmount: number): string {
    const baseUrl = 'https://t.me/your_bot';
    return `${baseUrl}?start=convert_${student.id}_${xpAmount}`;
  }

  // Sotib olish uchun link generatsiya qilish
  generatePurchaseLink(student: Student, itemId: number, quantity: number = 1): string {
    const baseUrl = 'https://t.me/your_bot';
    return `${baseUrl}?start=purchase_${student.id}_${itemId}_${quantity}`;
  }

  // Equip uchun link generatsiya qilish
  generateEquipLink(student: Student, itemId: number): string {
    const baseUrl = 'https://t.me/your_bot';
    return `${baseUrl}?start=equip_${student.id}_${itemId}`;
  }

  // O'quvchining equipped mahsulotlarini olish
  getEquippedItems(student: Student): StudentItem[] {
    return student.inventory.filter(item => item.equipped);
  }

  // Mahsulotning to'liq ma'lumotini olish
  getShopItem(itemId: number): ShopItem | undefined {
    return this.shopItems.find(item => item.id === itemId);
  }

  // O'quvchining tanga balansini tekshirish
  canAfford(student: Student, price: number): boolean {
    return student.coins >= price;
  }
}