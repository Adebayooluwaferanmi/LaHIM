import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Container, Row, Column, Spinner, Alert } from '@hospitalrun/components'
import { useReport } from '../../hooks/useReports'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'

const ViewReport = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: report, isLoading, error } = useReport(id)
  const setButtonToolBar = useButtonToolbarSetter()

  useTitle(report ? `${t('lims.reports.view', 'View Report')} - ${report.reportNumber || id}` : t('lims.reports.view', 'View Report'))

  useEffect(() => {
    if (report) {
      useAddBreadcrumbs([
        { i18nKey: 'lims.reports.label', location: '/lims/reports' },
        { i18nKey: 'lims.reports.view', location: `/lims/reports/${id}` },
      ], true)
    }
  }, [report, id])

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate('/lims/reports')}
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

  if (error || !report) {
    return (
      <Container>
        <Alert color="danger" title={t('states.error', 'Error')} message={error?.message || t('lims.reports.notFound', 'Report not found')} />
      </Container>
    )
  }

  return (
    <Container>
      <Panel>
        <Panel.Header title={`${t('lims.reports.view', 'View Report')} - ${report.reportNumber || id}`} />
        <Panel.Body>
          <Row>
            <Column md={6}>
              <h4>{t('lims.reports.reportInformation', 'Report Information')}</h4>
              <table className="table">
                <tbody>
                  <tr>
                    <td><strong>{t('lims.reports.reportNumber', 'Report Number')}</strong></td>
                    <td>{report.reportNumber || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.reports.patientName', 'Patient Name')}</strong></td>
                    <td>{report.patientName || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.reports.patientId', 'Patient ID')}</strong></td>
                    <td>{report.patientId || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.reports.status', 'Status')}</strong></td>
                    <td>
                      <span className={`badge badge-${report.status === 'delivered' ? 'success' : 'warning'}`}>
                        {report.status || '-'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.reports.reportDate', 'Report Date')}</strong></td>
                    <td>{report.reportDate ? new Date(report.reportDate).toLocaleString() : '-'}</td>
                  </tr>
                  {report.signedBy && (
                    <>
                      <tr>
                        <td><strong>{t('lims.reports.signedBy', 'Signed By')}</strong></td>
                        <td>{report.signedBy}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('lims.reports.signedDate', 'Signed Date')}</strong></td>
                        <td>{report.signedDate ? new Date(report.signedDate).toLocaleString() : '-'}</td>
                      </tr>
                    </>
                  )}
                  {report.deliveredBy && (
                    <>
                      <tr>
                        <td><strong>{t('lims.reports.deliveredBy', 'Delivered By')}</strong></td>
                        <td>{report.deliveredBy}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('lims.reports.deliveredDate', 'Delivered Date')}</strong></td>
                        <td>{report.deliveredDate ? new Date(report.deliveredDate).toLocaleString() : '-'}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('lims.reports.deliveryMethod', 'Delivery Method')}</strong></td>
                        <td>{report.deliveryMethod || '-'}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </Column>
          </Row>
        </Panel.Body>
      </Panel>
    </Container>
  )
}

export default ViewReport

