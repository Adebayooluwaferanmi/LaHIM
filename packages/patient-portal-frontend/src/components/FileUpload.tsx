import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsApi } from '../api/documents'
import { Button, Alert } from '@lahim/components'

interface FileUploadProps {
  consultationId: string
}

export default function FileUpload({ consultationId }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentsApi.upload(consultationId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', consultationId] })
      setFile(null)
      setError(null)
    },
    onError: (err: any) => {
      setError(err.error || 'Failed to upload file')
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (file) {
      uploadMutation.mutate(file)
    }
  }

  return (
    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
      <h5>Upload Document</h5>
      {error && <Alert color="danger" message={error} />}
      {uploadMutation.isSuccess && <Alert color="success" message="File uploaded successfully" />}

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={handleFileChange}
          disabled={uploadMutation.isPending}
          style={{ marginBottom: '10px' }}
        />
        {file && (
          <div style={{ marginBottom: '10px', fontSize: '0.9em', color: '#666' }}>
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
        <Button type="submit" color="primary" disabled={uploadMutation.isPending || !file}>
          {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
        </Button>
      </form>
    </div>
  )
}


