// Admin Monitoring System Models

export interface DietPlanMonitoring {
  _id: string;
  name: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
  };
  doctorId: {
    _id: string;
    name: string;
    email: string;
  };
  doctorName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  durationWeeks: number;
  weeklyPlan: DietPlanDay[];
  videoLink: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface DietPlanDay {
  dayName: string;
  dayNumber: number;
  meals: Meal[];
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Meal {
  type: string;
  food: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  videoLink: string | null;
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
  image: string | null;
  recipe: string | null;
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
  gifUrl: string;
  equipment: string;
  instructions: string;
  sets: number;
  reps: number;
  restTime: number;
  status: 'incomplete' | 'completed';
  completedAt?: string;
  _id: string;
}

export interface WorkoutPlanDay {
  dayName: string;
  dailyPlanName: string;
  bodyParts: string[];
  muscles: string[];
  exercises: ExercisePlan[];
  status: 'incomplete' | 'completed';
  completedAt?: string;
  _id: string;
}

export interface WorkoutPlanDetails {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
    age?: number;
    id: string;
  };
  doctorId: {
    _id: string;
    name: string;
    email: string;
    age?: number;
    id: string;
  };
  doctorName: string;
  name: string;
  description: string;
  notes?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationWeeks: number;
  weeklyPlan: WorkoutPlanDay[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetWorkoutPlanDetailsResponse {
  success: boolean;
  data: {
    workoutPlan: WorkoutPlanDetails;
  };
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
      currentPage: number;
      totalPages: number;
      totalPlans: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {};
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
  data: {
    workoutPlan: WorkoutPlanDetails;
  };
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
