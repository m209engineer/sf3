// navbar.component.ts
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface ChatMessage {
  text: string;
  time: string;
  isUser: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar implements OnInit {
  @Input() isCollapsed: boolean = false;
  @Input() isMobile: boolean = false;
  @Output() themeToggled = new EventEmitter<boolean>();
  @ViewChild('messageInput') messageInput!: ElementRef;
  
  dynamicTitle = 'Abutech XP System';
  isDarkMode = false;
  showAIChat = false;
  currentMessage = '';
  chatMessages: ChatMessage[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadThemePreference();
    this.updateTitleBasedOnRoute();
    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateTitleBasedOnRoute();
      });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
    this.themeToggled.emit(this.isDarkMode);
  }

  toggleAIChat() {
    this.showAIChat = !this.showAIChat;
    if (this.showAIChat) {
      setTimeout(() => {
        this.messageInput.nativeElement.focus();
      }, 100);
    }
  }

  sendMessage() {
    if (!this.currentMessage.trim()) return;

    // Foydalanuvchi xabarini qo'shish
    const userMessage: ChatMessage = {
      text: this.currentMessage,
      time: this.getCurrentTime(),
      isUser: true
    };
    
    this.chatMessages.push(userMessage);
    
    // AI javobini simulyatsiya qilish
    setTimeout(() => {
      this.generateAIResponse(this.currentMessage);
    }, 1000);
    
    this.currentMessage = '';
  }

  askQuickQuestion(question: string) {
    this.currentMessage = question;
    this.sendMessage();
  }

  private generateAIResponse(question: string) {
    let response = '';
    
    // Savolni tahlil qilish va mos javob generatsiya qilish
    if (question.toLowerCase().includes('xp') || question.toLowerCase().includes('ball')) {
      response = 'Hozirda sizda 1250 XP ball to\'plagansiz. Bu sizni 5-o\'rinda qo\'yadi. Keyingi darajaga yetish uchun sizga 250 XP kerak.';
    } else if (question.toLowerCase().includes('reyting') || question.toLowerCase().includes('o\'rin')) {
      response = 'Siz hozirda 1250 XP bilan reyting jadvalida 5-o\'rindasiz. Eng yuqori ball 1850 XP.';
    } else if (question.toLowerCase().includes('topshiriq') || question.toLowerCase().includes('vazifa')) {
      response = 'Keyingi topshiriq "Angular loyihasi" 2 kun后 muddati bor. Siz hozirda topshiriqlarning 75% ni yakunlagansiz.';
    } else if (question.toLowerCase().includes('yordam') || question.toLowerCase().includes('qanday')) {
      response = 'XP tizimida ballar topshiriqlarni bajarish, darslarda qatnashish va loyihalarni topshirish orqali to\'planadi. Har bir daraja yangi imkoniyatlar va mukofotlarni ochadi.';
    } else {
      response = 'Kechirasiz, men faqat Abutech XP tizimi va uning funksionalligi haqida ma\'lumot bera olaman. Boshqa mavzular bo\'yicha savollaringizni administratorlarga murojaat qiling.';
    }
    
    const aiMessage: ChatMessage = {
      text: response,
      time: this.getCurrentTime(),
      isUser: false
    };
    
    this.chatMessages.push(aiMessage);
    
    // Avtomatik scroll pastga
    setTimeout(() => {
      const messagesContainer = document.querySelector('.ai-chat-messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private loadThemePreference() {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.isDarkMode = savedTheme === 'dark';
      } else {
        this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
      }
      this.applyTheme();
    } catch (error) {
      console.error('Error loading theme preference:', error);
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme();
    }
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }

  private updateTitleBasedOnRoute() {
    const url = this.router.url;
    const routeSegment = url.split('/').pop();
    const baseTitle = 'Abutech XP System';
    
    if (routeSegment && routeSegment !== 'system') {
      const capitalizedSegment = routeSegment.charAt(0).toUpperCase() + routeSegment.slice(1);
      this.dynamicTitle = `${baseTitle} ${capitalizedSegment}`;
    } else {
      this.dynamicTitle = baseTitle;
    }
  }
}