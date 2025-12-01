"use client";

import { useState } from "react";

type Cell = {
  owner: string | null;
  price: number;
};

export default function Grid() {
  const [cells, setCells] = useState<Cell[][]>(
    Array.from({ length: 10 }, () =>
      Array.from({ length: 10 }, () => ({ owner: null, price: 10 }))
    )
  );

  const handleClick = (x: number, y: number) => {
    setCells(prev => {
      const newCells = prev.map(row => row.map(cell => ({ ...cell })));
      const cell = newCells[y][x];
      const currentUser = "player1"; // placeholder for actual player identity
      if (!cell.owner) {
        cell.owner = currentUser;
        cell.price *= 1.1;
      } else if (cell.owner !== currentUser) {
        // steal
        cell.owner = currentUser;
        cell.price *= 2;
      }
      return newCells;
    });
  };

  return (
    <div className="grid grid-cols-10 gap-1 mt-4">
      {cells.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={`w-12 h-12 flex items-center justify-center border ${
              cell.owner ? "bg-green-200" : "bg-amber-200"
            }`}
            onClick={() => handleClick(x, y)}
          >
            {cell.owner ? cell.owner : "🟫"}
          </div>
        ))
      )}
    </div>
  );
}
