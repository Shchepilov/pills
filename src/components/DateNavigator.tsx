import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Button } from './ui/button'

interface DateNavigatorProps {
  currentDate: string
  onDateChange: (date: string) => void
}

export function DateNavigator({ currentDate, onDateChange }: DateNavigatorProps) {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const date = new Date(currentDate)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false)
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

  const formatDate = (d: Date, short: boolean = false): string => {
    if (short) {
      return d.toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'short',
      })
    }
    return d.toLocaleDateString('uk-UA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const changeDate = (days: number) => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + days)
    onDateChange(newDate.toISOString().split('T')[0])
  }

  const goToToday = () => {
    onDateChange(new Date().toISOString().split('T')[0])
  }

  const handleDateSelect = (selectedDate: Date | null) => {
    if (selectedDate) {
      onDateChange(selectedDate.toISOString().split('T')[0])
      setShowPicker(false)
    }
  }

  const isToday = currentDate === new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white sm:rounded-lg sm:shadow-md sm:border sm:border-gray-200 sm:p-4 mb-3 sm:mb-4">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-10 sm:w-10"
          onClick={() => changeDate(-1)}
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        <div className="flex-1 text-center relative" ref={pickerRef}>
          <div
            className="text-sm sm:text-lg font-semibold text-green-600 hover:text-green-700 underline cursor-pointer transition-colors"
            onClick={() => setShowPicker(!showPicker)}
          >
            {formatDate(date)}
          </div>
          {showPicker && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
              <DatePicker
                selected={date}
                onChange={handleDateSelect}
                inline
                locale="uk"
                calendarClassName="custom-datepicker"
              />
            </div>
          )}
          {!isToday && (
            <button
              onClick={goToToday}
              className="text-xs sm:text-sm text-green-600 hover:text-green-700 underline mt-0.5 sm:mt-1"
            >
              <span className="hidden sm:inline">Повернутися до сьогодні</span>
              <span className="sm:hidden">Сьогодні</span>
            </button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-10 sm:w-10"
          onClick={() => changeDate(1)}
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  )
}
