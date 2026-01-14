import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// IMPORTAÇÃO LOCAL DO WORKER (Resolve o erro 404 do CDN)
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PdfThumbnail({ fileUrl }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const renderThumbnail = async () => {
      if (!fileUrl) return;
      
      try {
        // Adicionamos { withCredentials: true } se o seu backend exigir token para ver o arquivo
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          disableRange: true, // Melhora compatibilidade com alguns servidores
          disableAutoFetch: true
        });
        
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        
        // Ajustamos a escala para a miniatura não ficar pesada
        const viewport = page.getViewport({ scale: 0.4 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error("Erro ao gerar miniatura:", err);
        setError(true);
        setLoading(false);
      }
    };

    renderThumbnail();
  }, [fileUrl]);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
        <span style={{ fontSize: '10px' }}>Erro na capa</span>
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', background: '#f3f4f6' }}>
          ...
        </div>
      )}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
  );
}