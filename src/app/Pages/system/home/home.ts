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
  selector: 'app-home',
  standalone:false,
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {
  isDarkMode = false;
  students: Student[] = [];
  
  levels: Level[] = [
    { name: 'Yalqov', xp: -100 },
    { name: 'Maymuncha', xp: -1 },
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

  ngOnInit() {
    this.loadThemePreference();
    this.loadStudentsData();
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

  private loadStudentsData() {
    // JSON fayldan ma'lumotlarni olish
    try {
      // TypeScriptda JSON importini qayta ishlash
      this.students = (studentsData as any).default || studentsData;
    } catch (error) {
      console.error('Error loading students data:', error);
      // Agar JSON fayldan ma'lumot olishda xatolik bo'lsa, namuna ma'lumotlardan foydalanish
      this.students = [
        {
          id: 1,
          name: "Student 1",
          username: "student1",
          password: "password1",
          image: "https://via.placeholder.com/150",
          level: "Beginner",
          months: {}
        },
        {
          id: 2,
          name: "Student 2",
          username: "student2",
          password: "password2",
          image: "https://via.placeholder.com/150",
          level: "Novice",
          months: {}
        },
        {
          id: 3,
          name: "Ibrohimjon",
          username: "ibrohimjon",
          password: "12946",
          image: "https://avatars.mds.yandex.net/i?id=0e56150aa276e02771636e69480b729e006fdd8f-5221285-images-thumbs&n=13",
          level: "OK",
          months: {
            "2025-08": { davomat: 6, uy_vazifa: 0, tasks: 78, jarima: 78 },
            "2025-09": { davomat: 100, uy_vazifa: 15, tasks: 54, jarima: 58 }
          }
        },
        {
          id: 5,
          name: "Elnurbek",
          username: "elnurbek",
          password: "30417",
          image: "https://avatars.mds.yandex.net/i?id=0e56150aa276e02771636e69480b729e006fdd8f-5221285-images-thumbs&n=13",
          level: "OK",
          months: {
            "2025-08": { davomat: 6, uy_vazifa: 0, tasks: 88, jarima: 51 },
            "2025-09": { davomat: 120, uy_vazifa: 35, tasks: 85, jarima: 508 }
          }
        }
      ];
    }
  }
}