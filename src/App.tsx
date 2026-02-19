import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { resolveColor, colorConditions, applyTables } from './ColorConditions';

const App: React.FC = () => {
  const [primeCount, setPrimeCount] = useState<number>(20);
  const [rows, setRows] = useState<number>(5);
  const [cols, setCols] = useState<number>(5);
  const [primes, setPrimes] = useState<number[]>([]);
  const [staticDifferences, setStaticDifferences] = useState<number[]>([]);
  const [differences, setDifferences] = useState<number[]>([]);
  const [grid, setGrid] = useState<number[][]>([]);
  const [originIndexMap, setOriginIndexMap] = useState<Record<string, number>>({});
  const [hiddenIndices, setHiddenIndices] = useState<number[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('#667eea');

  const generatePrimes = useCallback((count: number): number[] => {
    if (count <= 0) return [];
    const primes: number[] = [];
    let num = 2;
    while (primes.length < count) {
      let isPrime = true;
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) { isPrime = false; break; }
      }
      if (isPrime) primes.push(num);
      num++;
    }
    return primes;
  }, []);

  const calculateDifferences = useCallback((primeList: number[]): number[] => {
    if (primeList.length < 2) return [];
    const diffs: number[] = [];
    for (let i = 1; i < primeList.length; i++) {
      diffs.push(primeList[i] - primeList[i - 1]);
    }
    return diffs;
  }, []);

  useEffect(() => {
    const newPrimes = generatePrimes(primeCount);
    const newDifferences = calculateDifferences(newPrimes);
    setPrimes(newPrimes);
    setStaticDifferences(newDifferences);
    setDifferences([...newDifferences]);

    applyTables(newPrimes, newDifferences);

    const newGrid: number[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < cols; j++) row.push(0);
      newGrid.push(row);
    }
    setGrid(newGrid);
    setOriginIndexMap({});
    setHiddenIndices([]);
  }, [primeCount, rows, cols, generatePrimes, calculateDifferences]);

  const handleDragStart = (index: number, e: React.DragEvent) => {
    e.dataTransfer.setData('differenceIndex', index.toString());
    e.dataTransfer.setData('dragSource', 'differences');
    e.dataTransfer.setData('originIndex', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleGridDragStart = (row: number, col: number, e: React.DragEvent) => {
    const value = grid[row][col];
    if (value !== 0) {
      e.dataTransfer.setData('gridValue', `${row}-${col}`);
      e.dataTransfer.setData('dragSource', 'grid');
      const storedIndex = originIndexMap[`${row}-${col}`];
      if (storedIndex !== undefined) e.dataTransfer.setData('originIndex', storedIndex.toString());
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnGrid = (row: number, col: number, e: React.DragEvent) => {
    e.preventDefault();
    const differenceIndex = e.dataTransfer.getData('differenceIndex');
    const gridValue = e.dataTransfer.getData('gridValue');
    const dragSource = e.dataTransfer.getData('dragSource');

    if (dragSource === 'differences' && differenceIndex !== '') {
      const index = parseInt(differenceIndex);
      const value = differences[index];
      const key = `${row}-${col}`;
      const existingOrigin = originIndexMap[key];
      let newHidden = [...hiddenIndices];
      if (existingOrigin !== undefined) newHidden = newHidden.filter(i => i !== existingOrigin);
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = value;
      setGrid(newGrid);
      setOriginIndexMap({...originIndexMap, [key]: index});
      if (!newHidden.includes(index)) newHidden.push(index);
      setHiddenIndices(newHidden);

    } else if (dragSource === 'grid' && gridValue !== '') {
      const [fromRow, fromCol] = gridValue.split('-').map(Number);
      const value = grid[fromRow][fromCol];
      if (value !== 0) {
        const newGrid = grid.map(r => [...r]);
        newGrid[fromRow][fromCol] = 0;
        newGrid[row][col] = value;
        setGrid(newGrid);
        const srcKey = `${fromRow}-${fromCol}`;
        const destKey = `${row}-${col}`;
        const originMapCopy = {...originIndexMap};
        const storedIndex = originMapCopy[srcKey];
        delete originMapCopy[srcKey];
        const existingDestOrigin = originMapCopy[destKey];
        let newHidden = [...hiddenIndices];
        if (existingDestOrigin !== undefined) newHidden = newHidden.filter(i => i !== existingDestOrigin);
        if (storedIndex !== undefined) originMapCopy[destKey] = storedIndex;
        setOriginIndexMap(originMapCopy);
        setHiddenIndices(newHidden);
      }
    }
  };

  const handleDropOnList = (e: React.DragEvent) => {
    e.preventDefault();
    const gridValue = e.dataTransfer.getData('gridValue');
    const dragSource = e.dataTransfer.getData('dragSource');
    if (dragSource === 'grid' && gridValue !== '') {
      const [fromRow, fromCol] = gridValue.split('-').map(Number);
      const value = grid[fromRow][fromCol];
      if (value !== 0) {
        const key = `${fromRow}-${fromCol}`;
        const storedIndex = originIndexMap[key];
        const newGrid = grid.map(r => [...r]);
        newGrid[fromRow][fromCol] = 0;
        setGrid(newGrid);
        const originMapCopy = {...originIndexMap};
        delete originMapCopy[key];
        setOriginIndexMap(originMapCopy);
        if (storedIndex !== undefined) {
          setHiddenIndices(hiddenIndices.filter(i => i !== storedIndex));
        }
      }
    }
  };

  const handleGridItemClick = (row: number, col: number) => {
    const key = `${row}-${col}`;
    const index = originIndexMap[key];
    if (index !== undefined) {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = 0;
      setGrid(newGrid);
      const originMapCopy = {...originIndexMap};
      delete originMapCopy[key];
      setOriginIndexMap(originMapCopy);
      setHiddenIndices(hiddenIndices.filter(i => i !== index));
    }
  };

  const getColorForValue = (value: number): string => {
    if (value === 0) return '#f0f0f0';
    const maxDiff = Math.max(...differences);
    const minDiff = Math.min(...differences);
    const normalized = maxDiff === minDiff ? 0 : (value - minDiff) / (maxDiff - minDiff);
    const hue = (1 - normalized) * 240;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const handlePrimeCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) setPrimeCount(value);
  };

  return (
    <div className="app">
      <div className="main">
        <div className="left">
          <div className="controls">
            <div className="prime-count-control">
              <label htmlFor="primeCount">Number of Primes:</label>
              <input type="number" id="primeCount" min="2" value={primeCount} onChange={handlePrimeCountChange} className="number-input" />
            </div>
            <div className="grid-size-controls">
              <div className="control-group">
                <label htmlFor="rows">Rows:</label>
                <input type="number" id="rows" min="1" value={rows} onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))} className="number-input" />
              </div>
              <div className="control-group">
                <label htmlFor="cols">Columns:</label>
                <input type="number" id="cols" min="1" value={cols} onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))} className="number-input" />
              </div>
            </div>
          </div>

          <div className="grid-container">
            <h2>Prime Difference Grid ({rows}×{cols})</h2>
            <div
              className="prime-grid"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
              onDragOver={handleDragOver}
            >
              {grid.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="grid-square"
                    draggable={true}
                    onClick={() => handleGridItemClick(rowIndex, colIndex)}
                    onDragStart={(e) => handleGridDragStart(rowIndex, colIndex, e)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnGrid(rowIndex, colIndex, e)}
                    style={{
                      backgroundColor: value !== 0 ? getColorForValue(value) : '#f0f0f0',
                      color: value !== 0 ? 'white' : '#999',
                      fontWeight: 'bold',
                      border: value === 0 ? '2px dashed #ccc' : 'none'
                    }}
                    data-origin-index={originIndexMap[`${rowIndex}-${colIndex}`]}
                  >
                    {value !== 0 ? value : ''}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="right">
          <div className="prime-list">
            <h2> &Delta;Primes ({differences.length})</h2>
            <div className="differences-list" onDragOver={handleDragOver} onDrop={handleDropOnList}>
              {differences.map((diff, index) => {
                if (hiddenIndices.includes(index)) {
                  return <div key={index} className="diff-row"><div className="diff-row-left" /><div className="placeholder-item" /><div className="diff-row-right" /></div>;
                }
                return (
                  <div key={index} className="diff-row">
                    {/* Left zone: index info, right-aligned */}
                    <div className="diff-row-left">
                      <span className="diff-index">#{index + 1}</span>
                      <span className="diff-prime-val">Prime: <b>{primes[index]}</b></span>
                    </div>

                    {/* Center: the square draggable element */}
                    <div
                      className="difference-item"
                      draggable
                      onDragStart={(e) => handleDragStart(index, e)}
                      onDragOver={handleDragOver}
                      style={{ backgroundColor: getColorForValue(diff), color: 'white', fontWeight: 'bold' }}
                    >
                      {diff}
                    </div>

                    {/* Right zone: condition circles, left-aligned */}
                    <div className="diff-row-right">
                      {colorConditions.map((cond, ci) => (
                        <span
                          key={ci}
                          className="condition-circle"
                          title={cond.label}
                          style={cond.match(index) ? {
                            backgroundColor: cond.color,
                            borderColor: cond.color,
                          } : {
                            backgroundColor: 'transparent',
                            borderColor: '#ccc',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>

  );
};

export default App;