import React from 'react'
import { Label } from '@hospitalrun/components'

interface Props {
  name: string
  label: string
  value: Date | undefined
  isEditable?: boolean
  onChange?: (date: Date) => void
  isRequired?: boolean
  feedback?: string
  isInvalid?: boolean
  maxDate?: Date
}

const DatePickerWithLabelFormGroup = (props: Props) => {
  const {
    onChange,
    label,
    name,
    isEditable,
    value,
    isRequired,
    feedback,
    isInvalid,
    maxDate,
  } = props
  const id = `${name}DatePicker`
  
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const formatMaxDate = (date: Date | undefined): string => {
    if (!date) return ''
    return formatDateForInput(date)
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange && e.target.value) {
      onChange(new Date(e.target.value))
    } else if (onChange) {
      onChange(new Date())
    }
  }

  return (
    <div className="form-group">
      <Label text={label} htmlFor={id} isRequired={isRequired} />
      <input
        type="date"
        id={id}
        className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
        value={formatDateForInput(value)}
        onChange={handleChange}
        disabled={!isEditable}
        max={formatMaxDate(maxDate)}
      />
      {isInvalid && feedback && (
        <div className="invalid-feedback d-block">{feedback}</div>
      )}
    </div>
  )
}

export default DatePickerWithLabelFormGroup

