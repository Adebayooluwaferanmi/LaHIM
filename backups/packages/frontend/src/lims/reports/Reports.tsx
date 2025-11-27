import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column } from '@hospitalrun/components'
import { useReports } from '../../hooks/useReports'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'

const Reports = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.reports.label', 'Reports'))
  const setButtonToolBar = useButtonToolbarSetter()

  const [statusFilter, setStatusFilter] = useState('')

  const { data: reports = [], isLoading, error } = useReports({
    status: statusFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="generateReportButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/lims/reports/generate')}
      >
        {t('lims.reports.generate', 'Generate Report')}
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
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('lims.reports.allStatus', 'All Status')}</option>
            <option value="draft">{t('lims.reports.status.draft', 'Draft')}</option>
            <option value="final">{t('lims.reports.status.final', 'Final')}</option>
            <option value="signed">{t('lims.reports.status.signed', 'Signed')}</option>
            <option value="delivered">{t('lims.reports.status.delivered', 'Delivered')}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          {reports.length === 0 ? (
            <div>{t('lims.reports.noReports', 'No reports found')}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{t('lims.reports.reportNumber', 'Report Number')}</th>
                  <th>{t('lims.reports.patientName', 'Patient Name')}</th>
                  <th>{t('lims.reports.status', 'Status')}</th>
                  <th>{t('lims.reports.reportDate', 'Report Date')}</th>
                  <th>{t('actions.view', 'View')}</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id || report._id}>
                    <td>{report.reportNumber || '-'}</td>
                    <td>{report.patientName || '-'}</td>
                    <td>
                      <span className={`badge badge-${report.status === 'delivered' ? 'success' : 'warning'}`}>
                        {report.status || '-'}
                      </span>
                    </td>
                    <td>{report.reportDate ? new Date(report.reportDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/reports/${report.id || report._id}`)}
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

export default Reports

