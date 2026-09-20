import express from 'express';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, downloadReceipt } from '../controllers/transaction.controller.js';
import { protect, blockIfInDebt } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js'; // Utilizando o middleware existente para uploads

const router = express.Router();

// Todas as rotas de transações requerem autenticação (antes importava um `authenticate` inexistente)
router.use(protect, blockIfInDebt);

// Listar todas as transações da OSC logada
router.get('/', getTransactions);

// Baixar o comprovante de uma transação (somente a OSC dona)
router.get('/:id/receipt', downloadReceipt);

// Criar nova transação com possível anexo (comprovativo)
router.post('/', upload.single('receipt'), createTransaction);

// Atualizar transação (incluindo substituição de comprovativo)
router.put('/:id', upload.single('receipt'), updateTransaction);

// Apagar transação
router.delete('/:id', deleteTransaction);

export default router;
