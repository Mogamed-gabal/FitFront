// Admin Monitoring System Models

export interface DietPlanMonitoring {
  _id: string;
  name: string;
  description: string;
  doctorId: string;
  doctorName: string;
  clientId: string;
  clientName: string;
  status: 'active' | 'completed' | 'paused';
  startDate: string;
  endDate: string;
  progress: {
    completedDays: number;
    totalDays: number;
    completionRate: number;
    streakDays?: number;
    missedDays?: number;
  };
  weeklyPlan: WeeklyDietPlan;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyDietPlan {
  [day: string]: {
    breakfast: MealPlan;
    lunch: MealPlan;
    dinner: MealPlan;
  };
}

export interface MealPlan {
  food: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface WorkoutPlanMonitoring {
  _id: string;
  name: string;
  description: string;
  doctorId: string;
  doctorName: string;
  clientId: string;
  clientName: string;
  status: 'active' | 'completed' | 'paused';
  startDate: string;
  endDate: string;
  progress: {
    completedWorkouts: number;
    totalWorkouts: number;
    completionRate: number;
  };
  weeklyPlan: WeeklyWorkoutPlan;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyWorkoutPlan {
  [day: string]: {
    exercises: ExercisePlan[];
  };
}

export interface ExercisePlan {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
  completed?: boolean;
  completedAt?: string;
}

export interface DietPlanProgress {
  dietPlanId: string;
  overallProgress: {
    completedDays: number;
    totalDays: number;
    completionRate: number;
    streakDays: number;
    missedDays: number;
  };
  weeklyProgress: WeeklyProgress[];
  nutritionSummary: {
    averageDailyCalories: number;
    targetDailyCalories: number;
    averageProtein: number;
    targetProtein: number;
    averageCarbs: number;
    targetCarbs: number;
  };
}

export interface WeeklyProgress {
  week: number;
  completedDays: number;
  totalDays: number;
  completionRate: number;
}

export interface WorkoutPlanProgress {
  workoutPlanId: string;
  overallProgress: {
    completedWorkouts: number;
    totalWorkouts: number;
    completionRate: number;
  };
  weeklyProgress: WorkoutWeeklyProgress[];
  performanceMetrics: {
    averageWorkoutFrequency: number;
    averageSessionDuration: number;
    completionTrend: WorkoutTrend[];
  };
}

export interface WorkoutWeeklyProgress {
  week: number;
  completedWorkouts: number;
  totalWorkouts: number;
  completionRate: number;
}

export interface WorkoutTrend {
  week: string;
  rate: number;
}

// API Response Interfaces
export interface GetDietPlansResponse {
  success: boolean;
  data: {
    dietPlans: DietPlanMonitoring[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface GetWorkoutPlansResponse {
  success: boolean;
  data: {
    workoutPlans: WorkoutPlanMonitoring[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface GetDietPlanDetailsResponse {
  success: boolean;
  data: DietPlanMonitoring;
}

export interface GetWorkoutPlanDetailsResponse {
  success: boolean;
  data: WorkoutPlanMonitoring;
}

export interface GetDietProgressResponse {
  success: boolean;
  data: DietPlanProgress;
}

export interface GetWorkoutProgressResponse {
  success: boolean;
  data: WorkoutPlanProgress;
}

// Filter Parameters
export interface DietPlanFilters {
  page?: number;
  limit?: number;
  status?: 'active' | 'completed' | 'paused';
  search?: string;
}

export interface WorkoutPlanFilters {
  page?: number;
  limit?: number;
  status?: 'active' | 'completed' | 'paused';
  search?: string;
}
