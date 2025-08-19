import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export interface CustomTableColumn {
  id: string;
  name: string;
}
export interface CustomTableRow {
  id: string;
  values: string[];
}

interface CustomTableProps {
  columns: CustomTableColumn[];
  rows: CustomTableRow[];
  setColumns: (cols: CustomTableColumn[]) => void;
  setRows: (rows: CustomTableRow[]) => void;
}

export const CustomTable: React.FC<CustomTableProps> = ({ columns, rows, setColumns, setRows }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [cellSizes, setCellSizes] = useState<{ [key: string]: { width: number; height: number } }>({});

  // Helper to get cell key
  const getCellKey = (rowIdx: number, colIdx: number) => `${rowIdx}-${colIdx}`;
  // Add column at index
  const addColumn = (idx?: number) => {
    const insertIdx = typeof idx === 'number' ? idx : columns.length;
    const newCol = { id: Date.now().toString(), name: "New Column" };
    const newCols = [...columns];
    newCols.splice(insertIdx, 0, newCol);
    setColumns(newCols);
    setRows(rows.map(row => {
      const newVals = [...row.values];
      newVals.splice(insertIdx, 0, "");
      return { ...row, values: newVals };
    }));
  };
  // Remove column
  const removeColumn = (colIdx: number) => {
    setColumns(columns.filter((_, idx) => idx !== colIdx));
    setRows(rows.map(row => ({ ...row, values: row.values.filter((_, idx) => idx !== colIdx) })));
  };
  // Edit column name
  const editColumnName = (colIdx: number, name: string) => {
    const newCols = [...columns];
    newCols[colIdx].name = name;
    setColumns(newCols);
  };
  // Add row at index
  const addRow = (idx?: number) => {
    const insertIdx = typeof idx === 'number' ? idx : rows.length;
    const newRow = { id: Date.now().toString(), values: columns.map(() => "") };
    const newRows = [...rows];
    newRows.splice(insertIdx, 0, newRow);
    setRows(newRows);
  };
  // Remove row
  const removeRow = (rowIdx: number) => {
    setRows(rows.filter((_, idx) => idx !== rowIdx));
  };
  // Edit cell value
  const editCell = (rowIdx: number, colIdx: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIdx].values[colIdx] = value;
    setRows(newRows);
  };

  // Resize cell by mouse drag
  const [resizing, setResizing] = useState<{ key: string; dir: 'w'|'h'|null } | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  const handleResizeStart = (rowIdx: number, colIdx: number, dir: 'w'|'h', e: React.MouseEvent) => {
    setResizing({ key: getCellKey(rowIdx, colIdx), dir });
    setStartPos({ x: e.clientX, y: e.clientY });
    e.stopPropagation();
    e.preventDefault();
  };

  React.useEffect(() => {
    if (!resizing || !startPos) return;
    const onMouseMove = (e: MouseEvent) => {
      setCellSizes(prev => {
        const prevSize = prev[resizing.key] || { width: 120, height: 32 };
        let newSize = { ...prevSize };
        if (resizing.dir === 'w') {
          newSize.width = Math.max(40, Math.min(600, prevSize.width + (e.clientX - startPos.x)));
        } else if (resizing.dir === 'h') {
          newSize.height = Math.max(20, Math.min(200, prevSize.height + (e.clientY - startPos.y)));
        }
        return { ...prev, [resizing.key]: newSize };
      });
      setStartPos({ x: e.clientX, y: e.clientY });
    };
    const onMouseUp = () => {
      setResizing(null);
      setStartPos(null);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizing, startPos]);
  const handleApply = () => {
    setIsEditing(false);
  };

  const handleCustomize = () => {
    setIsEditing(true);
  };
  return (
    <div className="mb-6 border rounded p-4 bg-white">
  {/* Remove top add buttons, now handled inline like MS Word */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col, colIdx) => (
              <th key={col.id} className="border px-2 py-1 bg-gray-100 relative">
                <input
                  type="text"
                  value={col.name}
                  onChange={e => editColumnName(colIdx, e.target.value)}
                  className="w-32 border rounded px-1"
                  disabled={!isEditing}
                />
                {isEditing && (
                  <>
                    <Button variant="destructive" size="sm" onClick={() => removeColumn(colIdx)} className="ml-2">X</Button>
                    {/* Add column button */}
                    <button
                      type="button"
                      style={{ position: 'absolute', right: -18, top: '50%', transform: 'translateY(-50%)', zIndex: 3, background: '#e5e5e5', border: '1px solid #888', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontWeight: 'bold', fontSize: 14 }}
                      onClick={() => addColumn(colIdx + 1)}
                    >+</button>
                    {/* Resize handle for column */}
                    <div
                      style={{ position: 'absolute', right: -4, top: 0, width: 8, height: '100%', cursor: 'col-resize', zIndex: 2, background: resizing?.key === `header-${colIdx}` && resizing?.dir === 'w' ? '#0078d4' : 'transparent' }}
                      onMouseDown={e => handleResizeStart(0, colIdx, 'w', e)}
                    />
                  </>
                )}
              </th>
            ))}
            {/* Add column at end */}
            {isEditing && (
              <th style={{ position: 'relative', width: 24 }}>
                <button
                  type="button"
                  style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 3, background: '#e5e5e5', border: '1px solid #888', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontWeight: 'bold', fontSize: 14 }}
                  onClick={() => addColumn(columns.length)}
                >+</button>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={row.id}>
              {row.values.map((val, colIdx) => {
                const key = getCellKey(rowIdx, colIdx);
                const size = cellSizes[key] || { width: 120, height: 32 };
                return (
                  <td
                    key={colIdx}
                    className="border px-2 py-1 relative"
                    style={{ width: size.width, height: size.height, minWidth: 40, minHeight: 20 }}
                  >
                    <input
                      type="text"
                      value={val}
                      onChange={e => editCell(rowIdx, colIdx, e.target.value)}
                      className="w-full border rounded px-1"
                      style={{ height: '100%' }}
                    />
                    {isEditing && (
                      <>
                        {/* MS Word-like resize handles */}
                        <div
                          style={{ position: 'absolute', right: -4, top: 0, width: 8, height: '100%', cursor: 'col-resize', zIndex: 2, background: resizing?.key === key && resizing?.dir === 'w' ? '#0078d4' : 'transparent' }}
                          onMouseDown={e => handleResizeStart(rowIdx, colIdx, 'w', e)}
                        />
                        <div
                          style={{ position: 'absolute', left: 0, bottom: -4, width: '100%', height: 8, cursor: 'row-resize', zIndex: 2, background: resizing?.key === key && resizing?.dir === 'h' ? '#0078d4' : 'transparent' }}
                          onMouseDown={e => handleResizeStart(rowIdx, colIdx, 'h', e)}
                        />
                        {/* Add column button */}
                        {rowIdx === 0 && (
                          <button
                            type="button"
                            style={{ position: 'absolute', right: -18, top: '50%', transform: 'translateY(-50%)', zIndex: 3, background: '#e5e5e5', border: '1px solid #888', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontWeight: 'bold', fontSize: 14 }}
                            onClick={() => addColumn(colIdx + 1)}
                          >+</button>
                        )}
                        {/* Add row button */}
                        {colIdx === row.values.length - 1 && (
                          <button
                            type="button"
                            style={{ position: 'absolute', left: '50%', bottom: -18, transform: 'translateX(-50%)', zIndex: 3, background: '#e5e5e5', border: '1px solid #888', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontWeight: 'bold', fontSize: 14 }}
                            onClick={() => addRow(rowIdx + 1)}
                          >+</button>
                        )}
                      </>
                    )}
                  </td>
                );
              })}
              {isEditing && (
                <td>
                  <Button variant="destructive" size="sm" onClick={() => removeRow(rowIdx)}>Delete Row</Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {isEditing && (
        <Button
          onClick={handleApply}
          className="apply-btn mt-4"
          variant="default"
        >
          Apply
        </Button>
      )}
      {!isEditing && (
        <Button
          onClick={handleCustomize}
          className="customize-btn mt-4"
          variant="outline"
        >
          Customize
        </Button>
      )}
      {/* Hide Apply and Customize buttons when printing */}
      <style>{`
        @media print {
          .apply-btn, .customize-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
};
