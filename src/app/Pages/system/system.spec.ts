import { ComponentFixture, TestBed } from '@angular/core/testing';

import { System } from './system';

describe('System', () => {
  let component: System;
  let fixture: ComponentFixture<System>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [System]
    })
    .compileComponents();

    fixture = TestBed.createComponent(System);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
