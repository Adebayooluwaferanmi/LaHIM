import React from 'react'

export interface TabsHeaderProps {
  /** The children to render */
  children?: React.ReactNode
}

const TabsHeader = (props: TabsHeaderProps) => {
  const { children } = props

  return (
    <ul className="nav nav-tabs" role="tablist">
      {children}
    </ul>
  )
}

export { TabsHeader }
export type { TabsHeaderProps }

