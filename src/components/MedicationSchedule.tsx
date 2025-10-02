import { useState } from 'react'
import { Trash2, Plus, GripVertical } from 'lucide-react'
import type { Medication, AppData } from '../types'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { MedicationForm } from './MedicationForm'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from './ui/alert-dialog'

interface MedicationScheduleProps {
  data: AppData
  currentDate: string
  onToggleIntake: (medicationId: string, stageId: string, date: string) => void
  onAddMedication: (medication: Omit<Medication, 'id' | 'order'>) => void
  onUpdateMedication: (medicationId: string, medication: Omit<Medication, 'id' | 'order'>) => void
  onDeleteMedication: (medicationId: string) => void
  onReorderMedications: (medications: Medication[]) => void
}

export function MedicationSchedule({
  data,
  currentDate,
  onToggleIntake,
  onAddMedication,
  onUpdateMedication,
  onDeleteMedication,
  onReorderMedications,
}: MedicationScheduleProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | undefined>()
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; medication?: { id: string; name: string } }>({
    open: false,
  })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingMedication(undefined)
    setShowForm(true)
  }

  const handleSave = (medication: Omit<Medication, 'id' | 'order'>) => {
    if (editingMedication) {
      onUpdateMedication(editingMedication.id, medication)
    } else {
      onAddMedication(medication)
    }
    setShowForm(false)
    setEditingMedication(undefined)
  }

  const handleDeleteClick = (medicationId: string, medicationName: string) => {
    setDeleteDialog({ open: true, medication: { id: medicationId, name: medicationName } })
  }

  const handleDeleteConfirm = () => {
    if (deleteDialog.medication) {
      onDeleteMedication(deleteDialog.medication.id)
    }
    setDeleteDialog({ open: false })
  }

  const isMedicationActive = (medication: Medication): boolean => {
    const current = new Date(currentDate)
    const start = new Date(medication.startDate)
    const end = medication.endDate ? new Date(medication.endDate) : null

    if (current < start) return false
    if (end && current > end) return false
    return true
  }

  const isIntakeTaken = (medicationId: string, stageId: string): boolean => {
    const record = data.records.find(
      r => r.medicationId === medicationId && r.stageId === stageId && r.date === currentDate
    )
    return record?.taken || false
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const sortedMeds = [...data.medications].sort((a, b) => (a.order || 0) - (b.order || 0))
    const draggedMed = sortedMeds[draggedIndex]
    sortedMeds.splice(draggedIndex, 1)
    sortedMeds.splice(index, 0, draggedMed)

    onReorderMedications(sortedMeds)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const sortedStages = [...data.stages].sort((a, b) => a.order - b.order)
  const sortedMedications = [...data.medications].sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-2 sm:p-4 border-b border-gray-300 flex justify-between items-center gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Графік прийому</h2>
        <Button onClick={handleAdd} size="sm" className="text-xs sm:text-sm">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Додати препарат</span>
          <span className="sm:hidden">Додати</span>
        </Button>
      </div>

      {data.medications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Немає доданих препаратів. Натисніть "Додати препарат" щоб почати.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-green-50">
                <th className="pl-3 sm:pl-4 pr-1 sm:pr-2 py-2 sm:py-3 w-6 sm:w-8"></th>
                <th className="px-1.5 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 sticky left-0 bg-green-50 z-10 before:absolute before:right-[-2px] before:top-0 before:bottom-0 before:w-2 before:bg-gradient-to-r before:from-transparent before:to-black/5 before:pointer-events-none">
                  Препарат
                </th>
                {sortedStages.map((stage) => (
                  <th
                    key={stage.id}
                    className="px-1.5 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap"
                  >
                    {stage.name}
                  </th>
                ))}
                <th className="px-1.5 sm:px-3 py-2 sm:py-3 w-8 sm:w-12"></th>
              </tr>
            </thead>
            <tbody>
              {sortedMedications.map((medication, index) => {
                const isActive = isMedicationActive(medication)

                // Проверяем, имеют ли все этапы одинаковую дозу
                const firstIntake = medication.intakes[0]
                const hasUniformDose = medication.intakes.length === sortedStages.length &&
                  Boolean(firstIntake?.quantity) &&
                  medication.intakes.every(i =>
                    i.quantity === firstIntake?.quantity &&
                    i.recommendations === firstIntake?.recommendations
                  )

                return (
                  <tr
                    key={medication.id}
                    onDragOver={(e) => handleDragOver(e, index)}
                    className={`border-b border-gray-200 transition-opacity ${!isActive ? 'opacity-50' : ''} ${
                      draggedIndex === index ? 'opacity-30' : ''
                    }`}
                  >
                    <td className="pl-3 sm:pl-4 pr-1 sm:pr-0 py-2 sm:py-3 text-center">
                      <div
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragEnd={handleDragEnd}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 inline-block hover:text-gray-600" />
                      </div>
                    </td>
                    <td className="px-1.5 sm:px-3 py-2 sm:py-3 sticky left-0 bg-white z-10 before:absolute before:right-[-2px] before:top-0 before:bottom-0 before:w-2 before:bg-gradient-to-r before:from-transparent before:to-black/5 before:pointer-events-none">
                      <div className="p-1 sm:p-2">
                        <div
                          className="text-xs sm:text-sm text-green-600 hover:text-green-700 underline cursor-pointer transition-colors whitespace-nowrap"
                          onClick={() => handleEdit(medication)}
                        >
                          {medication.name}
                        </div>
                        <div className="hidden sm:block text-xs text-gray-500 mt-1 whitespace-nowrap">
                          {new Date(medication.startDate).toLocaleDateString('uk-UA')}
                          {medication.endDate && ` - ${new Date(medication.endDate).toLocaleDateString('uk-UA')}`}
                        </div>
                      </div>
                    </td>
                    {hasUniformDose && firstIntake ? (
                      // Объединенная ячейка для одинаковой дозы
                      <td
                        colSpan={sortedStages.length}
                        className="px-2 sm:px-4 py-2 sm:py-3 text-center"
                      >
                        {firstIntake.quantity && isActive ? (
                          <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                            <Checkbox
                              checked={sortedStages.every(stage =>
                                isIntakeTaken(medication.id, stage.id)
                              )}
                              onCheckedChange={() => {
                                // Проверяем текущее состояние - все ли отмечены
                                const allChecked = sortedStages.every(stage =>
                                  isIntakeTaken(medication.id, stage.id)
                                )
                                // Переключаем все этапы на противоположное состояние
                                sortedStages.forEach(stage => {
                                  const isTaken = isIntakeTaken(medication.id, stage.id)
                                  // Если все были отмечены, снимаем все
                                  // Если не все были отмечены, отмечаем все
                                  if (allChecked) {
                                    // Снимаем только отмеченные
                                    if (isTaken) {
                                      onToggleIntake(medication.id, stage.id, currentDate)
                                    }
                                  } else {
                                    // Отмечаем только неотмеченные
                                    if (!isTaken) {
                                      onToggleIntake(medication.id, stage.id, currentDate)
                                    }
                                  }
                                })
                              }}
                            />
                            <div className="text-[10px] sm:text-xs text-gray-600 font-medium">
                              {firstIntake.quantity}
                            </div>
                            {firstIntake.recommendations && (
                              <div className="text-[10px] sm:text-xs text-gray-500 italic">
                                {firstIntake.recommendations}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ) : (
                      // Обычные отдельные ячейки для разных доз
                      sortedStages.map((stage) => {
                        const intake = medication.intakes.find(i => i.stageId === stage.id)
                        const hasDosage = intake && intake.quantity
                        const isTaken = isIntakeTaken(medication.id, stage.id)

                        return (
                          <td
                            key={stage.id}
                            className="px-2 sm:px-4 py-2 sm:py-3 text-center"
                          >
                            {hasDosage && isActive ? (
                              <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                                <Checkbox
                                  checked={isTaken}
                                  onCheckedChange={() => onToggleIntake(medication.id, stage.id, currentDate)}
                                />
                                <div className="text-[10px] sm:text-xs text-gray-600">
                                  {intake.quantity}
                                </div>
                                {intake.recommendations && (
                                  <div className="text-[10px] sm:text-xs text-gray-500 italic">
                                    {intake.recommendations}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        )
                      })
                    )}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-9 sm:w-9"
                        onClick={() => handleDeleteClick(medication.id, medication.name)}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <MedicationForm
        open={showForm}
        onOpenChange={setShowForm}
        stages={data.stages}
        medication={editingMedication}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити препарат?</AlertDialogTitle>
            <AlertDialogDescription>
              Ви впевнені, що хочете видалити "{deleteDialog.medication?.name}"? Усі записи про прийом цього препарату будуть видалені. Цю дію не можна скасувати.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>
              Скасувати
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Видалити
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
