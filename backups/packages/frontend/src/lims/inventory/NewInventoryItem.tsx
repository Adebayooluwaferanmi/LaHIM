import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@hospitalrun/components'
import { useCreateInventoryItem } from '../../hooks/useInventory'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import SelectWithLabelFormGroup from '../../components/input/SelectWithLableFormGroup'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'

const breadcrumbs = [{ i18nKey: 'lims.inventory.newItem', location: '/lims/inventory/items/new' }]

const NewInventoryItem = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.inventory.newItem', 'New Inventory Item'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: createItem, isPending: isLoading, error } = useCreateInventoryItem()

  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: '',
    category: 'reagent' as 'reagent' | 'consumable' | 'supply' | 'equipment' | 'other',
    description: '',
    manufacturer: '',
    unit: '',
    unitCost: '',
    storageConditions: '',
    shelfLife: '',
    reorderPoint: '',
    reorderQuantity: '',
    active: true,
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.itemCode || !formData.itemName || !formData.unit) {
      setSubmitError(t('lims.inventory.requiredFieldsNew', 'Item code, name, and unit are required'))
      return
    }

    createItem(
      {
        ...formData,
        unitCost: formData.unitCost ? parseFloat(formData.unitCost) : undefined,
        shelfLife: formData.shelfLife ? parseInt(formData.shelfLife, 10) : undefined,
        reorderPoint: formData.reorderPoint ? parseInt(formData.reorderPoint, 10) : undefined,
        reorderQuantity: formData.reorderQuantity ? parseInt(formData.reorderQuantity, 10) : undefined,
        description: formData.description || undefined,
        manufacturer: formData.manufacturer || undefined,
        storageConditions: formData.storageConditions || undefined,
      },
      {
        onSuccess: () => {
          navigate('/lims/inventory/items')
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('lims.inventory.createError', 'Failed to create inventory item'))
        },
      },
    )
  }

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="cancelButton"
        outlined
        color="secondary"
        onClick={() => navigate('/lims/inventory/items')}
      >
        {t('actions.cancel', 'Cancel')}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  return (
    <Container>
      <Panel>
        <Panel.Header title={t('lims.inventory.newItem', 'New Inventory Item')} />
        <Panel.Body>
          {(submitError || error) && (
            <Alert color="danger" title={t('states.error', 'Error')} message={submitError || (error as any)?.message || ''} />
          )}

          <form onSubmit={handleSubmit}>
            <Row>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={t('lims.inventory.itemCode', 'Item Code')}
                  name="itemCode"
                  type="text"
                  value={formData.itemCode}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                  isRequired
                />
              </Column>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={t('lims.inventory.itemName', 'Item Name')}
                  name="itemName"
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  isRequired
                />
              </Column>
            </Row>

            <Row>
              <Column md={6}>
                <SelectWithLabelFormGroup
                  label={t('lims.inventory.category', 'Category')}
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  options={[
                    { value: 'reagent', label: t('lims.inventory.category.reagent', 'Reagent') },
                    { value: 'consumable', label: t('lims.inventory.category.consumable', 'Consumable') },
                    { value: 'supply', label: t('lims.inventory.category.supply', 'Supply') },
                    { value: 'equipment', label: t('lims.inventory.category.equipment', 'Equipment') },
                    { value: 'other', label: t('lims.inventory.category.other', 'Other') },
                  ]}
                />
              </Column>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={t('lims.inventory.unit', 'Unit')}
                  name="unit"
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., bottle, box, pack, each"
                  isRequired
                />
              </Column>
            </Row>

            <Row>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={t('lims.inventory.manufacturer', 'Manufacturer')}
                  name="manufacturer"
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                />
              </Column>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={t('lims.inventory.unitCost', 'Unit Cost')}
                  name="unitCost"
                  type="number"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                />
              </Column>
            </Row>

            <Row>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={t('lims.inventory.reorderPoint', 'Reorder Point')}
                  name="reorderPoint"
                  type="number"
                  value={formData.reorderPoint}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                />
              </Column>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={t('lims.inventory.reorderQuantity', 'Reorder Quantity')}
                  name="reorderQuantity"
                  type="number"
                  value={formData.reorderQuantity}
                  onChange={(e) => setFormData({ ...formData, reorderQuantity: e.target.value })}
                />
              </Column>
            </Row>

            <Row>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={t('lims.inventory.shelfLife', 'Shelf Life (days)')}
                  name="shelfLife"
                  type="number"
                  value={formData.shelfLife}
                  onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
                />
              </Column>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={t('lims.inventory.storageConditions', 'Storage Conditions')}
                  name="storageConditions"
                  type="text"
                  value={formData.storageConditions}
                  onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
                  placeholder="e.g., 2-8°C, Room Temperature"
                />
              </Column>
            </Row>

            <Row>
              <Column md={12}>
                <TextFieldWithLabelFormGroup
                  label={t('lims.inventory.description', 'Description')}
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Column>
            </Row>

            <Row>
              <Column md={12}>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />{' '}
                    {t('lims.inventory.active', 'Active')}
                  </label>
                </div>
              </Column>
            </Row>

            <Row>
              <Column md={12}>
                <Button color="success" type="submit" icon="save" iconLocation="left" disabled={isLoading}>
                  {isLoading ? t('lims.inventory.creating', 'Creating...') : t('lims.inventory.createItem', 'Create Item')}
                </Button>
              </Column>
            </Row>
          </form>
        </Panel.Body>
      </Panel>
    </Container>
  )
}

export default NewInventoryItem

