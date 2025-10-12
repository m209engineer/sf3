// market.component.ts
import { Component, OnInit, HostListener, ElementRef, Renderer2 } from '@angular/core';
import * as studentsData from '../../../students.json';
import * as shopItemsData from '../../../shopItems.json';

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
  months: {
    [key: string]: MonthData;
  };
  inventory: StudentItem[];
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
  selector: 'app-market',
  standalone:false,
  templateUrl: './market.html',
  styleUrls: ['./market.scss']
})
export class Market implements OnInit {
  students: Student[] = (studentsData as any).default || studentsData;
  shopItems: ShopItem[] = (shopItemsData as any).default || shopItemsData;
  currentStudent: Student | null = null;
  
  // UI States
  showConvertModal = false;
  showMiniCoinCard = false;
  expandedProductId: number | null = null;
  
  isCopied = false;

  // Convert data
  convertAmount = 0;
  generatedCode = '';
  
  // Animation states
  coinPulse = false;
  isScrolling = false;

  // Filtering and Sorting
  filteredProducts: ShopItem[] = [];
  selectedCategory: string = 'all';
  sortBy: string = 'name';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.loadCurrentStudent();
    this.startCoinAnimation();
    this.applyFilters(); // Initialize products
  }

  // Scroll animatsiyasi uchun
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY;
    const threshold = 100; // 100px scroll qilganda
    
    this.showMiniCoinCard = scrollY > threshold;
  }

  private loadCurrentStudent() {
    try {
      const studentData = localStorage.getItem('currentStudent');
      this.currentStudent = studentData ? JSON.parse(studentData) : this.students[0];
    } catch (error) {
      console.error('Error loading current student:', error);
      this.currentStudent = this.students[0];
    }
  }

  private startCoinAnimation() {
    setInterval(() => {
      this.coinPulse = true;
      setTimeout(() => this.coinPulse = false, 1000);
    }, 3000);
  }

  private handleScroll() {
    const scrollY = window.scrollY;
    const basicInfoCard = this.el.nativeElement.querySelector('.basic-info-card');
    
    if (basicInfoCard) {
      const cardBottom = basicInfoCard.getBoundingClientRect().bottom + scrollY;
      this.showMiniCoinCard = scrollY > cardBottom;
    }
  }

  

  // XP Calculations
  calculateTotalXP(student: Student): number {
    const includedMonths = this.getIncludedMonths(student);
    return includedMonths.reduce((sum, monthKey) => {
      const monthData = student.months[monthKey];
      return sum + (monthData.davomat + monthData.uy_vazifa + monthData.tasks - (monthData.jarima || 0));
    }, 0);
  }

  getIncludedMonths(student: Student): string[] {
    const allMonths = Object.keys(student.months);
    const excludedMonths = student.excludedMonths || [];
    return allMonths.filter(month => !excludedMonths.includes(month));
  }

  getConvertibleXP(): number {
    if (!this.currentStudent) return 0;
    const totalXP = this.calculateTotalXP(this.currentStudent);
    const legendThreshold = 1000;
    
    if (totalXP < legendThreshold) return 0;
    return totalXP - legendThreshold - this.currentStudent.convertedXP;
  }

  isLegend(): boolean {
    if (!this.currentStudent) return false;
    const totalXP = this.calculateTotalXP(this.currentStudent);
    return totalXP >= 1000;
  }

  // Daraja nomini olish
  getLevelName(): string {
    if (!this.currentStudent) return 'Beginner';
    const totalXP = this.calculateTotalXP(this.currentStudent);
    
    // Soddalashtirilgan daraja tizimi
    if (totalXP >= 1000) return 'LEGEND';
    if (totalXP >= 500) return 'EXPERT';
    if (totalXP >= 200) return 'ADVANCED';
    if (totalXP >= 100) return 'INTERMEDIATE';
    return 'BEGINNER';
  }

  // Convert Methods
  openConvertModal() {
    if (this.isLegend()) {
      this.showConvertModal = true;
      this.convertAmount = Math.min(this.getConvertibleXP(), 1000);
    }
  }

  closeConvertModal() {
    this.showConvertModal = false;
    this.generatedCode = '';
    this.convertAmount = 0;
  }

  generateConvertCode() {
    if (!this.currentStudent) return;
    
    const coins = Math.floor(this.convertAmount / 100);
    this.generatedCode = `convert_${this.currentStudent.id}_${this.convertAmount}_${coins}`;
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.isCopied = true;
      setTimeout(() => {
        this.isCopied = false;
      }, 2000);
    });
  }

  getConvertTelegramLink(): string {
    return `https://t.me/your_bot?start=${this.generatedCode}`;
  }

  // Product Methods
  toggleProductExpansion(productId: number) {
    if (this.expandedProductId === productId) {
      this.expandedProductId = null;
    } else {
      this.expandedProductId = productId;
      this.generateProductCode(productId);
    }
  }

  generateProductCode(productId: number) {
    if (!this.currentStudent) return;
    
    const product = this.shopItems.find(p => p.id === productId);
    if (product) {
      this.generatedCode = `purchase_${this.currentStudent.id}_${productId}_1`;
    }
  }

  getProductTelegramLink(): string {
    return `https://t.me/your_bot?start=${this.generatedCode}`;
  }

  canAffordProduct(price: number): boolean {
    return this.currentStudent ? this.currentStudent.coins >= price : false;
  }

  getProductRarityClass(rarity: string): string {
    switch (rarity) {
      case 'common': return 'rarity-common';
      case 'rare': return 'rarity-rare';
      case 'epic': return 'rarity-epic';
      case 'legendary': return 'rarity-legendary';
      default: return 'rarity-common';
    }
  }

  // Filtering and Sorting Methods
  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onCategoryChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory = target.value;
    this.applyFilters();
  }

  onSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value;
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.shopItems];
    
    // Category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder = { 'common': 0, 'rare': 1, 'epic': 2, 'legendary': 3 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        default:
          return 0;
      }
    });
    
    this.filteredProducts = filtered;
  }

  // Math.floor alternative
  calculateCoins(): number {
    return Math.floor(this.convertAmount / 100);
  }
  // market.component.ts ga qo'shing
  // market.component.ts ga qo'shing
  getLevelProgress(): number {
    if (!this.currentStudent) return 0;
    const totalXP = this.calculateTotalXP(this.currentStudent);
    
    // Soddalashtirilgan progress hisobi
    if (totalXP >= 1000) return 100;
    if (totalXP >= 500) return 75;
    if (totalXP >= 200) return 50;
    if (totalXP >= 100) return 25;
    return Math.min(100, (totalXP / 100) * 100);
  }

  // Ripple effect uchun
  createRipple(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    const ripple = document.createElement('div');
    ripple.classList.add('btn-ripple');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

}