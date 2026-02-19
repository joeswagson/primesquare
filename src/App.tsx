import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const App: React.FC = () => {
  const [primeCount, setPrimeCount] = useState<number>(20);
  const [rows, setRows] = useState<number>(5);
  const [cols, setCols] = useState<number>(5);
  const [primes, setPrimes] = useState<number[]>([]);
  const [differences, setDifferences] = useState<number[]>([]);
  const [grid, setGrid] = useState<number[][]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('#667eea');

  // Generate prime numbers
  const generatePrimes = useCallback((count: number): number[] => {
    if (count <= 0) return [];
    
    const primes: number[] = [];
    let num = 2;
    
    while (primes.length < count) {
      let isPrime = true;
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
          isPrime = false;
          break;
        }
      }
      if (isPrime) {
        primes.push(num);
      }
      num++;
    }
    
    return primes;
  }, []);

  // Calculate differences between consecutive primes
  const calculateDifferences = useCallback((primeList: number[]): number[] => {
    if (primeList.length < 2) return [];
    
    const diffs: number[] = [];
    for (let i = 1; i < primeList.length; i++) {
      diffs.push(primeList[i] - primeList[i - 1]);
    }
    
    return diffs;
  }, []);

  // Initialize or update data when prime count changes
  useEffect(() => {
    const newPrimes = generatePrimes(primeCount);
    setPrimes(newPrimes);
    const newDifferences = calculateDifferences(newPrimes);
    setDifferences(newDifferences);
    
    // Initialize grid with zeros
    const newGrid: number[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < cols; j++) {
        row.push(0);
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  }, [primeCount, rows, cols, generatePrimes, calculateDifferences]);

  // Handle drag start from differences list
  const handleDragStart = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('differenceIndex', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    // Store index for proper insertion at end
    e.dataTransfer.setData('dragSource', 'differences');
    e.dataTransfer.setData('dragIndex', index.toString());
  };

  // Handle drag start from grid cell
  const handleGridDragStart = (row: number, col: number, e: React.DragEvent<HTMLDivElement>) => {
    const value = grid[row][col];
    if (value !== 0) {
      e.dataTransfer.setData('gridValue', `${row}-${col}`);
      e.dataTransfer.effectAllowed = 'move';
      // Store source info for proper reinsertion
      e.dataTransfer.setData('dragSource', 'grid');
      e.dataTransfer.setData('sourceValue', `${value}`);
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop on grid cell
  const handleDropOnGrid = (row: number, col: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const differenceIndex = e.dataTransfer.getData('differenceIndex');
    const gridValue = e.dataTransfer.getData('gridValue');
    
    if (differenceIndex !== '') {
      // Dropping from differences list
      const index = parseInt(differenceIndex);
      if (index >= 0 && index < differences.length) {
        const newGrid = [...grid];
        newGrid[row][col] = differences[index];
        setGrid(newGrid);
      }
    } else if (gridValue !== '') {
      // Dropping from grid cell
      const [fromRow, fromCol] = gridValue.split('-').map(Number);
      const value = grid[fromRow][fromCol];
      if (value !== 0) {
        // Remove from grid
        const newGrid = [...grid];
        newGrid[fromRow][fromCol] = 0;
        setGrid(newGrid);
        
        // Insert at END of list (not beginning) for correct ordering
        const newDifferences = [...differences, value];
        setDifferences(newDifferences);
      }
    }
  };

  // Handle drop on differences list
  const handleDropOnList = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const gridValue = e.dataTransfer.getData('gridValue');
    if (gridValue !== '') {
      // Dropping from grid cell back to list
      const [fromRow, fromCol] = gridValue.split('-').map(Number);
      const value = grid[fromRow][fromCol];
      
      if (value !== 0) {
        // Remove from grid
        const newGrid = [...grid];
        newGrid[fromRow][fromCol] = 0;
        setGrid(newGrid);
        
        // Insert at END of list (not specific position) to maintain consistent ordering
        const newDifferences = [...differences, value];
        setDifferences(newDifferences);
      }
    }
  };

  // Handle grid item click to remove from grid
  const handleGridItemClick = (row: number, col: number) => {
    const value = grid[row][col];
    if (value !== 0) {
      // Remove from grid
      const newGrid = [...grid];
      newGrid[row][col] = 0;
      setGrid(newGrid);
      
      // Insert at END of list (not the beginning) to fix ordering issue
      const newDifferences = [...differences, value];
      setDifferences(newDifferences);
    }
  };

  // Get color for a value
  const getColorForValue = (value: number): string => {
    if (value === 0) return '#f0f0f0';
    
    // Normalize value to 0-1 range for color calculation
    const maxDiff = Math.max(...differences);
    const minDiff = Math.min(...differences);
    const normalized = maxDiff === minDiff ? 0 : (value - minDiff) / (maxDiff - minDiff);
    
    // Use HSL to create a color gradient from blue to red
    const hue = (1 - normalized) * 240; // Blue to red
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Handle prime count change
  const handlePrimeCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setPrimeCount(value);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Prime Difference Grid</h1>
        <p>Visualize differences between consecutive prime numbers</p>
      </header>

      <main className="app-main">
        <div className="controls">
          <div className="prime-count-control">
            <label htmlFor="primeCount">Number of Primes:</label>
            <input
              type="number"
              id="primeCount"
              min="2"
              value={primeCount}
              onChange={handlePrimeCountChange}
              className="number-input"
            />
          </div>
          
          <div className="grid-size-controls">
            <div className="control-group">
              <label htmlFor="rows">Rows:</label>
              <input
                type="number"
                id="rows"
                min="1"
                value={rows}
                onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                className="number-input"
              />
            </div>
            
            <div className="control-group">
              <label htmlFor="cols">Columns:</label>
              <input
                type="number"
                id="cols"
                min="1"
                value={cols}
                onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                className="number-input"
              />
            </div>
          </div>
        </div>

        <div className="grid-container">
          <h2>Prime Difference Grid ({rows}×{cols})</h2>
          <div 
            className="prime-grid"
            style={{ 
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`
            }}
            onDragOver={handleDragOver}
          >
            {grid.map((row, rowIndex) => (
              row.map((value, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="grid-square"
                  draggable={false}
                  onClick={() => handleGridItemClick(rowIndex, colIndex)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnGrid(rowIndex, colIndex, e)}
                  style={{
                    backgroundColor: value !== 0 ? getColorForValue(value) : '#f0f0f0',
                    color: value !== 0 ? 'white' : '#999',
                    fontWeight: 'bold',
                    border: value === 0 ? '2px dashed #ccc' : 'none'
                  }}
                >
                  {value !== 0 ? value : ''}
                </div>
              ))
            ))}
          </div>
        </div>

        <div className="differences-container">
          <h2>Prime Differences ({differences.length} values)</h2>
          <div 
            className="differences-list"
            onDragOver={handleDragOver}
          >
            {differences.map((diff, index) => (
              <div
                key={index}
                className="difference-item"
                draggable
                onDragStart={(e) => handleDragStart(index, e)}
                onDrop={(e) => handleDropOnList(index, e)}
                onDragOver={handleDragOver}
                style={{
                  backgroundColor: getColorForValue(diff),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {diff}
              </div>
            ))}
          </div>
        </div>

        <div className="info-panel">
          <h3>Prime Numbers</h3>
          <p>Total primes generated: {primes.length}</p>
          <p>Primes: {primes.join(', ')}</p>
        </div>
      </main>
    </div>
  );
};

export default App;