import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import type { AppData, Medication } from './types'
import {
  loadData,
  saveData,
  addStage,
  updateStage,
  deleteStage,
  reorderStages,
  addMedication,
  updateMedication,
  deleteMedication,
  reorderMedications,
  toggleIntakeRecord,
} from './services/storage'
import { DateNavigator } from './components/DateNavigator'
import { MedicationSchedule } from './components/MedicationSchedule'
import { StageManager } from './components/StageManager'
import { Button } from './components/ui/button'

function App() {
  const [data, setData] = useState<AppData>(loadData())
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
  const [showStageManager, setShowStageManager] = useState(false)

  useEffect(() => {
    saveData(data)
  }, [data])

  const handleAddStage = (name: string) => {
    setData(addStage(data, name))
  }

  const handleUpdateStage = (stageId: string, name: string) => {
    setData(updateStage(data, stageId, name))
  }

  const handleDeleteStage = (stageId: string) => {
    setData(deleteStage(data, stageId))
  }

  const handleReorderStages = (stages: typeof data.stages) => {
    setData(reorderStages(data, stages))
  }

  const handleAddMedication = (medication: Omit<Medication, 'id' | 'order'>) => {
    setData(addMedication(data, medication))
  }

  const handleUpdateMedication = (medicationId: string, medication: Omit<Medication, 'id' | 'order'>) => {
    setData(updateMedication(data, medicationId, medication))
  }

  const handleDeleteMedication = (medicationId: string) => {
    setData(deleteMedication(data, medicationId))
  }

  const handleToggleIntake = (medicationId: string, stageId: string, date: string) => {
    setData(toggleIntakeRecord(data, medicationId, stageId, date))
  }

  const handleReorderMedications = (medications: Medication[]) => {
    setData(reorderMedications(data, medications))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Overlay */}
      {showStageManager && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setShowStageManager(false)}
        />
      )}

      {/* Slide Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          showStageManager ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <StageManager
          stages={data.stages}
          onAddStage={handleAddStage}
          onUpdateStage={handleUpdateStage}
          onDeleteStage={handleDeleteStage}
          onReorderStages={handleReorderStages}
          onClose={() => setShowStageManager(false)}
        />
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl">
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
            Графік прийому
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm"
            onClick={() => setShowStageManager(true)}
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Етапи прийому</span>
            <span className="sm:hidden">Етапи</span>
          </Button>
        </div>

        <DateNavigator currentDate={currentDate} onDateChange={setCurrentDate} />

        <MedicationSchedule
          data={data}
          currentDate={currentDate}
          onToggleIntake={handleToggleIntake}
          onAddMedication={handleAddMedication}
          onUpdateMedication={handleUpdateMedication}
          onDeleteMedication={handleDeleteMedication}
          onReorderMedications={handleReorderMedications}
        />
      </div>
    </div>
  )
}

export default App
