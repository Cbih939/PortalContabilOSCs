import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configuração para usar o Worker local do pacote instalado
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PdfThumbnail({ fileUrl }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const renderThumbnail = async () => {
      if (!fileUrl) return;
      
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          // Necessário para evitar bloqueios de segurança em alguns browsers
          isEvalDisabled: true 
        });
        
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 0.3 }); // Miniatura leve
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error("Erro PDF.js:", err);
        setError(true);
        setLoading(false);
      }
    };

    renderThumbnail();
  }, [fileUrl]);

  if (error) return <div style={{ fontSize: '10px', color: '#ccc' }}>Capa indisponível</div>;
  
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {loading && <div style={{ fontSize: '10px' }}>Carregando...</div>}
      <canvas ref={canvasRef} style={{ 
        maxWidth: '100%', 
        maxHeight: '100%', 
        display: loading ? 'none' : 'block'
      }} />
    </div>
  );
}