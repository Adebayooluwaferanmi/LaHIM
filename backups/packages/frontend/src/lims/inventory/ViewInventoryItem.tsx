import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Container, Row, Column, Spinner, Alert, Badge } from '@hospitalrun/components'
import { useInventoryItem, useStockLevels, useInventoryTransactions } from '../../hooks/useInventory'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'

const ViewInventoryItem = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: item, isLoading, error } = useInventoryItem(id)
  const { data: stockLevels = [] } = useStockLevels({})
  const { data: transactions = [] } = useInventoryTransactions({ itemId: id })
  const setButtonToolBar = useButtonToolbarSetter()

  useTitle(item ? `${t('lims.inventory.viewItem', 'View Inventory Item')} - ${item.itemName || id}` : t('lims.inventory.viewItem', 'View Inventory Item'))

  useEffect(() => {
    if (item) {
      useAddBreadcrumbs([
        { i18nKey: 'lims.inventory.items', location: '/lims/inventory/items' },
        { i18nKey: 'lims.inventory.viewItem', location: `/lims/inventory/items/${id}` },
      ], true)
    }
  }, [item, id])

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate('/lims/inventory/items')}
      >
        {t('actions.back', 'Back')}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  if (error || !item) {
    return (
      <Container>
        <Alert color="danger" title={t('states.error', 'Error')} message={error?.message || t('lims.inventory.notFound', 'Inventory item not found')} />
      </Container>
    )
  }

  const itemStockLevels = stockLevels.filter((level) => level.itemId === id)

  return (
    <Container>
      <Panel>
        <Panel.Header title={`${t('lims.inventory.viewItem', 'View Inventory Item')} - ${item.itemName || id}`} />
        <Panel.Body>
          <Row>
            <Column md={6}>
              <h4>{t('lims.inventory.itemInformation', 'Item Information')}</h4>
              <table className="table">
                <tbody>
                  <tr>
                    <td><strong>{t('lims.inventory.itemCode', 'Item Code')}</strong></td>
                    <td>{item.itemCode || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.inventory.itemName', 'Item Name')}</strong></td>
                    <td>{item.itemName || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.inventory.category', 'Category')}</strong></td>
                    <td>{item.category || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.inventory.unit', 'Unit')}</strong></td>
                    <td>{item.unit || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.inventory.unitCost', 'Unit Cost')}</strong></td>
                    <td>{item.unitCost ? `$${item.unitCost.toFixed(2)}` : '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.inventory.reorderPoint', 'Reorder Point')}</strong></td>
                    <td>{item.reorderPoint || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.inventory.status', 'Status')}</strong></td>
                    <td>
                      <Badge color={item.active ? 'success' : 'secondary'}>
                        {item.active ? t('lims.inventory.active', 'Active') : t('lims.inventory.inactive', 'Inactive')}
                      </Badge>
                    </td>
                  </tr>
                  {item.description && (
                    <tr>
                      <td><strong>{t('lims.inventory.description', 'Description')}</strong></td>
                      <td>{item.description}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Column>
            <Column md={6}>
              <h4>{t('lims.inventory.stockLevels', 'Stock Levels')}</h4>
              {itemStockLevels.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t('lims.inventory.location', 'Location')}</th>
                      <th>{t('lims.inventory.quantity', 'Quantity')}</th>
                      <th>{t('lims.inventory.status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemStockLevels.map((level, index) => (
                      <tr key={index}>
                        <td>{level.location || '-'}</td>
                        <td>{level.quantity || 0} {level.unit || ''}</td>
                        <td>
                          <Badge color={level.status === 'in_stock' ? 'success' : level.status === 'low_stock' ? 'warning' : 'danger'}>
                            {level.status || '-'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>{t('lims.inventory.noStockLevels', 'No stock levels found')}</p>
              )}
            </Column>
          </Row>

          {transactions.length > 0 && (
            <Row>
              <Column md={12}>
                <h4>{t('lims.inventory.recentTransactions', 'Recent Transactions')}</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t('lims.inventory.transactionType', 'Type')}</th>
                      <th>{t('lims.inventory.quantity', 'Quantity')}</th>
                      <th>{t('lims.inventory.location', 'Location')}</th>
                      <th>{t('lims.inventory.timestamp', 'Timestamp')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.id || transaction._id}>
                        <td>{transaction.transactionType || '-'}</td>
                        <td>{transaction.quantity || 0}</td>
                        <td>{transaction.location || '-'}</td>
                        <td>{transaction.timestamp ? new Date(transaction.timestamp).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Column>
            </Row>
          )}
        </Panel.Body>
      </Panel>
    </Container>
  )
}

export default ViewInventoryItem

