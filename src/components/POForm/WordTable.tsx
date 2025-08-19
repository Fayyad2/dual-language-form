import React, { useState, useRef, useEffect } from "react";
import './WordTable.css';

// Table model: rows, columns, cell content, column widths, row heights
const MIN_COL_WIDTH = 60;
const MIN_ROW_HEIGHT = 28;

function createInitialTable(cols = 3, rows = 3) {
  return {
    columns: Array.from({ length: cols }, (_, i) => ({
      id: `col${i}`,
      width: 120,
      name: `Column ${i + 1}`,
    })),
    rows: Array.from({ length: rows }, (_, i) => ({
      id: `row${i}`,
      height: 32,
      cells: Array.from({ length: cols }, () => ""),
    })),
  };
}

/**
 * Props:
 * - value: table data (optional, for controlled usage)
 * - onChange: callback when table data changes (for controlled usage)
 */
export default function WordTable({ value, onChange }: {
  value?: any,
  onChange?: (table: any) => void
}) {
  const isControlled = value !== undefined && onChange !== undefined;
  const [table, setTable] = useState(value || createInitialTable());
  const [hoveredCol, setHoveredCol] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [resizing, setResizing] = useState(null); // { type, idx, startX, startY, startWidth, startHeight }
  const [selectedCells, setSelectedCells] = useState([]); // [{rowIdx, colIdx, center?}]
  const [isSelecting, setIsSelecting] = useState(false);
  const [tableDir, setTableDir] = useState<'ltr'|'rtl'>('ltr');
  const tableRef = useRef<HTMLDivElement>(null);

  // Insert column at idx
  const insertCol = idx => {
    const updater = prev => {
      const newCol = { id: `col${Date.now()}`, width: 120, name: "New Column" };
      const columns = [...prev.columns];
      columns.splice(idx, 0, newCol);
      const rows = prev.rows.map(row => ({
        ...row,
        cells: [...row.cells.slice(0, idx), "", ...row.cells.slice(idx)],
      }));
      return { columns, rows };
    };
    if (isControlled) {
      onChange(updater(table));
    } else {
      setTable(updater);
    }
  };

  // Insert row at idx
  const insertRow = idx => {
    const updater = prev => {
      const newRow = {
        id: `row${Date.now()}`,
        height: 32,
        cells: Array(prev.columns.length).fill("")
      };
      const rows = [...prev.rows];
      rows.splice(idx, 0, newRow);
      return { columns: prev.columns, rows };
    };
    if (isControlled) {
      onChange(updater(table));
    } else {
      setTable(updater);
    }
  };

  // Resize column
  const startColResize = (idx, e) => {
    setResizing({ type: "col", idx, startX: e.clientX, startWidth: table.columns[idx].width });
    e.preventDefault();
    e.stopPropagation();
  };
  // Resize row
  const startRowResize = (idx, e) => {
    setResizing({ type: "row", idx, startY: e.clientY, startHeight: table.rows[idx].height });
    e.preventDefault();
    e.stopPropagation();
  };

  // Mouse move for resizing
  useEffect(() => {
    if (!resizing) return;
    const onMove = e => {
      if (resizing.type === "col") {
        const dx = e.clientX - resizing.startX;
        const updater = prev => {
          const columns = [...prev.columns];
          const newWidth = Math.max(MIN_COL_WIDTH, resizing.startWidth + dx);
          columns[resizing.idx] = { ...columns[resizing.idx], width: newWidth };
          return { ...prev, columns };
        };
        if (isControlled) {
          onChange(updater(table));
        } else {
          setTable(updater);
        }
      } else if (resizing.type === "row") {
        const dy = e.clientY - resizing.startY;
        const updater = prev => {
          const rows = [...prev.rows];
          const newHeight = Math.max(MIN_ROW_HEIGHT, resizing.startHeight + dy);
          rows[resizing.idx] = { ...rows[resizing.idx], height: newHeight };
          return { ...prev, rows };
        };
        if (isControlled) {
          onChange(updater(table));
        } else {
          setTable(updater);
        }
      }
    };
    const onUp = () => setResizing(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    // eslint-disable-next-line
  }, [resizing, table, isControlled, onChange]);

  // Edit cell
  const editCell = (rowIdx, colIdx, value) => {
    const updater = prev => {
      const rows = [...prev.rows];
      rows[rowIdx] = { ...rows[rowIdx], cells: [...rows[rowIdx].cells] };
      rows[rowIdx].cells[colIdx] = value;
      return { ...prev, rows };
    };
    if (isControlled) {
      onChange(updater(table));
    } else {
      setTable(updater);
    }
  };
  // Keep internal state in sync with value prop if controlled
  useEffect(() => {
    if (isControlled) {
      setTable(value);
    }
    // eslint-disable-next-line
  }, [value]);

  // Select cell (click or drag)
  const handleCellMouseDown = (rowIdx, colIdx, e) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsSelecting(true);
    setSelectedCells([{ rowIdx, colIdx }]);
  };

  // Mouse drag selection
  const handleCellMouseEnter = (rowIdx, colIdx, e) => {
    if (isSelecting && (e.buttons & 1)) { // Only if mouse1 is held
      setSelectedCells(prev => {
        const exists = prev.some(c => c.rowIdx === rowIdx && c.colIdx === colIdx);
        if (exists) return prev;
        return [...prev, { rowIdx, colIdx }];
      });
    }
  };
  React.useEffect(() => {
    const handleMouseUp = () => setIsSelecting(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Keyboard actions
  React.useEffect(() => {
    const handleKeyDown = e => {
      // LTR/RTL toggle
      if (e.ctrlKey && e.shiftKey && e.code === 'ShiftLeft' && e.code === 'ControlLeft') {
        setTableDir('ltr');
        e.preventDefault();
      }
      if (e.ctrlKey && e.shiftKey && e.code === 'ShiftRight' && e.code === 'ControlRight') {
        setTableDir('rtl');
        e.preventDefault();
      }
      if (!table || !table.columns || !table.rows || selectedCells.length === 0) return;
      // Merge selected cells on Delete
      if ((e.key === "Delete" || e.key === "Backspace") && selectedCells.length > 1) {
        setTable(prev => {
          if (!prev || !prev.rows) return prev;
          const rows = [...prev.rows];
          // Get all selected cell values
          const mergedValue = selectedCells.map(({ rowIdx, colIdx }) => rows[rowIdx]?.cells[colIdx] || '').join(' ');
          // Use the first cell as the merged cell
          const { rowIdx: firstRow, colIdx: firstCol } = selectedCells[0];
          rows[firstRow].cells[firstCol] = mergedValue;
          // Remove other cells (set to empty)
          selectedCells.slice(1).forEach(({ rowIdx, colIdx }) => {
            if (rows[rowIdx] && rows[rowIdx].cells[colIdx] !== undefined) {
              rows[rowIdx].cells[colIdx] = "";
            }
          });
          return { ...prev, rows };
        });
        setSelectedCells([{ ...selectedCells[0] }]);
        e.preventDefault();
      }
      // Center text in cell (Ctrl+E, but only if table is focused)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        if (document.activeElement && tableRef.current && tableRef.current.contains(document.activeElement)) {
          setSelectedCells(prev => prev.map(c => ({ ...c, center: true })));
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCells, table]);

  if (!table || !table.columns || !table.rows) {
    return <div className="word-table-wrapper">Table data is invalid.</div>;
  }
  return (
    <div className="word-table-wrapper" ref={tableRef} tabIndex={0} style={{ direction: tableDir }}>
      <table className="word-table">
        <thead>
          <tr>
            {table.columns.map((col, colIdx) => (
              <th
                key={col.id}
                style={{ width: col.width, textAlign: tableDir === 'rtl' ? 'right' : 'left' }}
                onMouseEnter={() => setHoveredCol(colIdx)}
                onMouseLeave={() => setHoveredCol(null)}
                className="word-table-th"
              >
                <input
                  value={col.name}
                  onChange={e => {
                    setTable(prev => {
                      if (!prev || !prev.columns) return prev;
                      const columns = [...prev.columns];
                      columns[colIdx] = { ...columns[colIdx], name: e.target.value };
                      return { ...prev, columns };
                    });
                  }}
                  className="word-table-header-input"
                  style={{ textAlign: tableDir === 'rtl' ? 'right' : 'left' }}
                />
                {/* Insert column button */}
                {hoveredCol === colIdx && (
                  <button
                    className="word-table-insert-col"
                    onClick={() => insertCol(colIdx + 1)}
                  >+</button>
                )}
                {/* Resize handle */}
                <div
                  className="word-table-col-resize"
                  onMouseDown={e => startColResize(colIdx, e)}
                />
              </th>
            ))}
            {/* Insert column at end */}
            <th style={{ width: 24 }}>
              <button
                className="word-table-insert-col"
                onClick={() => insertCol(table.columns.length)}
              >+</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIdx) => (
            <tr key={row.id} style={{ height: row.height }}>
              {row.cells.map((cell, colIdx) => {
                const isSelected = selectedCells.some(c => c.rowIdx === rowIdx && c.colIdx === colIdx);
                const isCentered = selectedCells.some(c => c.rowIdx === rowIdx && c.colIdx === colIdx && c.center);
                return (
                  <td
                    key={colIdx}
                    className={`word-table-td${isSelected ? ' word-table-cell-selected' : ''}${isCentered ? ' word-table-cell-centered' : ''}`}
                    onMouseDown={e => handleCellMouseDown(rowIdx, colIdx, e)}
                    onMouseEnter={e => handleCellMouseEnter(rowIdx, colIdx, e)}
                  >
                    <input
                      value={cell}
                      onChange={e => editCell(rowIdx, colIdx, e.target.value)}
                      className="word-table-cell-input"
                      style={{ textAlign: isCentered ? 'center' : (tableDir === 'rtl' ? 'right' : 'left') }}
                    />
                    {/* Insert row button */}
                    {hoveredRow === rowIdx && colIdx === 0 && (
                      <button
                        className="word-table-insert-row"
                        onClick={() => insertRow(rowIdx + 1)}
                      >+</button>
                    )}
                    {/* Resize handle for row */}
                    {colIdx === 0 && (
                      <div
                        className="word-table-row-resize"
                        onMouseDown={e => startRowResize(rowIdx, e)}
                      />
                    )}
                  </td>
                );
              })}
              {/* Insert row at end */}
              <td style={{ width: 24 }}>
                <button
                  className="word-table-insert-row"
                  onClick={() => insertRow(table.rows.length)}
                >+</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
