import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@hospitalrun/components'
import { useCreateLabOrder } from '../../hooks/useCreateLabOrder'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'

const breadcrumbs = [{ i18nKey: 'lims.labOrders.new', location: '/lims/lab-orders/new' }]

const NewLabOrder = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.labOrders.new', 'New Lab Order'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: createOrder, isPending: isLoading, error } = useCreateLabOrder()

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    priority: 'routine' as 'routine' | 'urgent' | 'stat',
    notes: '',
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.patientId) {
      setSubmitError(t('lims.labOrders.patientRequired', 'Patient ID is required'))
      return
    }

    createOrder(
      {
        ...formData,
        tests: [], // TODO: Add test selection UI
      },
      {
        onSuccess: (data) => {
          navigate(`/lims/lab-orders/${data.id || data._id}`)
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('lims.labOrders.createError', 'Failed to create lab order'))
        },
      }
    )
  }

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="cancelButton"
        outlined
        color="secondary"
        onClick={() => navigate('/lims/lab-orders')}
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
        <Panel.Header title={t('lims.labOrders.new', 'New Lab Order')} />
        <Panel.Body>
          {(submitError || error) && (
            <Alert color="danger" title={t('states.error', 'Error')} message={submitError || (error as any)?.message || ''} />
          )}

          <form onSubmit={handleSubmit}>
            <Row>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={t('lims.labOrders.patientId', 'Patient ID')}
                  name="patientId"
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  isRequired
                />
              </Column>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={t('lims.labOrders.patientName', 'Patient Name')}
                  name="patientName"
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                />
              </Column>
            </Row>

            <Row>
              <Column md={6}>
                <div className="form-group">
                  <label>{t('lims.labOrders.priority', 'Priority')}</label>
                  <select
                    className="form-control"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <option value="routine">{t('lims.labOrders.priority.routine', 'Routine')}</option>
                    <option value="urgent">{t('lims.labOrders.priority.urgent', 'Urgent')}</option>
                    <option value="stat">{t('lims.labOrders.priority.stat', 'Stat')}</option>
                  </select>
                </div>
              </Column>
            </Row>

            <Row>
              <Column md={12}>
                <Button color="success" type="submit" icon="save" iconLocation="left" disabled={isLoading}>
                  {isLoading ? t('lims.labOrders.creating', 'Creating...') : t('lims.labOrders.create', 'Create Lab Order')}
                </Button>
              </Column>
            </Row>
          </form>
        </Panel.Body>
      </Panel>
    </Container>
  )
}

export default NewLabOrder

