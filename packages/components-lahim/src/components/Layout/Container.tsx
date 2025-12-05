import React, { CSSProperties } from 'react'
import BootstrapContainer from 'react-bootstrap/Container'

interface ContainerProps {
  /**
   * A custom element to be used for the component
   * @default <div>
   */
  as?: React.ElementType
  /**
   * Allow the Container to fill all of its available horizontal space
   * @default false
   */
  fluid?: boolean
  /**
   * A custom class to be used for the component
   */
  className?: string
  /**
   * `ReactNode` elements to be wrapped in the component
   */
  children?: React.ReactNode
  /**
   * Defines the style of the container.
   */
  style?: CSSProperties
}

const Container = (props: ContainerProps) => {
  const { as, fluid, className, children, style } = props

  return (
    <BootstrapContainer as={as} fluid={fluid} className={className} style={style}>
      {children}
    </BootstrapContainer>
  )
}

export { Container }
export type { ContainerProps }

