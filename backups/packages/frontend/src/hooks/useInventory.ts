import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const apiUrl = process.env.REACT_APP_HOSPITALRUN_API || 'http://localhost:3000'

export interface InventoryItem {
  id?: string
  _id?: string
  itemCode?: string
  itemName?: string
  category?: 'reagent' | 'consumable' | 'supply' | 'equipment' | 'other'
  description?: string
  manufacturer?: string
  unit?: string
  unitCost?: number
  storageConditions?: string
  shelfLife?: number
  reorderPoint?: number
  reorderQuantity?: number
  active?: boolean
}

export interface StockLevel {
  itemId?: string
  itemCode?: string
  itemName?: string
  location?: string
  quantity?: number
  unit?: string
  lotNumber?: string
  expirationDate?: string
  status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired' | 'expiring_soon'
}

export interface InventoryTransaction {
  id?: string
  _id?: string
  itemId?: string
  itemCode?: string
  itemName?: string
  transactionType?: 'receive' | 'issue' | 'transfer' | 'adjust' | 'expired' | 'waste'
  quantity?: number
  location?: string
  lotNumber?: string
  expirationDate?: string
  reference?: string
  notes?: string
  performedBy?: string
  timestamp?: string
}

interface UseInventoryItemsParams {
  itemCode?: string
  category?: string
  active?: boolean
}

export const useInventoryItems = (params: UseInventoryItemsParams = {}) => {
  const queryParams = new URLSearchParams()
  if (params.itemCode) queryParams.append('itemCode', params.itemCode)
  if (params.category) queryParams.append('category', params.category)
  if (params.active !== undefined) queryParams.append('active', String(params.active))

  const queryString = queryParams.toString()
  const url = `${apiUrl}/inventory/items${queryString ? `?${queryString}` : ''}`

  return useQuery<InventoryItem[]>({
    queryKey: ['inventory-items', params],
    queryFn: async () => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch inventory items: ${response.statusText}`)
      }
      const data = await response.json()
      return Array.isArray(data) ? data : data.items || []
    },
  })
}

export const useInventoryItem = (id: string | undefined) => {
  return useQuery<InventoryItem>({
    queryKey: ['inventory-item', id],
    queryFn: async () => {
      if (!id) throw new Error('Inventory item ID is required')
      const response = await fetch(`${apiUrl}/inventory/items/${id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch inventory item: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!id,
  })
}

export const useStockLevels = (params: { location?: string; lowStockOnly?: boolean; expiringSoon?: boolean } = {}) => {
  const queryParams = new URLSearchParams()
  if (params.location) queryParams.append('location', params.location)
  if (params.lowStockOnly) queryParams.append('lowStockOnly', 'true')
  if (params.expiringSoon) queryParams.append('expiringSoon', 'true')

  const queryString = queryParams.toString()
  const url = `${apiUrl}/inventory/stock-levels${queryString ? `?${queryString}` : ''}`

  return useQuery<StockLevel[]>({
    queryKey: ['stock-levels', params],
    queryFn: async () => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch stock levels: ${response.statusText}`)
      }
      const data = await response.json()
      return Array.isArray(data) ? data : data.levels || []
    },
  })
}

export const useInventoryTransactions = (params: { itemId?: string; location?: string } = {}) => {
  const queryParams = new URLSearchParams()
  if (params.itemId) queryParams.append('itemId', params.itemId)
  if (params.location) queryParams.append('location', params.location)

  const queryString = queryParams.toString()
  const url = `${apiUrl}/inventory/transactions${queryString ? `?${queryString}` : ''}`

  return useQuery<InventoryTransaction[]>({
    queryKey: ['inventory-transactions', params],
    queryFn: async () => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch inventory transactions: ${response.statusText}`)
      }
      const data = await response.json()
      return Array.isArray(data) ? data : data.transactions || []
    },
  })
}

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient()

  return useMutation<InventoryItem, Error, Partial<InventoryItem>>({
    mutationFn: async (data) => {
      const response = await fetch(`${apiUrl}/inventory/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `Failed to create inventory item: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      queryClient.invalidateQueries({ queryKey: ['stock-levels'] })
    },
  })
}

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient()

  return useMutation<InventoryItem, Error, { id: string; data: Partial<InventoryItem> }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`${apiUrl}/inventory/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `Failed to update inventory item: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      queryClient.invalidateQueries({ queryKey: ['stock-levels'] })
    },
  })
}

export const useReceiveInventory = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, { itemId: string; quantity: number; location: string; lotNumber?: string; expirationDate?: string; notes?: string }>({
    mutationFn: async (data) => {
      const response = await fetch(`${apiUrl}/inventory/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `Failed to receive inventory: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-levels'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] })
    },
  })
}

export const useIssueInventory = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, { itemId: string; quantity: number; location: string; reference?: string; notes?: string }>({
    mutationFn: async (data) => {
      const response = await fetch(`${apiUrl}/inventory/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `Failed to issue inventory: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-levels'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] })
    },
  })
}

export const useTransferInventory = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, { itemId: string; quantity: number; fromLocation: string; toLocation: string; notes?: string }>({
    mutationFn: async (data) => {
      const response = await fetch(`${apiUrl}/inventory/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `Failed to transfer inventory: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-levels'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] })
    },
  })
}

export const useAdjustInventory = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, { itemId: string; quantity: number; location: string; reason: string; notes?: string }>({
    mutationFn: async (data) => {
      const response = await fetch(`${apiUrl}/inventory/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `Failed to adjust inventory: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-levels'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] })
    },
  })
}

