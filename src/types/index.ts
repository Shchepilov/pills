export type IntakeStage = {
  id: string;
  name: string;
  order: number;
};

export type MedicationIntake = {
  stageId: string;
  quantity: string;
  recommendations?: string;
};

export type Medication = {
  id: string;
  name: string;
  intakes: MedicationIntake[];
  startDate: string; // ISO date
  endDate: string; // ISO date
  order: number;
};

export type IntakeRecord = {
  id: string;
  medicationId: string;
  stageId: string;
  date: string; // ISO date (YYYY-MM-DD)
  taken: boolean;
};

export type AppData = {
  stages: IntakeStage[];
  medications: Medication[];
  records: IntakeRecord[];
};
