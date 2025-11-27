import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput } from '@hospitalrun/components'
import { useSpecimens } from '../../hooks/useSpecimens'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'

const Specimens = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.specimens.label', 'Specimens'))
  const setButtonToolBar = useButtonToolbarSetter()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: specimens = [], isLoading, error } = useSpecimens({
    search: searchTerm || undefined,
    status: statusFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([])
    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar])

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
            placeholder={t('lims.specimens.searchPlaceholder', 'Search by accession number or patient name')}
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
            <option value="">{t('lims.specimens.allStatus', 'All Status')}</option>
            <option value="pending">{t('lims.specimens.status.pending', 'Pending')}</option>
            <option value="collected">{t('lims.specimens.status.collected', 'Collected')}</option>
            <option value="received">{t('lims.specimens.status.received', 'Received')}</option>
            <option value="processing">{t('lims.specimens.status.processing', 'Processing')}</option>
            <option value="completed">{t('lims.specimens.status.completed', 'Completed')}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          {specimens.length === 0 ? (
            <div>{t('lims.specimens.noSpecimens', 'No specimens found')}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{t('lims.specimens.accessionNumber', 'Accession Number')}</th>
                  <th>{t('lims.specimens.specimenType', 'Specimen Type')}</th>
                  <th>{t('lims.specimens.patientName', 'Patient Name')}</th>
                  <th>{t('lims.specimens.status', 'Status')}</th>
                  <th>{t('lims.specimens.collectionDate', 'Collection Date')}</th>
                  <th>{t('actions.view', 'View')}</th>
                </tr>
              </thead>
              <tbody>
                {specimens.map((specimen) => (
                  <tr key={specimen.id || specimen._id}>
                    <td>{specimen.accessionNumber || '-'}</td>
                    <td>{specimen.specimenType || '-'}</td>
                    <td>{specimen.patientName || '-'}</td>
                    <td>
                      <span className={`badge badge-${specimen.status === 'completed' ? 'success' : 'warning'}`}>
                        {specimen.status || '-'}
                      </span>
                    </td>
                    <td>{specimen.collectionDate ? new Date(specimen.collectionDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/specimens/${specimen.id || specimen._id}`)}
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

export default Specimens

