import { useQuery } from '@tanstack/react-query'
import { documentsApi } from '../api/documents'
import { Panel, Spinner, Alert } from '@lahim/components'
import { format } from 'date-fns'
import FileUpload from './FileUpload'

interface DocumentListProps {
  consultationId: string
  showUpload?: boolean
}

export default function DocumentList({ consultationId, showUpload = false }: DocumentListProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['documents', consultationId],
    queryFn: () => documentsApi.list(consultationId),
  })

  const documents = data?.items || []

  const handleDownload = (documentId: string, filename?: string) => {
    const url = documentsApi.getDownloadUrl(documentId)
    // For now, open in new tab. In production, you'd want to handle authentication
    window.open(url, '_blank')
  }

  return (
    <Panel title="Documents">
      {showUpload && <FileUpload consultationId={consultationId} />}

      {isLoading ? (
        <Spinner color="primary" />
      ) : documents.length === 0 ? (
        <Alert color="info" message="No documents" />
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {documents.map((doc) => (
            <li key={doc.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f5f5f5' }}>
              <div>
                <strong>{doc.title || doc.filename || 'Document'}</strong>
              </div>
              <div style={{ fontSize: '0.85em', color: '#666' }}>
                {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                {doc.size && ` • ${(doc.size / 1024).toFixed(1)} KB`}
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleDownload(doc.id, doc.filename)}
                style={{ marginTop: '5px' }}
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}


