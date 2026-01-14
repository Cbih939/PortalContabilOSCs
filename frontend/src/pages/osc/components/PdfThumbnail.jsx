import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { FileIcon } from '../../../components/common/Icons.jsx';

// Configuração do worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfThumbnail({ fileUrl }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const renderThumbnail = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1); // Pega a primeira página

        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
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

    if (fileUrl) renderThumbnail();
  }, [fileUrl]);

  if (error) return <FileIcon style={{ width: '40%', height: '40%', color: '#ccc' }} />;
  
  return (
    <>
      {loading && <div style={{ fontSize: '10px' }}>A carregar...</div>}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: loading ? 'none' : 'block' }} />
    </>
  );
}