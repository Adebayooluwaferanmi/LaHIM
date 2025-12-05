import { IconPrefix, IconName, SizeProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { CSSProperties } from 'react'
import { IconType } from '../../interfaces'

// Maps between hospital run icon names and font awesome
const iconMap: Record<IconType, string> = {
  add: 'plus',
  admin: 'user-shield',
  appointment: 'calendar',
  'appointment-add': 'calendar-plus',
  'appointment-remove': 'calendar-minus',
  calendar: 'calendar-alt',
  billing: 'file-invoice-dollar',
  dashboard: 'columns',
  'down-arrow': 'chevron-down',
  edit: 'edit',
  image: 'camera',
  incident: 'file-alt',
  inventory: 'boxes',
  lab: 'microscope',
  'left-arrow': 'chevron-left',
  logout: 'sign-out-alt',
  medication: 'pills',
  menu: 'bars',
  patient: 'user',
  'patient-add': 'user-plus',
  'patient-remove': 'user-minus',
  patients: 'users',
  remove: 'minus',
  'right-arrow': 'chevron-right',
  save: 'save',
  setting: 'cog',
  'up-arrow': 'chevron-up',
}

function getFontAwesomeIcon(icon: IconType): string {
  return iconMap[icon] || icon
}

interface IconProps {
  /** The type of icon to display */
  icon: IconType
  size?: SizeProp
  /** Outline version or filled-in version. Note some icons may be missing outline version. */
  outline?: boolean
  /**
   * Defines the class of the icon.
   */
  className?: string
  /**
   * Defines the style of the icon.
   */
  style?: CSSProperties
  /** Function to execute when user clicks on icon */
  onClick?: (event: React.MouseEvent<any>) => void
  /** ARIA attributes */
  'aria-controls'?: string
  'aria-expanded'?: boolean
}

/**
 * Icons provide contextual clues to users to make it easier to recognize functionality
 */
const Icon = (props: IconProps) => {
  const { icon, outline = false, className, style, onClick, size, ...ariaProps } = props
  const iconPrefix = (outline ? 'far' : 'fas') as IconPrefix
  const faIconName = getFontAwesomeIcon(icon) as IconName

  return (
    <FontAwesomeIcon
      onClick={onClick}
      icon={[iconPrefix, faIconName]}
      size={size}
      className={className}
      style={style}
      {...ariaProps}
    />
  )
}

export { Icon }
export type { IconProps }

