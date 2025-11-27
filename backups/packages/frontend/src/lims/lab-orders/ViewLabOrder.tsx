import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Container, Row, Column, Spinner, Alert } from '@hospitalrun/components'
import { useLabOrder } from '../../hooks/useLabOrders'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'

const ViewLabOrder = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: labOrder, isLoading, error } = useLabOrder(id)
  const setButtonToolBar = useButtonToolbarSetter()

  useTitle(labOrder ? `${t('lims.labOrders.view', 'View Lab Order')} - ${labOrder.orderNumber || id}` : t('lims.labOrders.view', 'View Lab Order'))

  useEffect(() => {
    if (labOrder) {
      useAddBreadcrumbs([
        { i18nKey: 'lims.labOrders.label', location: '/lims/lab-orders' },
        { i18nKey: 'lims.labOrders.view', location: `/lims/lab-orders/${id}` },
      ], true)
    }
  }, [labOrder, id])

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="editButton"
        color="primary"
        icon="edit"
        iconLocation="left"
        onClick={() => navigate(`/lims/lab-orders/${id}/edit`)}
      >
        {t('actions.edit', 'Edit')}
      </Button>,
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate('/lims/lab-orders')}
      >
        {t('actions.back', 'Back')}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, id, t])

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  if (error || !labOrder) {
    return (
      <Container>
        <Alert color="danger" title={t('states.error', 'Error')} message={error?.message || t('lims.labOrders.notFound', 'Lab order not found')} />
      </Container>
    )
  }

  return (
    <Container>
      <Panel>
        <Panel.Header title={`${t('lims.labOrders.view', 'View Lab Order')} - ${labOrder.orderNumber || id}`} />
        <Panel.Body>
          <Row>
            <Column md={6}>
              <h4>{t('lims.labOrders.orderInformation', 'Order Information')}</h4>
              <table className="table">
                <tbody>
                  <tr>
                    <td><strong>{t('lims.labOrders.orderNumber', 'Order Number')}</strong></td>
                    <td>{labOrder.orderNumber || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.labOrders.patientName', 'Patient Name')}</strong></td>
                    <td>{labOrder.patientName || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.labOrders.patientId', 'Patient ID')}</strong></td>
                    <td>{labOrder.patientId || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.labOrders.status', 'Status')}</strong></td>
                    <td>
                      <span className={`badge badge-${labOrder.status === 'completed' ? 'success' : 'warning'}`}>
                        {labOrder.status || '-'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.labOrders.priority', 'Priority')}</strong></td>
                    <td>{labOrder.priority || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.labOrders.orderedDate', 'Ordered Date')}</strong></td>
                    <td>{labOrder.orderedDate ? new Date(labOrder.orderedDate).toLocaleString() : '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.labOrders.orderedBy', 'Ordered By')}</strong></td>
                    <td>{labOrder.orderedBy || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </Column>
            <Column md={6}>
              <h4>{t('lims.labOrders.tests', 'Tests')}</h4>
              {labOrder.tests && labOrder.tests.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t('lims.labOrders.testCode', 'Test Code')}</th>
                      <th>{t('lims.labOrders.testName', 'Test Name')}</th>
                      <th>{t('lims.labOrders.section', 'Section')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labOrder.tests.map((test, index) => (
                      <tr key={index}>
                        <td>{test.testCode || '-'}</td>
                        <td>{test.testName || '-'}</td>
                        <td>{test.section || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>{t('lims.labOrders.noTests', 'No tests ordered')}</p>
              )}
              {labOrder.notes && (
                <div>
                  <h4>{t('lims.labOrders.notes', 'Notes')}</h4>
                  <p>{labOrder.notes}</p>
                </div>
              )}
            </Column>
          </Row>
        </Panel.Body>
      </Panel>
    </Container>
  )
}

export default ViewLabOrder

