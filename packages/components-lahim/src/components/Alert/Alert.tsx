import React, { ReactNode, CSSProperties, useState } from 'react'
import BootstrapAlert from 'react-bootstrap/Alert'
import { ColorVariant } from '../../interfaces'
import { Button } from '../Button'

export interface AlertProps {
  /**
   * Defines the color of the alert. Defaults to primary.
   * @default "primary"
   */
  color?: ColorVariant
  /** Defines the title of the alert. */
  title?: string
  /** Defines the message of the alert. */
  message?: ReactNode
  /** Defines if the alert should be dismissible. Defaults to false. */
  dismissible?: boolean
  /**
   * Defines the label of the close button if the alert is dismissible.
   * @default "Dismiss"
   */
  closeLabel?: string
  /**
   * Defines the class of the alert
   */
  className?: string
  /**
   * Defines the style of the alert
   */
  style?: CSSProperties
  /**
   * Defines the class of the close button
   */
  btnClassName?: string
  /**
   * Defines the style of the close button
   */
  btnStyle?: CSSProperties
}

/**
 * Alerts can provide contextual feedback messages for typical user actions
 * with the handful of available and flexible alert messages.
 */
const Alert = (props: AlertProps) => {
  const {
    color = 'primary',
    title,
    message,
    dismissible = false,
    closeLabel = 'Dismiss',
    className,
    style,
    btnClassName,
    btnStyle,
  } = props

  const [show, setShow] = useState(true)

  if (!show) {
    return null
  }

  return (
    <BootstrapAlert
      variant={color}
      onClose={() => setShow(false)}
      dismissible={dismissible}
      closeLabel={closeLabel}
      className={className}
      style={style}
    >
      {title && <BootstrapAlert.Heading>{title}</BootstrapAlert.Heading>}
      {message && <div>{message}</div>}
      {dismissible && (
        <>
          <hr />
          <div className="d-flex justify-content-end">
            <Button
              outlined
              onClick={() => setShow(false)}
              color={color}
              className={btnClassName}
              style={btnStyle}
            >
              {closeLabel}
            </Button>
          </div>
        </>
      )}
    </BootstrapAlert>
  )
}

export { Alert }
export type { AlertProps }

