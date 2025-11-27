import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput } from '@hospitalrun/components'
import { useLabOrders } from '../../hooks/useLabOrders'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'

const LabOrders = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.labOrders.label', 'Lab Orders'))
  const setButtonToolBar = useButtonToolbarSetter()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: labOrders = [], isLoading, error } = useLabOrders({
    search: searchTerm || undefined,
    status: statusFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newLabOrderButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/lims/lab-orders/new')}
      >
        {t('lims.labOrders.new', 'New Lab Order')}
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
            placeholder={t('lims.labOrders.searchPlaceholder', 'Search by order number or patient name')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Column>
        <Column md={6}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('lims.labOrders.allStatus', 'All Status')}</option>
            <option value="pending">{t('lims.labOrders.status.pending', 'Pending')}</option>
            <option value="collected">{t('lims.labOrders.status.collected', 'Collected')}</option>
            <option value="received">{t('lims.labOrders.status.received', 'Received')}</option>
            <option value="processing">{t('lims.labOrders.status.processing', 'Processing')}</option>
            <option value="completed">{t('lims.labOrders.status.completed', 'Completed')}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          {labOrders.length === 0 ? (
            <div>{t('lims.labOrders.noOrders', 'No lab orders found')}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{t('lims.labOrders.orderNumber', 'Order Number')}</th>
                  <th>{t('lims.labOrders.patientName', 'Patient Name')}</th>
                  <th>{t('lims.labOrders.status', 'Status')}</th>
                  <th>{t('lims.labOrders.priority', 'Priority')}</th>
                  <th>{t('lims.labOrders.orderedDate', 'Ordered Date')}</th>
                  <th>{t('actions.view', 'View')}</th>
                </tr>
              </thead>
              <tbody>
                {labOrders.map((order) => (
                  <tr key={order.id || order._id}>
                    <td>{order.orderNumber || '-'}</td>
                    <td>{order.patientName || '-'}</td>
                    <td>
                      <span className={`badge badge-${order.status === 'completed' ? 'success' : 'warning'}`}>
                        {order.status || '-'}
                      </span>
                    </td>
                    <td>{order.priority || '-'}</td>
                    <td>{order.orderedDate ? new Date(order.orderedDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/lab-orders/${order.id || order._id}`)}
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

export default LabOrders

