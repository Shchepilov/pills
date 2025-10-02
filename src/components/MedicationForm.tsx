import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import type { Medication, MedicationIntake, IntakeStage } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'

interface MedicationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stages: IntakeStage[]
  medication?: Medication
  onSave: (medication: Omit<Medication, 'id' | 'order'>) => void
}

export function MedicationForm({
  open,
  onOpenChange,
  stages,
  medication,
  onSave,
}: MedicationFormProps) {
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [intakes, setIntakes] = useState<MedicationIntake[]>([])
  const [useUniformDose, setUseUniformDose] = useState(false)

  useEffect(() => {
    if (open) {
      if (medication) {
        setName(medication.name)
        setStartDate(new Date(medication.startDate))
        setEndDate(medication.endDate ? new Date(medication.endDate) : null)
        setIntakes(medication.intakes)

        // Проверяем, имеют ли все этапы одинаковую дозу
        const firstIntake = medication.intakes[0]
        const allSame = medication.intakes.length === stages.length &&
          Boolean(firstIntake?.quantity) &&
          medication.intakes.every(i =>
            i.quantity === firstIntake?.quantity &&
            i.recommendations === firstIntake?.recommendations
          )
        setUseUniformDose(allSame)
      } else {
        setName('')
        setStartDate(new Date())
        setEndDate(null)
        setIntakes([])
        setUseUniformDose(false)
      }
    }
  }, [open, medication, stages.length])

  const handleSave = () => {
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      startDate: startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
      intakes,
    })

    handleClose()
  }

  const handleClose = () => {
    setName('')
    setStartDate(new Date())
    setEndDate(null)
    setIntakes([])
    onOpenChange(false)
  }

  const handleIntakeChange = (stageId: string, field: 'quantity' | 'recommendations', value: string) => {
    setIntakes((prev) => {
      const existing = prev.find((i) => i.stageId === stageId)
      if (existing) {
        return prev.map((i) =>
          i.stageId === stageId ? { ...i, [field]: value } : i
        )
      } else {
        return [...prev, { stageId, quantity: '', recommendations: '', [field]: value }]
      }
    })
  }

  const getIntakeForStage = (stageId: string): MedicationIntake | undefined => {
    return intakes.find((i) => i.stageId === stageId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={handleClose} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {medication ? 'Редагувати препарат' : 'Додати препарат'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Назва препарату *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Наприклад: Вітамін D3"
            />
          </div>

          <div>
            <Label className="block mb-2">Період прийому</Label>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(dates) => {
                const [start, end] = dates as [Date | null, Date | null]
                setStartDate(start || new Date())
                setEndDate(end)
              }}
              dateFormat="dd.MM.yyyy"
              placeholderText="Оберіть період прийому"
              className="flex h-9 w-full rounded-md border border-green-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-400"
              locale="uk"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Режим прийому</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useUniformDose}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setUseUniformDose(checked)
                    if (checked && intakes.length > 0) {
                      // Применяем первую дозу ко всем этапам
                      const firstIntake = intakes[0]
                      if (firstIntake) {
                        setIntakes(stages.map(stage => ({
                          stageId: stage.id,
                          quantity: firstIntake.quantity,
                          recommendations: firstIntake.recommendations || '',
                        })))
                      }
                    }
                  }}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Однакова доза для всіх етапів</span>
              </label>
            </div>

            {useUniformDose ? (
              <div className="border rounded-lg p-4 bg-green-50">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="uniform-quantity" className="text-xs">
                      Кількість
                    </Label>
                    <Input
                      id="uniform-quantity"
                      value={intakes[0]?.quantity || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setIntakes(stages.map(stage => ({
                          stageId: stage.id,
                          quantity: value,
                          recommendations: intakes[0]?.recommendations || '',
                        })))
                      }}
                      placeholder="Наприклад: 2 чайні ложки"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="uniform-recommendations" className="text-xs">
                      Рекомендації
                    </Label>
                    <Input
                      id="uniform-recommendations"
                      value={intakes[0]?.recommendations || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setIntakes(stages.map(stage => ({
                          stageId: stage.id,
                          quantity: intakes[0]?.quantity || '',
                          recommendations: value,
                        })))
                      }}
                      placeholder="Наприклад: можна до будь-якого прийому їжі"
                      className="h-8"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Це дозування буде застосовано до всіх етапів прийому
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stages.map((stage) => {
                  const intake = getIntakeForStage(stage.id)
                  return (
                    <div key={stage.id} className="border rounded-lg p-3 bg-green-50">
                      <div className="font-medium text-sm text-gray-700 mb-2">
                        {stage.name}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`quantity-${stage.id}`} className="text-xs">
                            Кількість
                          </Label>
                          <Input
                            id={`quantity-${stage.id}`}
                            value={intake?.quantity || ''}
                            onChange={(e) =>
                              handleIntakeChange(stage.id, 'quantity', e.target.value)
                            }
                            placeholder="Наприклад: 1 таблетка"
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`recommendations-${stage.id}`} className="text-xs">
                            Рекомендації
                          </Label>
                          <Input
                            id={`recommendations-${stage.id}`}
                            value={intake?.recommendations || ''}
                            onChange={(e) =>
                              handleIntakeChange(stage.id, 'recommendations', e.target.value)
                            }
                            placeholder="Наприклад: з їжею"
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Скасувати
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
