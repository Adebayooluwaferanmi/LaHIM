import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@hospitalrun/components'
import { useCreateQCResult, useQCMaterials, QCMaterial } from '../../hooks/useQCResults'
import { useInstruments } from '../../hooks/useInstruments'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import SelectWithLabelFormGroup from '../../components/input/SelectWithLableFormGroup'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'
import DatePickerWithLabelFormGroup from '../../components/input/DatePickerWithLabelFormGroup'

const breadcrumbs = [{ i18nKey: 'lims.qcResults.new', location: '/lims/qc-results/new' }]

const NewQCResult = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.qcResults.new', 'New QC Result'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: createQCResult, isPending: creating, error: createError } = useCreateQCResult()
  const { data: materials = [], isLoading: materialsLoading } = useQCMaterials({ active: true })
  const { data: instruments = [], isLoading: instrumentsLoading } = useInstruments()

  const [formData, setFormData] = useState({
    testCode: '',
    testName: '',
    materialId: '',
    instrumentId: '',
    measuredValue: '',
    runDate: new Date(),
    runNumber: '',
    notes: '',
  })

  const [selectedMaterial, setSelectedMaterial] = useState<QCMaterial | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (formData.materialId) {
      const material = materials.find((m) => m.id === formData.materialId || m._id === formData.materialId)
      if (material) {
        setSelectedMaterial(material)
        setFormData({
          ...formData,
          testCode: material.testCode?.coding?.[0]?.code || '',
          testName: material.testName || '',
        })
      }
    }
  }, [formData.materialId, materials])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.materialId || !formData.measuredValue) {
      setSubmitError(t('lims.qcResults.requiredFields', 'Material and measured value are required'))
      return
    }

    createQCResult(
      {
        testCode: selectedMaterial?.testCode,
        testName: formData.testName,
        materialId: formData.materialId,
        instrumentId: formData.instrumentId || undefined,
        instrumentName: instruments.find((i) => i.id === formData.instrumentId)?.name,
        materialName: selectedMaterial?.materialName,
        materialLot: selectedMaterial?.lotNumber,
        measuredValue: parseFloat(formData.measuredValue),
        runDate: formData.runDate.toISOString(),
        runNumber: formData.runNumber || undefined,
        notes: formData.notes || undefined,
      },
      {
        onSuccess: (result) => {
          navigate(`/lims/qc-results/${result.id || result._id}`)
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('lims.qcResults.createError', 'Failed to create QC result'))
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
        onClick={() => navigate('/lims/qc-results')}
      >
        {t('actions.cancel', 'Cancel')}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  if (materialsLoading || instrumentsLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  return (
    <Container>
      <Panel>
        <Panel.Header title={t('lims.qcResults.new', 'New QC Result')} />
        <Panel.Body>
          {(submitError || createError) && (
            <Alert color="danger" title={t('states.error', 'Error')} message={submitError || createError || ''} />
          )}

          <form onSubmit={handleSubmit}>
            <Row>
              <Column md={6}>
                <SelectWithLabelFormGroup
                  label={t('lims.qcResults.qcMaterial', 'QC Material')}
                  name="materialId"
                  value={formData.materialId}
                  onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                  options={[
                    { value: '', label: t('lims.qcResults.selectMaterial', 'Select Material') },
                    ...materials.map((material) => ({
                      value: material.id || material._id || '',
                      label: `${material.materialName} - Lot: ${material.lotNumber} (Target: ${material.targetValue} ± ${material.sd} SD)`,
                    })),
                  ]}
                />
              </Column>

              <Column md={6}>
                <SelectWithLabelFormGroup
                  label={`${t('lims.qcResults.instrument', 'Instrument')} (${t('lims.qcResults.optional', 'Optional')})`}
                  name="instrumentId"
                  value={formData.instrumentId}
                  onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
                  options={[
                    { value: '', label: t('lims.qcResults.none', 'None') },
                    ...instruments.map((instrument) => ({
                      value: instrument.id || instrument._id || '',
                      label: instrument.name || '',
                    })),
                  ]}
                />
              </Column>
            </Row>

            {selectedMaterial && (
              <Row>
                <Column md={12}>
                  <Alert
                    color="info"
                    title={t('lims.qcResults.materialInfo', 'Material Information')}
                    message={`${t('lims.qcResults.targetValue', 'Target Value')}: ${selectedMaterial.targetValue} ${selectedMaterial.unit || ''}. ${t('lims.qcResults.standardDeviation', 'Standard Deviation')}: ${selectedMaterial.sd} ${selectedMaterial.unit || ''}. ${t('lims.qcResults.acceptableRange', 'Acceptable Range')}: ${selectedMaterial.acceptableRange ? `${selectedMaterial.acceptableRange.min} - ${selectedMaterial.acceptableRange.max}` : `${selectedMaterial.targetValue! - 2 * selectedMaterial.sd!} - ${selectedMaterial.targetValue! + 2 * selectedMaterial.sd!}`}`}
                  />
                </Column>
              </Row>
            )}

            <Row>
              <Column md={4}>
                <TextInputWithLabelFormGroup
                  label={t('lims.qcResults.measuredValue', 'Measured Value')}
                  name="measuredValue"
                  type="number"
                  value={formData.measuredValue}
                  onChange={(e) => setFormData({ ...formData, measuredValue: e.target.value })}
                  isRequired
                />
              </Column>

              <Column md={4}>
                <DatePickerWithLabelFormGroup
                  label={t('lims.qcResults.runDate', 'Run Date')}
                  name="runDate"
                  value={formData.runDate}
                  onChange={(date) => setFormData({ ...formData, runDate: date })}
                  isRequired
                />
              </Column>

              <Column md={4}>
                <TextInputWithLabelFormGroup
                  label={`${t('lims.qcResults.runNumber', 'Run Number')} (${t('lims.qcResults.optional', 'Optional')})`}
                  name="runNumber"
                  type="text"
                  value={formData.runNumber}
                  onChange={(e) => setFormData({ ...formData, runNumber: e.target.value })}
                />
              </Column>
            </Row>

            <Row>
              <Column md={12}>
                <TextFieldWithLabelFormGroup
                  label={`${t('lims.qcResults.notes', 'Notes')} (${t('lims.qcResults.optional', 'Optional')})`}
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Column>
            </Row>

            <Row>
              <Column md={12}>
                <Button
                  type="submit"
                  color="success"
                  icon="save"
                  iconLocation="left"
                  disabled={creating}
                >
                  {creating ? t('lims.qcResults.creating', 'Creating...') : t('lims.qcResults.create', 'Create QC Result')}
                </Button>
              </Column>
            </Row>
          </form>
        </Panel.Body>
      </Panel>
    </Container>
  )
}

export default NewQCResult

