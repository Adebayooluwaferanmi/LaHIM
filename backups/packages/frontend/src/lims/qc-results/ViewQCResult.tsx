import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Container, Row, Column, Spinner, Alert } from '@hospitalrun/components'
import { useQCResult } from '../../hooks/useQCResults'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'

const ViewQCResult = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: qcResult, isLoading, error } = useQCResult(id)
  const setButtonToolBar = useButtonToolbarSetter()

  useTitle(qcResult ? `${t('lims.qcResults.view', 'View QC Result')} - ${qcResult.testName || id}` : t('lims.qcResults.view', 'View QC Result'))

  useEffect(() => {
    if (qcResult) {
      useAddBreadcrumbs([
        { i18nKey: 'lims.qcResults.label', location: '/lims/qc-results' },
        { i18nKey: 'lims.qcResults.view', location: `/lims/qc-results/${id}` },
      ], true)
    }
  }, [qcResult, id])

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate('/lims/qc-results')}
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

  if (error || !qcResult) {
    return (
      <Container>
        <Alert color="danger" title={t('states.error', 'Error')} message={error?.message || t('lims.qcResults.notFound', 'QC result not found')} />
      </Container>
    )
  }

  return (
    <Container>
      <Panel>
        <Panel.Header title={`${t('lims.qcResults.view', 'View QC Result')} - ${qcResult.testName || id}`} />
        <Panel.Body>
          <Row>
            <Column md={6}>
              <h4>{t('lims.qcResults.qcResultInformation', 'QC Result Information')}</h4>
              <table className="table">
                <tbody>
                  <tr>
                    <td><strong>{t('lims.qcResults.testName', 'Test Name')}</strong></td>
                    <td>{qcResult.testName || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.qcResults.material', 'Material')}</strong></td>
                    <td>{qcResult.materialName || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.qcResults.lotNumber', 'Lot Number')}</strong></td>
                    <td>{qcResult.materialLot || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.qcResults.instrument', 'Instrument')}</strong></td>
                    <td>{qcResult.instrumentName || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.qcResults.measuredValue', 'Measured Value')}</strong></td>
                    <td>{qcResult.measuredValue || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.qcResults.targetValue', 'Target Value')}</strong></td>
                    <td>{qcResult.targetValue || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.qcResults.status', 'Status')}</strong></td>
                    <td>
                      <span className={`badge badge-${qcResult.status === 'pass' ? 'success' : qcResult.status === 'fail' ? 'danger' : 'warning'}`}>
                        {qcResult.status || '-'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.qcResults.runDate', 'Run Date')}</strong></td>
                    <td>{qcResult.runDate ? new Date(qcResult.runDate).toLocaleString() : '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.qcResults.runNumber', 'Run Number')}</strong></td>
                    <td>{qcResult.runNumber || '-'}</td>
                  </tr>
                  {qcResult.notes && (
                    <tr>
                      <td><strong>{t('lims.qcResults.notes', 'Notes')}</strong></td>
                      <td>{qcResult.notes}</td>
                    </tr>
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

export default ViewQCResult

