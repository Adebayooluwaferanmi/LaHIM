import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column } from '@hospitalrun/components'
import { useInstruments } from '../../hooks/useInstruments'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'

const Instruments = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.instruments.label', 'Instruments'))
  const setButtonToolBar = useButtonToolbarSetter()

  const { data: instruments = [], isLoading, error } = useInstruments()

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
        <Column>
          {instruments.length === 0 ? (
            <div>{t('lims.instruments.noInstruments', 'No instruments found')}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{t('lims.instruments.name', 'Name')}</th>
                  <th>{t('lims.instruments.manufacturer', 'Manufacturer')}</th>
                  <th>{t('lims.instruments.model', 'Model')}</th>
                  <th>{t('lims.instruments.section', 'Section')}</th>
                  <th>{t('lims.instruments.status', 'Status')}</th>
                  <th>{t('actions.view', 'View')}</th>
                </tr>
              </thead>
              <tbody>
                {instruments.map((instrument) => (
                  <tr key={instrument.id || instrument._id}>
                    <td>{instrument.name || '-'}</td>
                    <td>{instrument.manufacturer || '-'}</td>
                    <td>{instrument.model || '-'}</td>
                    <td>{instrument.section || '-'}</td>
                    <td>
                      <span className={`badge badge-${instrument.status === 'active' ? 'success' : 'warning'}`}>
                        {instrument.status || '-'}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/instruments/${instrument.id || instrument._id}`)}
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

export default Instruments

