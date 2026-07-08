import React from 'react';
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
} from '@mui/material';
import { Block, Row } from '../../types';

interface WorkspaceTableProps {
  block: Block;
  onAddRow: () => void;
  onAddColumn: () => void;
}

export function WorkspaceTable({ block, onAddRow, onAddColumn }: WorkspaceTableProps) {
  if (!block.columns || block.columns.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Button variant="contained" onClick={onAddColumn}>
          Додати колонку
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {block.columns.map((col) => (
                <TableCell key={col.id}>
                  {col.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {block.rows && block.rows.map((row) => (
              <TableRow key={row.id}>
                {block.columns.map((col) => (
                  <TableCell key={col.id}>
                    {row.cells[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={onAddRow}>
          Додати рядок
        </Button>
        <Button variant="outlined" onClick={onAddColumn}>
          Додати колонку
        </Button>
      </Stack>
    </Box>
  );
}
