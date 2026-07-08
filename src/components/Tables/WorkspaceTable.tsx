import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { Block, Row, Column } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { FIELD_TYPES } from '../../constants';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface WorkspaceTableProps {
  block: Block;
}

export function WorkspaceTable({ block }: WorkspaceTableProps) {
  const { addRow, updateCellValue, removeRow, addNewColumn } = useAppContext();
  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAddRowDialogOpen, setIsAddRowDialogOpen] = useState(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('text');

  const handleCellClick = (rowId: string, columnId: string, value: any) => {
    setEditingCell({ rowId, colId: columnId });
    setEditValue(value?.value || '');
  };

  const handleCellSave = async (rowId: string, columnId: string) => {
    await updateCellValue(block.id, rowId, columnId, editValue);
    setEditingCell(null);
  };

  const handleAddRow = async () => {
    const newRow: Row = {
      id: generateId(),
      cells: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Initialize cells with values from dialog
    block.columns.forEach((col) => {
      newRow.cells[col.id] = {
        value: newRowData[col.id] || '',
      };
    });

    await addRow(block.id, newRow);
    setIsAddRowDialogOpen(false);
    setNewRowData({});
  };

  const handleAddColumn = async () => {
    const newColumn: Column = {
      id: generateId(),
      name: newColumnName,
      type: newColumnType as any,
      order: block.columns.length,
    };

    await addNewColumn(block.id, newColumn);
    setIsAddColumnDialogOpen(false);
    setNewColumnName('');
    setNewColumnType('text');
  };

  const handleDeleteRow = async (rowId: string) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей рядок?')) {
      await removeRow(block.id, rowId);
    }
  };

  if (!block.columns || block.columns.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddColumnDialogOpen(true)}
        >
          Додати першу колонку
        </Button>

        <Dialog open={isAddColumnDialogOpen} onClose={() => setIsAddColumnDialogOpen(false)}>
          <DialogTitle>Додати колонку</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <TextField
              label="Назва колонки"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Тип</InputLabel>
              <Select value={newColumnType} onChange={(e) => setNewColumnType(e.target.value)} label="Тип">
                {FIELD_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddColumnDialogOpen(false)}>Скасувати</Button>
            <Button onClick={handleAddColumn} variant="contained">
              Додати
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              {block.columns.map((col) => (
                <TableCell key={col.id} sx={{ fontWeight: 'bold' }}>
                  {col.name}
                  <br />
                  <small style={{ opacity: 0.6 }}>({col.type})</small>
                </TableCell>
              ))}
              <TableCell align="center" sx={{ width: 100 }}>
                Дії
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {block.rows && block.rows.length > 0 ? (
              block.rows.map((row) => (
                <TableRow key={row.id} hover>
                  {block.columns.map((col) => {
                    const cellData = row.cells[col.id];
                    const isEditing = editingCell?.rowId === row.id && editingCell?.colId === col.id;

                    return (
                      <TableCell
                        key={col.id}
                        onClick={() => handleCellClick(row.id, col.id, cellData)}
                        sx={{
                          cursor: 'pointer',
                          padding: isEditing ? 0 : 1,
                          '&:hover': { backgroundColor: '#fafafa' },
                        }}
                      >
                        {isEditing ? (
                          <TextField
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleCellSave(row.id, col.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCellSave(row.id, col.id);
                              }
                            }}
                            size="small"
                            fullWidth
                          />
                        ) : (
                          cellData?.value || ''
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">
                    <Tooltip title="Видалити рядок">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRow(row.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={block.columns.length + 1} align="center">
                  Немає даних
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setIsAddRowDialogOpen(true)}
        >
          Додати рядок
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setIsAddColumnDialogOpen(true)}
        >
          Додати колонку
        </Button>
      </Stack>

      {/* Add Row Dialog */}
      <Dialog open={isAddRowDialogOpen} onClose={() => setIsAddRowDialogOpen(false)}>
        <DialogTitle>Додати новий рядок</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          {block.columns.map((col) => (
            <TextField
              key={col.id}
              label={col.name}
              value={newRowData[col.id] || ''}
              onChange={(e) => setNewRowData({ ...newRowData, [col.id]: e.target.value })}
              fullWidth
              margin="normal"
              type={col.type === 'number' ? 'number' : 'text'}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddRowDialogOpen(false)}>Скасувати</Button>
          <Button onClick={handleAddRow} variant="contained">
            Додати
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Column Dialog */}
      <Dialog open={isAddColumnDialogOpen} onClose={() => setIsAddColumnDialogOpen(false)}>
        <DialogTitle>Додати колонку</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            label="Назва колонки"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Тип поля</InputLabel>
            <Select value={newColumnType} onChange={(e) => setNewColumnType(e.target.value)} label="Тип поля">
              {FIELD_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddColumnDialogOpen(false)}>Скасувати</Button>
          <Button onClick={handleAddColumn} variant="contained">
            Додати
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
