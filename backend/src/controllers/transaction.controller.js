import * as transactionModel from '../models/transaction.model.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const UPLOADS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');

// Inicializa a tabela caso não exista
transactionModel.createTableIfNotExists();

export const getTransactions = async (req, res) => {
  try {
    // Apenas OSC pode gerir as suas próprias transações por agora
    const oscId = req.user.role === 'OSC' ? req.user.id : null;
    
    if (!oscId) {
      return res.status(403).json({ error: 'Apenas OSCs podem aceder a esta rota' });
    }

    const transactions = await transactionModel.findAllByOsc(oscId);
    return res.json(transactions);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar transações' });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const oscId = req.user.id;
    if (req.user.role !== 'OSC') {
      return res.status(403).json({ error: 'Apenas OSCs podem registar transações' });
    }

    const { type, category, description, amount, transaction_date } = req.body;
    let receipt_filename = null;

    if (req.file) {
      receipt_filename = req.file.filename;
    }

    const newId = await transactionModel.createTransaction(oscId, {
      type, category, description, amount, transaction_date, receipt_filename
    });

    return res.status(201).json({ message: 'Transação registada com sucesso', id: newId });
  } catch (error) {
    console.error('Erro ao registar transação:', error);
    return res.status(500).json({ error: 'Erro interno ao registar transação' });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const oscId = req.user.id;
    const transactionId = req.params.id;

    if (req.user.role !== 'OSC') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { type, category, description, amount, transaction_date } = req.body;
    
    let updateData = { type, category, description, amount, transaction_date };

    if (req.file) {
      updateData.receipt_filename = req.file.filename;
      // Ideally we would delete the old file here, but keeping it simple for now
    }

    const success = await transactionModel.updateTransaction(transactionId, oscId, updateData);

    if (success) {
      return res.json({ message: 'Transação atualizada com sucesso' });
    } else {
      return res.status(404).json({ error: 'Transação não encontrada ou acesso negado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar transação' });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const oscId = req.user.id;
    const transactionId = req.params.id;

    if (req.user.role !== 'OSC') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Opcional: procurar a transação antes para apagar o arquivo do disco

    const success = await transactionModel.deleteTransaction(transactionId, oscId);

    if (success) {
      return res.json({ message: 'Transação apagada com sucesso' });
    } else {
      return res.status(404).json({ error: 'Transação não encontrada ou acesso negado' });
    }
  } catch (error) {
    console.error('Erro ao apagar transação:', error);
    return res.status(500).json({ error: 'Erro interno ao apagar transação' });
  }
};

// Download autenticado do comprovante (a pasta /uploads deixou de ser pública)
export const downloadReceipt = async (req, res) => {
  try {
    if (req.user.role !== 'OSC') return res.status(403).json({ error: 'Acesso negado' });

    const [rows] = await pool.execute(
      'SELECT receipt_filename FROM transactions WHERE id = ? AND osc_id = ?',
      [req.params.id, req.user.id]
    );
    const filename = rows[0]?.receipt_filename;
    if (!filename) return res.status(404).json({ error: 'Comprovante não encontrado' });

    const filePath = path.resolve(UPLOADS_ROOT, path.basename(filename));
    if (!filePath.startsWith(UPLOADS_ROOT + path.sep) || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }
    return res.sendFile(filePath);
  } catch (error) {
    console.error('Erro ao baixar comprovante:', error);
    return res.status(500).json({ error: 'Erro interno ao baixar comprovante' });
  }
};
