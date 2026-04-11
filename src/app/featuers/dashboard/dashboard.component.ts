import { Component, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  private earningsChart: Chart | null = null;
  private usersChart: Chart | null = null;
  private subscriptionsChart: Chart | null = null;
  private activityChart: Chart | null = null;
  private dietChart: Chart | null = null;
  private doctorsChart: Chart | null = null;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.initializeEarningsChart();
    this.initializeUsersChart();
    this.initializeSubscriptionsChart();
    this.initializeActivityChart();
    this.initializeDietChart();
    this.initializeDoctorsChart();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private initializeEarningsChart(): void {
    const earningsCanvas = this.el.nativeElement.querySelector('#earningsChart') as HTMLCanvasElement;
    if (earningsCanvas) {
      this.earningsChart = new Chart(earningsCanvas, {
        type: 'line',
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [{
            label: 'Earnings',
            data: [1200, 1900, 3000, 2500, 3200],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          }
        }
      });
    }
  }

  private initializeUsersChart(): void {
    const usersCanvas = this.el.nativeElement.querySelector('#usersChart') as HTMLCanvasElement;
    if (usersCanvas) {
      this.usersChart = new Chart(usersCanvas, {
        type: 'pie',
        data: {
          labels: ['Clients', 'Doctors', 'Supervisors'],
          datasets: [{
            data: [150, 45, 12],
            backgroundColor: [
              '#6366f1',
              '#f59e0b',
              '#10b981'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }

  private initializeSubscriptionsChart(): void {
    const subscriptionsCanvas = this.el.nativeElement.querySelector('#subscriptionsChart') as HTMLCanvasElement;
    if (subscriptionsCanvas) {
      this.subscriptionsChart = new Chart(subscriptionsCanvas, {
        type: 'bar',
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [{
            label: 'Subscriptions',
            data: [30, 50, 70, 60, 90],
            backgroundColor: '#6366f1',
            borderColor: '#4f46e5',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          }
        }
      });
    }
  }

  private initializeActivityChart(): void {
    const activityCanvas = this.el.nativeElement.querySelector('#activityChart') as HTMLCanvasElement;
    if (activityCanvas) {
      this.activityChart = new Chart(activityCanvas, {
        type: 'line',
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          datasets: [{
            label: 'Activity',
            data: [100, 200, 150, 300, 250],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          }
        }
      });
    }
  }

  private initializeDietChart(): void {
    const dietCanvas = this.el.nativeElement.querySelector('#dietChart') as HTMLCanvasElement;
    if (dietCanvas) {
      this.dietChart = new Chart(dietCanvas, {
        type: 'doughnut',
        data: {
          labels: ["Diet", "Workout"],
          datasets: [{
            data: [65, 35],
            backgroundColor: [
              '#6366f1',
              '#f59e0b'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }

  private initializeDoctorsChart(): void {
    const doctorsCanvas = this.el.nativeElement.querySelector('#doctorsChart') as HTMLCanvasElement;
    if (doctorsCanvas) {
      this.doctorsChart = new Chart(doctorsCanvas, {
        type: 'bar',
        data: {
          labels: ["Dr A", "Dr B", "Dr C"],
          datasets: [{
            label: 'Performance',
            data: [90, 75, 60],
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          }
        }
      });
    }
  }

  private destroyCharts(): void {
    if (this.earningsChart) {
      this.earningsChart.destroy();
      this.earningsChart = null;
    }
    if (this.usersChart) {
      this.usersChart.destroy();
      this.usersChart = null;
    }
    if (this.subscriptionsChart) {
      this.subscriptionsChart.destroy();
      this.subscriptionsChart = null;
    }
    if (this.activityChart) {
      this.activityChart.destroy();
      this.activityChart = null;
    }
    if (this.dietChart) {
      this.dietChart.destroy();
      this.dietChart = null;
    }
    if (this.doctorsChart) {
      this.doctorsChart.destroy();
      this.doctorsChart = null;
    }
  }
}
