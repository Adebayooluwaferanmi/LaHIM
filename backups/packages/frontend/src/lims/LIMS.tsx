import React from 'react'
import { Routes, Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'

// Lab Orders
import LabOrders from './lab-orders/LabOrders'
import NewLabOrder from './lab-orders/NewLabOrder'
import ViewLabOrder from './lab-orders/ViewLabOrder'

// Specimens
import Specimens from './specimens/Specimens'
import ViewSpecimen from './specimens/ViewSpecimen'

// Worklists
import Worklists from './worklists/Worklists'
import ViewWorklist from './worklists/ViewWorklist'

// Instruments
import Instruments from './instruments/Instruments'
import ViewInstrument from './instruments/ViewInstrument'

// QC Results
import QCResults from './qc-results/QCResults'
import NewQCResult from './qc-results/NewQCResult'
import ViewQCResult from './qc-results/ViewQCResult'

// Reports
import Reports from './reports/Reports'
import GenerateReport from './reports/GenerateReport'
import ViewReport from './reports/ViewReport'

// Inventory
import InventoryItems from './inventory/InventoryItems'
import NewInventoryItem from './inventory/NewInventoryItem'
import ViewInventoryItem from './inventory/ViewInventoryItem'
import StockLevels from './inventory/StockLevels'
import ReceiveInventory from './inventory/ReceiveInventory'
import IssueInventory from './inventory/IssueInventory'

const LIMS = () => {
  return (
    <Routes>
      {/* Lab Orders Routes */}
      <Route path="lab-orders" element={<PrivateRoute isAuthenticated={true}><LabOrders /></PrivateRoute>} />
      <Route path="lab-orders/new" element={<PrivateRoute isAuthenticated={true}><NewLabOrder /></PrivateRoute>} />
      <Route path="lab-orders/:id" element={<PrivateRoute isAuthenticated={true}><ViewLabOrder /></PrivateRoute>} />

      {/* Specimens Routes */}
      <Route path="specimens" element={<PrivateRoute isAuthenticated={true}><Specimens /></PrivateRoute>} />
      <Route path="specimens/:id" element={<PrivateRoute isAuthenticated={true}><ViewSpecimen /></PrivateRoute>} />

      {/* Worklists Routes */}
      <Route path="worklists" element={<PrivateRoute isAuthenticated={true}><Worklists /></PrivateRoute>} />
      <Route path="worklists/:id" element={<PrivateRoute isAuthenticated={true}><ViewWorklist /></PrivateRoute>} />

      {/* Instruments Routes */}
      <Route path="instruments" element={<PrivateRoute isAuthenticated={true}><Instruments /></PrivateRoute>} />
      <Route path="instruments/:id" element={<PrivateRoute isAuthenticated={true}><ViewInstrument /></PrivateRoute>} />

      {/* QC Results Routes */}
      <Route path="qc-results" element={<PrivateRoute isAuthenticated={true}><QCResults /></PrivateRoute>} />
      <Route path="qc-results/new" element={<PrivateRoute isAuthenticated={true}><NewQCResult /></PrivateRoute>} />
      <Route path="qc-results/:id" element={<PrivateRoute isAuthenticated={true}><ViewQCResult /></PrivateRoute>} />

      {/* Reports Routes */}
      <Route path="reports" element={<PrivateRoute isAuthenticated={true}><Reports /></PrivateRoute>} />
      <Route path="reports/generate" element={<PrivateRoute isAuthenticated={true}><GenerateReport /></PrivateRoute>} />
      <Route path="reports/:id" element={<PrivateRoute isAuthenticated={true}><ViewReport /></PrivateRoute>} />

      {/* Inventory Routes */}
      <Route path="inventory/items" element={<PrivateRoute isAuthenticated={true}><InventoryItems /></PrivateRoute>} />
      <Route path="inventory/items/new" element={<PrivateRoute isAuthenticated={true}><NewInventoryItem /></PrivateRoute>} />
      <Route path="inventory/items/:id" element={<PrivateRoute isAuthenticated={true}><ViewInventoryItem /></PrivateRoute>} />
      <Route path="inventory/stock-levels" element={<PrivateRoute isAuthenticated={true}><StockLevels /></PrivateRoute>} />
      <Route path="inventory/receive" element={<PrivateRoute isAuthenticated={true}><ReceiveInventory /></PrivateRoute>} />
      <Route path="inventory/issue" element={<PrivateRoute isAuthenticated={true}><IssueInventory /></PrivateRoute>} />

      {/* Default route - redirect to lab-orders */}
      <Route path="" element={<PrivateRoute isAuthenticated={true}><LabOrders /></PrivateRoute>} />
      <Route path="*" element={<PrivateRoute isAuthenticated={true}><LabOrders /></PrivateRoute>} />
    </Routes>
  )
}

export default LIMS

