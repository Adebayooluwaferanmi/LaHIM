import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { patientsApi, UpdatePatientProfileRequest } from '../api/patients'
import { Panel, Button, Alert, TextInput, Spinner } from '@lahim/components'
import { Row, Col } from 'react-bootstrap'

export default function Profile() {
  const queryClient = useQueryClient()
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<UpdatePatientProfileRequest>({})

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => patientsApi.getProfile(),
    onSuccess: (data) => {
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        communicationPreferences: data.communicationPreferences || '',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePatientProfileRequest) => patientsApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setEditMode(false)
    },
  })

  const handleChange = (field: keyof UpdatePatientProfileRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (isLoading) {
    return <Spinner color="primary" />
  }

  return (
    <div>
      <h1>My Profile</h1>
      <Row>
        <Col md={8}>
          <Panel title="Profile Information">
            {updateMutation.isError && (
              <Alert
                color="danger"
                message={(updateMutation.error as any)?.error || 'Failed to update profile'}
              />
            )}
            {updateMutation.isSuccess && <Alert color="success" message="Profile updated successfully" />}

            {!editMode ? (
              <div>
                <p>
                  <strong>Name:</strong> {profile?.firstName} {profile?.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {profile?.userId} {/* This should be email from user */}
                </p>
                <p>
                  <strong>Phone:</strong> {profile?.phone || 'Not provided'}
                </p>
                <p>
                  <strong>Date of Birth:</strong>{' '}
                  {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </p>
                <p>
                  <strong>Communication Preferences:</strong> {profile?.communicationPreferences || 'Not set'}
                </p>
                <Button color="primary" onClick={() => setEditMode(true)}>
                  Edit Profile
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <TextInput
                  label="First Name"
                  value={formData.firstName || ''}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />
                <TextInput
                  label="Last Name"
                  value={formData.lastName || ''}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
                <TextInput
                  label="Phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
                <TextInput
                  label="Communication Preferences"
                  value={formData.communicationPreferences || ''}
                  onChange={(e) => handleChange('communicationPreferences', e.target.value)}
                  placeholder="e.g., Email preferred, SMS for urgent"
                />
                <div style={{ marginTop: '20px' }}>
                  <Button type="submit" color="primary" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    color="secondary"
                    onClick={() => {
                      setEditMode(false)
                      if (profile) {
                        setFormData({
                          firstName: profile.firstName || '',
                          lastName: profile.lastName || '',
                          phone: profile.phone || '',
                          communicationPreferences: profile.communicationPreferences || '',
                        })
                      }
                    }}
                    style={{ marginLeft: '10px' }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Panel>
        </Col>
      </Row>
    </div>
  )
}


