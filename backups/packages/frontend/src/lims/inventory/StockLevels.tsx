import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, Badge, Alert } from '@hospitalrun/components'
import { useStockLevels } from '../../hooks/useInventory'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'

const StockLevels = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.inventory.stockLevels', 'Stock Levels'))
  const setButtonToolBar = useButtonToolbarSetter()

  const [locationFilter, setLocationFilter] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [expiringSoon, setExpiringSoon] = useState(false)

  const { data: stockLevels = [], isLoading, error } = useStockLevels({
    location: locationFilter || undefined,
    lowStockOnly,
    expiringSoon,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="receiveButton"
        color="primary"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/lims/inventory/receive')}
      >
        {t('lims.inventory.receive', 'Receive Inventory')}
      </Button>,
      <Button
        key="issueButton"
        color="secondary"
        icon="remove"
        iconLocation="left"
        onClick={() => navigate('/lims/inventory/issue')}
      >
        {t('lims.inventory.issue', 'Issue Inventory')}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  const lowStockCount = stockLevels.filter((level) => level.status === 'low_stock' || level.status === 'out_of_stock').length

  return (
    <Container>
      {lowStockCount > 0 && (
        <Row>
          <Column>
            <Alert color="warning" title={t('lims.inventory.lowStockAlert', 'Low Stock Alert')} message={t('lims.inventory.lowStockMessage', '{{count}} item(s) are low or out of stock', { count: lowStockCount })} />
          </Column>
        </Row>
      )}

      <Row>
        <Column md={4}>
          <select
            className="form-control"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">{t('lims.inventory.allLocations', 'All Locations')}</option>
            <option value="main">{t('lims.inventory.location.main', 'Main')}</option>
            <option value="chemistry">{t('lims.inventory.location.chemistry', 'Chemistry')}</option>
            <option value="hematology">{t('lims.inventory.location.hematology', 'Hematology')}</option>
            <option value="microbiology">{t('lims.inventory.location.microbiology', 'Microbiology')}</option>
            <option value="storage">{t('lims.inventory.location.storage', 'Storage')}</option>
          </select>
        </Column>
        <Column md={4}>
          <label>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />{' '}
            {t('lims.inventory.lowStockOnly', 'Low Stock Only')}
          </label>
        </Column>
        <Column md={4}>
          <label>
            <input
              type="checkbox"
              checked={expiringSoon}
              onChange={(e) => setExpiringSoon(e.target.checked)}
            />{' '}
            {t('lims.inventory.expiringSoon', 'Expiring Soon')}
          </label>
        </Column>
      </Row>

      <Row>
        <Column>
          {stockLevels.length === 0 ? (
            <div>{t('lims.inventory.noStockLevels', 'No stock levels found')}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{t('lims.inventory.itemCode', 'Item Code')}</th>
                  <th>{t('lims.inventory.itemName', 'Item Name')}</th>
                  <th>{t('lims.inventory.location', 'Location')}</th>
                  <th>{t('lims.inventory.quantity', 'Quantity')}</th>
                  <th>{t('lims.inventory.unit', 'Unit')}</th>
                  <th>{t('lims.inventory.lotNumber', 'Lot Number')}</th>
                  <th>{t('lims.inventory.expirationDate', 'Expiration Date')}</th>
                  <th>{t('lims.inventory.status', 'Status')}</th>
                  <th>{t('actions.view', 'View')}</th>
                </tr>
              </thead>
              <tbody>
                {stockLevels.map((level, index) => (
                  <tr key={index}>
                    <td>{level.itemCode || '-'}</td>
                    <td>{level.itemName || '-'}</td>
                    <td>{level.location || '-'}</td>
                    <td>{level.quantity || 0}</td>
                    <td>{level.unit || '-'}</td>
                    <td>{level.lotNumber || '-'}</td>
                    <td>{level.expirationDate ? new Date(level.expirationDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <Badge color={level.status === 'in_stock' ? 'success' : level.status === 'low_stock' ? 'warning' : 'danger'}>
                        {level.status || '-'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/inventory/items/${level.itemId}`)}
                      >
                        {t('actions.view', 'View')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Column>
      </Row>
    </Container>
  )
}

export default StockLevels

