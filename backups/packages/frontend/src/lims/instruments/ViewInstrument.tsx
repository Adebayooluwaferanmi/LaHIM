import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Container, Row, Column, Spinner, Alert } from '@hospitalrun/components'
import { useInstrument } from '../../hooks/useInstruments'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'

const ViewInstrument = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: instrument, isLoading, error } = useInstrument(id)
  const setButtonToolBar = useButtonToolbarSetter()

  useTitle(instrument ? `${t('lims.instruments.view', 'View Instrument')} - ${instrument.name || id}` : t('lims.instruments.view', 'View Instrument'))

  useEffect(() => {
    if (instrument) {
      useAddBreadcrumbs([
        { i18nKey: 'lims.instruments.label', location: '/lims/instruments' },
        { i18nKey: 'lims.instruments.view', location: `/lims/instruments/${id}` },
      ], true)
    }
  }, [instrument, id])

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate('/lims/instruments')}
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

  if (error || !instrument) {
    return (
      <Container>
        <Alert color="danger" title={t('states.error', 'Error')} message={error?.message || t('lims.instruments.notFound', 'Instrument not found')} />
      </Container>
    )
  }

  return (
    <Container>
      <Panel>
        <Panel.Header title={`${t('lims.instruments.view', 'View Instrument')} - ${instrument.name || id}`} />
        <Panel.Body>
          <Row>
            <Column md={6}>
              <h4>{t('lims.instruments.instrumentInformation', 'Instrument Information')}</h4>
              <table className="table">
                <tbody>
                  <tr>
                    <td><strong>{t('lims.instruments.name', 'Name')}</strong></td>
                    <td>{instrument.name || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.instruments.manufacturer', 'Manufacturer')}</strong></td>
                    <td>{instrument.manufacturer || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.instruments.model', 'Model')}</strong></td>
                    <td>{instrument.model || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.instruments.serialNumber', 'Serial Number')}</strong></td>
                    <td>{instrument.serialNumber || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.instruments.section', 'Section')}</strong></td>
                    <td>{instrument.section || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.instruments.status', 'Status')}</strong></td>
                    <td>
                      <span className={`badge badge-${instrument.status === 'active' ? 'success' : 'warning'}`}>
                        {instrument.status || '-'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.instruments.location', 'Location')}</strong></td>
                    <td>{instrument.location || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.instruments.lastCalibration', 'Last Calibration')}</strong></td>
                    <td>{instrument.lastCalibration ? new Date(instrument.lastCalibration).toLocaleDateString() : '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('lims.instruments.nextCalibration', 'Next Calibration')}</strong></td>
                    <td>{instrument.nextCalibration ? new Date(instrument.nextCalibration).toLocaleDateString() : '-'}</td>
                  </tr>
                </tbody>
              </table>
            </Column>
          </Row>
        </Panel.Body>
      </Panel>
    </Container>
  )
}

export default ViewInstrument

