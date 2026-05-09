import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="back-btn" (click)="goBack()" title="Go Back" *ngIf="!isDashboard">
      <div class="magic-particles">
        <span class="particle" *ngFor="let particle of particles; let i = index" [style.animation-delay]="'{{i * 0.1}}s'"></span>
      </div>
      <div class="back-icon-container">
        <i class="back-icon">←</i>
        <div class="glow-effect"></div>
      </div>
      <span class="back-text">Back</span>
      <div class="magic-aura"></div>
    </button>
  `,
  styles: [`
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 18px;
      border: none;
      border-radius: 50px;
      background: linear-gradient(135deg, var(--card-bg) 0%, var(--card-hover) 100%);
      color: var(--text-primary);
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      text-decoration: none;
      position: relative;
      overflow: visible;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
        border-radius: 50px;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        transform: scale(0.8);
      }
      
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
        border-radius: 50px;
        opacity: 0;
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translate(-50%, -50%) scale(0);
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        
        &::before {
          opacity: 1;
          transform: scale(1);
        }
        
        &::after {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
        
        .back-icon-container {
          transform: translateX(-3px);
          background: rgba(255, 255, 255, 0.2);
        }
        
        .back-text {
          color: white;
          transform: translateX(2px);
        }
        
        .magic-particles .particle {
          animation: float 3s ease-in-out infinite;
        }
        
        .magic-aura {
          opacity: 1;
          transform: scale(1.2);
        }
        
        .glow-effect {
          opacity: 1;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
        }
      }
      
      &:active {
        transform: translateY(0);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        
        .back-icon-container {
          transform: translateX(-1px) scale(0.95);
        }
      }
    }
    
    .magic-particles {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }
    
    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: var(--primary-color);
      border-radius: 50%;
      opacity: 0;
      animation: none;
      
      &:nth-child(1) { top: 20%; left: 10%; }
      &:nth-child(2) { top: 30%; left: 90%; }
      &:nth-child(3) { top: 70%; left: 85%; }
      &:nth-child(4) { top: 80%; left: 15%; }
      &:nth-child(5) { top: 50%; left: 5%; }
      &:nth-child(6) { top: 50%; left: 95%; }
      &:nth-child(7) { top: 10%; left: 50%; }
      &:nth-child(8) { top: 90%; left: 50%; }
    }
    
    .magic-aura {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 120%;
      height: 120%;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
      z-index: 0;
    }
    
    .back-icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary-color);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 2;
      overflow: visible;
    }
    
    .glow-effect {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }
    
    .back-icon {
      font-size: 16px;
      color: white;
      font-weight: bold;
      position: relative;
      z-index: 3;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: pulse 2s ease-in-out infinite;
    }
    
    .back-text {
      font-size: 14px;
      color: var(--text-primary);
      font-weight: 600;
      position: relative;
      z-index: 2;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes float {
      0%, 100% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
      }
      20% {
        opacity: 1;
        transform: translateY(-10px) rotate(180deg);
      }
      80% {
        opacity: 1;
        transform: translateY(-20px) rotate(360deg);
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }
  
  
  /* Responsive */
  @media (max-width: 768px) {
    .back-btn {
      padding: 8px 14px;
      font-size: 12px;
      gap: 8px;
      
      .back-icon-container {
        width: 28px;
        height: 28px;
      }
      
      .back-icon {
        font-size: 14px;
      }
    }
  }
  
  @media (max-width: 480px) {
    .back-btn {
      padding: 6px 12px;
      font-size: 11px;
      gap: 6px;
      
      .back-icon-container {
        width: 24px;
        height: 24px;
      }
      
      .back-icon {
        font-size: 12px;
      }
    }
  }
  `]
})
export class BackButtonComponent {
  particles = Array(8).fill(0);
  isDashboard = false;
  
  constructor(private location: Location, private router: Router) {
    this.checkCurrentRoute();
    this.router.events.subscribe(() => {
      this.checkCurrentRoute();
    });
  }
  
  private checkCurrentRoute(): void {
    const currentUrl = this.router.url;
    this.isDashboard = currentUrl === '/' || currentUrl === '/dashboard' || currentUrl.includes('/dashboard');
  }
  
  goBack(): void {
    this.location.back();
  }
}
