// backend/src/services/file.service.js

// Importa módulos necessários (se precisar, ex: para processar ficheiros)
// import fs from 'fs/promises';
// import path from 'path';
// import exceljs from 'exceljs'; // Exemplo: para ler ficheiros Excel

/**
 * Este serviço contém a lógica de negócio relacionada a ficheiros,
 * indo além das simples operações de CRUD no banco de dados (que ficam nos models).
 */

/**
 * Exemplo (Função Futura): Processa um ficheiro Excel após o upload.
 *
 * Esta função seria chamada pelo 'doc.controller.js' *depois*
 * que o Multer salva o ficheiro e o registo é criado no banco.
 *
 * @param {string} filePath - O caminho para o ficheiro Excel salvo no servidor.
 * @param {number} documentId - O ID do registo do documento no banco.
 * @returns {Promise<void>}
 */
/*
export const processExcelFile = async (filePath, documentId) => {
  try {
    console.log(`[FileService] A processar ficheiro Excel: ${filePath}`);
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Exemplo: Lê a primeira célula da primeira folha
    const worksheet = workbook.getWorksheet(1);
    const firstCellValue = worksheet.getCell('A1').value;
    console.log(`[FileService] Valor da célula A1: ${firstCellValue}`);

    // Lógica adicional:
    // - Validar o conteúdo do ficheiro.
    // - Extrair dados e guardá-los noutra tabela do banco.
    // - Atualizar o status do 'document' no banco para 'processado'.
    // await DocumentModel.updateStatus(documentId, 'processado');

  } catch (error) {
    console.error(`[FileService] Erro ao processar ficheiro Excel ${filePath}:`, error);
    // Lógica de tratamento de erro:
    // - Atualizar o status do 'document' para 'erro_processamento'.
    // await DocumentModel.updateStatus(documentId, 'erro_processamento');
    throw new Error('Falha ao processar o ficheiro Excel.');
  }
};
*/

/**
 * Exemplo (Função Futura): Gera uma miniatura (thumbnail) para uma imagem.
 *
 * @param {string} imagePath - O caminho para a imagem original.
 * @param {string} outputPath - O caminho onde salvar a miniatura.
 * @param {number} width - A largura desejada para a miniatura.
 * @returns {Promise<void>}
 */
/*
export const generateThumbnail = async (imagePath, outputPath, width) => {
  // Usaria uma biblioteca como 'sharp' para redimensionar a imagem
  // import sharp from 'sharp';
  try {
    await sharp(imagePath)
      .resize(width)
      .toFile(outputPath);
    console.log(`[FileService] Miniatura gerada: ${outputPath}`);
  } catch (error) {
    console.error(`[FileService] Erro ao gerar miniatura para ${imagePath}:`, error);
    throw new Error('Falha ao gerar miniatura.');
  }
};
*/

// Neste momento, não temos lógica de negócio complexa para ficheiros.
// Este ficheiro pode permanecer assim ou ser preenchido à medida que
// novas funcionalidades forem adicionadas.