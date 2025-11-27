import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput } from '@hospitalrun/components'
import { useInventoryItems } from '../../hooks/useInventory'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'

const InventoryItems = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.inventory.items', 'Inventory Items'))
  const setButtonToolBar = useButtonToolbarSetter()

  const [itemCodeFilter, setItemCodeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const { data: items = [], isLoading, error } = useInventoryItems({
    itemCode: itemCodeFilter || undefined,
    category: categoryFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newItemButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/lims/inventory/items/new')}
      >
        {t('lims.inventory.newItem', 'New Inventory Item')}
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

  return (
    <Container>
      <Row>
        <Column md={6}>
          <TextInput
            placeholder={t('lims.inventory.searchItemCode', 'Search by Item Code')}
            value={itemCodeFilter}
            onChange={(e) => setItemCodeFilter(e.target.value)}
          />
        </Column>
        <Column md={6}>
          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">{t('lims.inventory.allCategories', 'All Categories')}</option>
            <option value="reagent">{t('lims.inventory.category.reagent', 'Reagent')}</option>
            <option value="consumable">{t('lims.inventory.category.consumable', 'Consumable')}</option>
            <option value="supply">{t('lims.inventory.category.supply', 'Supply')}</option>
            <option value="equipment">{t('lims.inventory.category.equipment', 'Equipment')}</option>
            <option value="other">{t('lims.inventory.category.other', 'Other')}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          {items.length === 0 ? (
            <div>{t('lims.inventory.noItems', 'No inventory items found')}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{t('lims.inventory.itemCode', 'Item Code')}</th>
                  <th>{t('lims.inventory.itemName', 'Item Name')}</th>
                  <th>{t('lims.inventory.category', 'Category')}</th>
                  <th>{t('lims.inventory.unit', 'Unit')}</th>
                  <th>{t('lims.inventory.unitCost', 'Unit Cost')}</th>
                  <th>{t('lims.inventory.reorderPoint', 'Reorder Point')}</th>
                  <th>{t('lims.inventory.status', 'Status')}</th>
                  <th>{t('actions.view', 'View')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id || item._id}>
                    <td>{item.itemCode || '-'}</td>
                    <td>{item.itemName || '-'}</td>
                    <td>{item.category || '-'}</td>
                    <td>{item.unit || '-'}</td>
                    <td>{item.unitCost ? `$${item.unitCost.toFixed(2)}` : '-'}</td>
                    <td>{item.reorderPoint || '-'}</td>
                    <td>
                      <span className={`badge badge-${item.active ? 'success' : 'secondary'}`}>
                        {item.active ? t('lims.inventory.active', 'Active') : t('lims.inventory.inactive', 'Inactive')}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/inventory/items/${item.id || item._id}`)}
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

export default InventoryItems

