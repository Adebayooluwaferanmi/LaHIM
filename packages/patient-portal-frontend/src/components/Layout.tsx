import { ReactNode } from 'react'
import Navigation from './Navigation'
import { Container } from '@lahim/components'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navigation />
      <Container fluid style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        {children}
      </Container>
    </div>
  )
}


