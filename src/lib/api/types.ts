export type Priority = "High" | "Medium" | "Low";
export type TaskStatus =
  | "Inbox"
  | "Planned"
  | "In Progress"
  | "Waiting"
  | "Completed"
  | "Cancelled";
export type TxType = "Income" | "Expense";
export type LifeArea =
  | "Personal"
  | "Work"
  | "Health"
  | "Finance"
  | "Home"
  | "Relationships"
  | "Learning";
export type GoalStatus = "Active" | "Paused" | "Done";

export type Task = {
  id: string;
  name: string;
  description: string;
  lifeArea: LifeArea | "";
  project: string;
  priority: Priority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  recurring: boolean;
  estTime: number | null;
  actualTime: number | null;
  created: string;
  completed: string;
};

export type Goal = {
  id: string;
  name: string;
  lifeArea: LifeArea | "";
  why: string;
  startDate: string;
  targetDate: string;
  status: GoalStatus;
  targetValue: number;
  currentValue: number;
  progress: number;
  linkedProject: string;
  nextAction: string;
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: TxType;
  account: string;
  amount: number;
  fixedVariable: "Fixed" | "Variable" | "";
  notes: string;
};

export type Habit = {
  id: string;
  name: string;
  lifeArea: LifeArea | "";
  active: boolean;
  targetPerWeek: number;
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
};

export type MoodEntry = {
  id: string;
  date: string;
  mood: number;
  energy: number;
  stress: number;
  focus: number;
  notes: string;
};

export type SleepEntry = {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  hours: number | null;
  quality: number | null;
  notes: string;
};

export type Settings = {
  userName: string;
  weekStart: "Monday" | "Sunday";
  currency: string;
  timezone: string;
  simulateFailure: boolean;
};

export type TodaySnapshot = {
  tasksDueToday: number;
  overdueTasks: number;
  habitsToday: number;
  habitsTarget: number;
  activeGoals: number;
  moneyRemaining: number;
  energyAvg7: number | null;
  focus: Task[];
  upcoming: Task[];
  goals: Goal[];
};

export type CreateTaskInput = {
  name: string;
  description?: string;
  lifeArea?: LifeArea | "";
  priority?: Priority;
  dueDate?: string;
};

export type UpdateTaskInput = Partial<Omit<Task, "id" | "created">>;

export type CreateGoalInput = {
  name: string;
  why?: string;
  lifeArea?: LifeArea | "";
  targetDate?: string;
  targetValue?: number;
  currentValue?: number;
  nextAction?: string;
  status?: GoalStatus;
};

export type UpdateGoalInput = Partial<Omit<Goal, "id">>;

export type CreateTransactionInput = {
  description: string;
  amount: number;
  type: TxType;
  category?: string;
  account?: string;
};

export type CreateMoodInput = {
  mood: number;
  energy: number;
  stress: number;
  focus: number;
  notes?: string;
};

export type UpsertSleepInput = {
  date?: string;
  bedtime: string;
  wakeTime: string;
  hours?: number | null;
  quality: number;
  notes?: string;
};

export type ApiError = {
  code: "VALIDATION" | "FAILURE" | "NOT_FOUND";
  message: string;
  fields?: Record<string, string>;
};

export type LifeOsAdapter = {
  getSettings(): Promise<Settings>;
  updateSettings(patch: Partial<Settings>): Promise<Settings>;
  listTasks(): Promise<Task[]>;
  createTask(input: CreateTaskInput): Promise<Task>;
  updateTask(id: string, patch: UpdateTaskInput): Promise<Task>;
  listGoals(): Promise<Goal[]>;
  createGoal(input: CreateGoalInput): Promise<Goal>;
  updateGoal(id: string, patch: UpdateGoalInput): Promise<Goal>;
  listTransactions(): Promise<Transaction[]>;
  createTransaction(input: CreateTransactionInput): Promise<Transaction>;
  listHabits(): Promise<Habit[]>;
  listHabitLogs(): Promise<HabitLog[]>;
  logHabit(habitId: string, date: string, completed: boolean): Promise<HabitLog>;
  listMood(): Promise<MoodEntry[]>;
  createMood(input: CreateMoodInput): Promise<MoodEntry>;
  listSleep(): Promise<SleepEntry[]>;
  upsertSleep(input: UpsertSleepInput): Promise<SleepEntry>;
  getToday(): Promise<TodaySnapshot>;
  reset(mode: "seed" | "empty"): Promise<void>;
};
