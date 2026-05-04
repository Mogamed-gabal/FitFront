import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DietComponent } from './pages/diet/diet.component';
import { WorkoutComponent } from './pages/workout/workout.component';

@Component({
  selector: 'app-plans-monitoring',
  standalone: true,
  imports: [CommonModule, DietComponent, WorkoutComponent],
  templateUrl: './plans-monitoring.component.html',
  styleUrl: './plans-monitoring.component.scss'
})
export class PlansMonitoringComponent {
  protected readonly selectedView = signal<'diet' | 'workout' | null>(null);

  protected selectDiet(): void {
    this.selectedView.set('diet');
  }

  protected selectWorkout(): void {
    this.selectedView.set('workout');
  }

  protected backToSelection(): void {
    this.selectedView.set(null);
  }
}
