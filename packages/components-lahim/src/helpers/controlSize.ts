export function getControlSize(size?: 'small' | 'large'): 'sm' | 'lg' | undefined {
  if (size === 'small') {
    return 'sm'
  }
  if (size === 'large') {
    return 'lg'
  }
  return undefined
}

