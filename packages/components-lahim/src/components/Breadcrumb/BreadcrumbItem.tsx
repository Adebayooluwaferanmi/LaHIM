import React, { CSSProperties } from 'react'
import BootstrapBreadcrumbItem from 'react-bootstrap/BreadcrumbItem'

export interface BreadcrumbItemProps {
  /** The children to render */
  children?: React.ReactNode
  /** Adds active class and renders wraps children in span */
  active?: boolean
  /** Adds custom event */
  onClick?: (event: React.MouseEvent) => void
  /**
   * Defines the class of the Breadcrumb Item.
   */
  className?: string
  /**
   * Defines the style of the Breadcrumb Item.
   */
  style?: CSSProperties
}

const BreadcrumbItem = (props: BreadcrumbItemProps) => {
  const { children, active, onClick, className, style } = props
  return (
    <BootstrapBreadcrumbItem active={active} onClick={onClick} className={className} style={style}>
      {children}
    </BootstrapBreadcrumbItem>
  )
}

export { BreadcrumbItem }
export type { BreadcrumbItemProps }

