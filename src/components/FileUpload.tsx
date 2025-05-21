import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { XmlDocument, parseXmlFile } from '../lib/xmlParser';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFilesProcessed: (documents: XmlDocument[]) => void;
}

export default function FileUpload({ onFilesProcessed }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: number;
    error: number;
    total: number;
  }>({ success: 0, error: 0, total: 0 });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setIsProcessing(true);
      setUploadStatus({ success: 0, error: 0, total: acceptedFiles.length });
      
      const documents: XmlDocument[] = [];
      let successCount = 0;
      let errorCount = 0;

      const processFile = (file: File): Promise<void> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          
          reader.onload = () => {
            try {
              const xmlContent = reader.result as string;
              const document = parseXmlFile(xmlContent, file.name);
              
              if (document.tipo !== 'Desconhecido') {
                documents.push(document);
                successCount++;
                setUploadStatus(prev => ({ 
                  ...prev, 
                  success: prev.success + 1 
                }));
              } else {
                errorCount++;
                setUploadStatus(prev => ({ 
                  ...prev, 
                  error: prev.error + 1 
                }));
              }
            } catch (error) {
              console.error('Erro ao processar arquivo:', error);
              errorCount++;
              setUploadStatus(prev => ({ 
                ...prev, 
                error: prev.error + 1 
              }));
            }
            
            resolve();
          };
          
          reader.onerror = () => {
            errorCount++;
            setUploadStatus(prev => ({ 
              ...prev, 
              error: prev.error + 1 
            }));
            resolve();
          };
          
          reader.readAsText(file);
        });
      };

      // Processar arquivos em paralelo, mas com limite
      const batchSize = 5;
      for (let i = 0; i < acceptedFiles.length; i += batchSize) {
        const batch = acceptedFiles.slice(i, i + batchSize);
        await Promise.all(batch.map(processFile));
      }

      onFilesProcessed(documents);
      setIsProcessing(false);
    },
    [onFilesProcessed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml']
    }
  });

  return (
    <div className="card-container">
      <h2 className="text-xl font-semibold mb-4">Upload de Arquivos XML</h2>
      
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center py-6">
          <Upload size={48} className="mb-4 text-muted-foreground" />
          
          {isDragActive ? (
            <p className="text-lg font-medium">Solte os arquivos aqui...</p>
          ) : (
            <>
              <p className="text-lg font-medium mb-2">
                Arraste e solte arquivos XML aqui
              </p>
              <p className="text-sm text-muted-foreground">
                ou clique para selecionar arquivos
              </p>
            </>
          )}
        </div>
      </div>

      {isProcessing && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span>Processando arquivos...</span>
            <span>
              {uploadStatus.success + uploadStatus.error} de {uploadStatus.total}
            </span>
          </div>
          
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ 
                width: `${((uploadStatus.success + uploadStatus.error) / uploadStatus.total) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      {!isProcessing && uploadStatus.total > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle size={18} />
            <span>{uploadStatus.success} arquivos processados com sucesso</span>
          </div>
          
          {uploadStatus.error > 0 && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle size={18} />
              <span>{uploadStatus.error} arquivos com erro</span>
            </div>
          )}
          
          <button 
            className="btn-primary mt-2"
            onClick={() => setUploadStatus({ success: 0, error: 0, total: 0 })}
          >
            <FileText size={18} className="mr-2" />
            Fazer novo upload
          </button>
        </div>
      )}
    </div>
  );
}
