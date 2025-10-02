import type { AppData, IntakeStage, Medication, IntakeRecord } from '../types';

const STORAGE_KEY = 'medication-schedule-data';

const DEFAULT_STAGES: IntakeStage[] = [
  { id: '1', name: 'До сніданку', order: 1 },
  { id: '2', name: 'Під час сніданку', order: 2 },
  { id: '3', name: 'До обіду', order: 3 },
  { id: '4', name: 'Під час обіду', order: 4 },
  { id: '5', name: 'До вечері', order: 5 },
  { id: '6', name: 'Під час вечері', order: 6 },
  { id: '7', name: 'На ніч', order: 7 },
];

function getDefaultData(): AppData {
  return {
    stages: DEFAULT_STAGES,
    medications: [],
    records: [],
  };
}

export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultData();
    }
    const data = JSON.parse(stored) as AppData;
    // Ensure stages exist
    if (!data.stages || data.stages.length === 0) {
      data.stages = DEFAULT_STAGES;
    }
    // Ensure medications have order field
    if (data.medications) {
      data.medications = data.medications.map((m, index) => ({
        ...m,
        order: m.order || index + 1,
      }));
    }
    return data;
  } catch (error) {
    console.error('Failed to load data:', error);
    return getDefaultData();
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}

export function addStage(data: AppData, name: string): AppData {
  const maxOrder = Math.max(...data.stages.map(s => s.order), 0);
  const newStage: IntakeStage = {
    id: Date.now().toString(),
    name,
    order: maxOrder + 1,
  };
  return {
    ...data,
    stages: [...data.stages, newStage],
  };
}

export function updateStage(data: AppData, stageId: string, name: string): AppData {
  return {
    ...data,
    stages: data.stages.map(s => s.id === stageId ? { ...s, name } : s),
  };
}

export function deleteStage(data: AppData, stageId: string): AppData {
  return {
    ...data,
    stages: data.stages.filter(s => s.id !== stageId),
    medications: data.medications.map(m => ({
      ...m,
      intakes: m.intakes.filter(i => i.stageId !== stageId),
    })),
    records: data.records.filter(r => r.stageId !== stageId),
  };
}

export function reorderStages(data: AppData, stages: IntakeStage[]): AppData {
  return {
    ...data,
    stages: stages.map((s, index) => ({ ...s, order: index + 1 })),
  };
}

export function addMedication(data: AppData, medication: Omit<Medication, 'id' | 'order'>): AppData {
  const maxOrder = Math.max(...data.medications.map(m => m.order || 0), 0);
  const newMedication: Medication = {
    ...medication,
    id: Date.now().toString(),
    order: maxOrder + 1,
  };
  return {
    ...data,
    medications: [...data.medications, newMedication],
  };
}

export function updateMedication(data: AppData, medicationId: string, medication: Omit<Medication, 'id' | 'order'>): AppData {
  return {
    ...data,
    medications: data.medications.map(m =>
      m.id === medicationId ? { ...medication, id: medicationId, order: m.order } : m
    ),
  };
}

export function deleteMedication(data: AppData, medicationId: string): AppData {
  return {
    ...data,
    medications: data.medications.filter(m => m.id !== medicationId),
    records: data.records.filter(r => r.medicationId !== medicationId),
  };
}

export function reorderMedications(data: AppData, medications: Medication[]): AppData {
  return {
    ...data,
    medications: medications.map((m, index) => ({ ...m, order: index + 1 })),
  };
}

export function toggleIntakeRecord(
  data: AppData,
  medicationId: string,
  stageId: string,
  date: string
): AppData {
  const existingRecord = data.records.find(
    r => r.medicationId === medicationId && r.stageId === stageId && r.date === date
  );

  if (existingRecord) {
    return {
      ...data,
      records: data.records.map(r =>
        r.id === existingRecord.id ? { ...r, taken: !r.taken } : r
      ),
    };
  } else {
    const newRecord: IntakeRecord = {
      id: Date.now().toString(),
      medicationId,
      stageId,
      date,
      taken: true,
    };
    return {
      ...data,
      records: [...data.records, newRecord],
    };
  }
}

export function getIntakeRecord(
  data: AppData,
  medicationId: string,
  stageId: string,
  date: string
): IntakeRecord | undefined {
  return data.records.find(
    r => r.medicationId === medicationId && r.stageId === stageId && r.date === date
  );
}
