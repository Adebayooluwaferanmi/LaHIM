import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput } from '@hospitalrun/components'
import { useQCResults } from '../../hooks/useQCResults'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'

const QCResults = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.qcResults.label', 'QC Results'))
  const setButtonToolBar = useButtonToolbarSetter()

  const [testCodeFilter, setTestCodeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: qcResults = [], isLoading, error } = useQCResults({
    testCode: testCodeFilter || undefined,
    status: statusFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newQCResultButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/lims/qc-results/new')}
      >
        {t('lims.qcResults.new', 'New QC Result')}
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
            placeholder={t('lims.qcResults.testCodePlaceholder', 'Test Code')}
            value={testCodeFilter}
            onChange={(e) => setTestCodeFilter(e.target.value)}
          />
        </Column>
        <Column md={6}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('lims.qcResults.allStatus', 'All Status')}</option>
            <option value="pass">{t('lims.qcResults.status.pass', 'Pass')}</option>
            <option value="fail">{t('lims.qcResults.status.fail', 'Fail')}</option>
            <option value="warning">{t('lims.qcResults.status.warning', 'Warning')}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          {qcResults.length === 0 ? (
            <div>{t('lims.qcResults.noResults', 'No QC results found')}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{t('lims.qcResults.testName', 'Test Name')}</th>
                  <th>{t('lims.qcResults.material', 'Material')}</th>
                  <th>{t('lims.qcResults.lotNumber', 'Lot Number')}</th>
                  <th>{t('lims.qcResults.measuredValue', 'Measured Value')}</th>
                  <th>{t('lims.qcResults.targetValue', 'Target Value')}</th>
                  <th>{t('lims.qcResults.status', 'Status')}</th>
                  <th>{t('lims.qcResults.runDate', 'Run Date')}</th>
                  <th>{t('actions.view', 'View')}</th>
                </tr>
              </thead>
              <tbody>
                {qcResults.map((result) => (
                  <tr key={result.id || result._id}>
                    <td>{result.testName || '-'}</td>
                    <td>{result.materialName || '-'}</td>
                    <td>{result.materialLot || '-'}</td>
                    <td>{result.measuredValue || '-'}</td>
                    <td>{result.targetValue || '-'}</td>
                    <td>
                      <span className={`badge badge-${result.status === 'pass' ? 'success' : result.status === 'fail' ? 'danger' : 'warning'}`}>
                        {result.status || '-'}
                      </span>
                    </td>
                    <td>{result.runDate ? new Date(result.runDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/qc-results/${result.id || result._id}`)}
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

export default QCResults

