import { useState } from 'react'
import { Pencil, Trash2, Plus, GripVertical, X } from 'lucide-react'
import type { IntakeStage } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from './ui/alert-dialog'

interface StageManagerProps {
  stages: IntakeStage[]
  onAddStage: (name: string) => void
  onUpdateStage: (stageId: string, name: string) => void
  onDeleteStage: (stageId: string) => void
  onReorderStages: (stages: IntakeStage[]) => void
  onClose: () => void
}

export function StageManager({
  stages,
  onAddStage,
  onUpdateStage,
  onDeleteStage,
  onReorderStages,
  onClose,
}: StageManagerProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [editingStage, setEditingStage] = useState<IntakeStage | null>(null)
  const [stageName, setStageName] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; stageId?: string; stageName?: string }>({
    open: false,
  })

  const handleSave = () => {
    if (!stageName.trim()) return

    if (editingStage) {
      onUpdateStage(editingStage.id, stageName)
    } else {
      onAddStage(stageName)
    }

    setShowDialog(false)
    setStageName('')
    setEditingStage(null)
  }

  const handleEdit = (stage: IntakeStage) => {
    setEditingStage(stage)
    setStageName(stage.name)
    setShowDialog(true)
  }

  const handleAdd = () => {
    setEditingStage(null)
    setStageName('')
    setShowDialog(true)
  }

  const handleDeleteClick = (stageId: string, stageName: string) => {
    setDeleteDialog({ open: true, stageId, stageName })
  }

  const handleDeleteConfirm = () => {
    if (deleteDialog.stageId) {
      onDeleteStage(deleteDialog.stageId)
    }
    setDeleteDialog({ open: false })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newStages = [...stages]
    const draggedStage = newStages[draggedIndex]
    newStages.splice(draggedIndex, 1)
    newStages.splice(index, 0, draggedStage)

    onReorderStages(newStages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const sortedStages = [...stages].sort((a, b) => a.order - b.order)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 bg-green-50">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Етапи прийому</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-10 sm:w-10"
          onClick={onClose}
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="mb-3 sm:mb-4">
          <Button onClick={handleAdd} className="w-full text-sm">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            Додати новий етап
          </Button>
        </div>

        <div className="space-y-2">
          {sortedStages.map((stage, index) => (
            <div
              key={stage.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg bg-green-50 border border-green-200 cursor-move transition-all hover:bg-green-100 hover:shadow-sm ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <span className="flex-1 text-xs sm:text-sm font-medium text-gray-900">{stage.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-9 sm:w-9"
                onClick={() => handleEdit(stage)}
              >
                <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-9 sm:w-9"
                onClick={() => handleDeleteClick(stage.id, stage.name)}
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent onClose={() => setShowDialog(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingStage ? 'Редагувати етап' : 'Додати етап'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Назва етапу
              </label>
              <Input
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="Наприклад: До сніданку"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Скасувати
            </Button>
            <Button onClick={handleSave}>
              Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити етап прийому?</AlertDialogTitle>
            <AlertDialogDescription>
              Ви впевнені, що хочете видалити етап "{deleteDialog.stageName}"? Усі дані про прийом препаратів у цьому етапі будуть видалені. Цю дію не можна скасувати.
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
