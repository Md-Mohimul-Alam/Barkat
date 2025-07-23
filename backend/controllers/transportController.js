// controllers/transportController.js

const fs = require('fs');
const path = require('path');

let transportData = []; // In-memory store; replace with DB for production

exports.getAllStatements = (req, res) => {
  res.status(200).json({ data: transportData });
};

exports.getStatementByDate = (req, res) => {
  const { date } = req.params;
  const found = transportData.find(entry => entry.date === date);
  if (!found) return res.status(404).json({ message: 'No entry found for this date' });
  res.json(found);
};

exports.createStatement = (req, res) => {
  const newEntry = req.body;
  if (!newEntry.date) return res.status(400).json({ message: 'Date is required' });

  transportData.push(newEntry);
  res.status(201).json({ message: 'Entry added', data: newEntry });
};

exports.updateStatement = (req, res) => {
  const { date } = req.params;
  const index = transportData.findIndex(entry => entry.date === date);
  if (index === -1) return res.status(404).json({ message: 'Entry not found' });

  transportData[index] = { ...transportData[index], ...req.body };
  res.json({ message: 'Entry updated', data: transportData[index] });
};

exports.deleteStatement = (req, res) => {
  const { date } = req.params;
  const index = transportData.findIndex(entry => entry.date === date);
  if (index === -1) return res.status(404).json({ message: 'Entry not found' });

  const deleted = transportData.splice(index, 1);
  res.json({ message: 'Entry deleted', data: deleted[0] });
};
