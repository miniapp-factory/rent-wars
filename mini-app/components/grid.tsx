"use client";

import { useState, useEffect } from "react";

type Cell = {
  owner: string | null;
  price: number;
  basePrice: number;
};

type AIType = "Aggressor" | "Slumlord" | "Sniper";

export default function Grid() {
  const [cells, setCells] = useState<Cell[][]>(
    Array.from({ length: 3 }, () =>
      Array.from({ length: 10 }, () => ({
        owner: null,
        price: 10,
        basePrice: 10,
      }))
    )
  );

  const [aiType] = useState<AIType>(() => {
    const types: AIType[] = ["Aggressor", "Slumlord", "Sniper"];
    return types[Math.floor(Math.random() * types.length)];
  });

  const [playerClass] = useState<string>("Broker"); // placeholder

  const decayRate = 0.01; // 1% per second

  // Price decay effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCells(prev =>
        prev.map(row =>
          row.map(cell => ({
            ...cell,
            price: Math.max(
              cell.basePrice,
              Math.floor(cell.price * (1 - decayRate))
            ),
          }))
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Disaster system
  useEffect(() => {
    const disasterInterval = setInterval(() => {
      const event = Math.random();
      setCells(prev => {
        if (event < 0.33) {
          // Market Crash: all prices drop 20%
          return prev.map(row =>
            row.map(cell => ({
              ...cell,
              price: Math.max(
                cell.basePrice,
                Math.floor(cell.price * 0.8)
              ),
            }))
          );
        } else if (event < 0.66) {
          // Gentrification: increase owned cells by 30%
          return prev.map(row =>
            row.map(cell => {
              if (cell.owner) {
                return {
                  ...cell,
                  price: Math.floor(cell.price * 1.3),
                };
              }
              return cell;
            })
          );
        } else {
          // Earthquake: random 10% cells become unowned
          const newGrid = prev.map(row =>
            row.map(cell => {
              if (Math.random() < 0.1) {
                return { ...cell, owner: null };
              }
              return cell;
            })
          );
          return newGrid;
        }
      });
    }, 60000);
    return () => clearInterval(disasterInterval);
  }, []);

  const handleClick = (x: number, y: number) => {
    setCells(prev => {
      const newCells = prev.map(row => row.map(cell => ({ ...cell })));
      const cell = newCells[y][x];
      const currentUser = "player1";
      if (!cell.owner) {
        cell.owner = currentUser;
        cell.price = Math.floor(cell.price * 1.1);
      } else if (cell.owner !== currentUser) {
        // steal
        cell.owner = currentUser;
        cell.price = Math.floor(cell.price * 2);
      }
      return newCells;
    });
    // AI turn after short delay
    setTimeout(() => {
      aiTurn();
    }, 500);
  };

  const aiTurn = () => {
    setCells(prev => {
      const newCells = prev.map(row => row.map(cell => ({ ...cell })));
      // Simple AI logic based on personality
      if (aiType === "Aggressor") {
        // Find first owned by player and steal
        outer: for (let y = 0; y < 10; y++) {
          for (let x = 0; x < 10; x++) {
            const cell = newCells[y][x];
            if (cell.owner && cell.owner !== "player1") {
              cell.owner = "AI";
              cell.price = Math.floor(cell.price * 2);
              break outer;
            }
          }
        }
      } else if (aiType === "Slumlord") {
        // Buy cheapest available cells
        let cheapest: {x:number,y:number} | null = null;
        let minPrice = Infinity;
        for (let y = 0; y < 3; y++) {
          for (let x = 0; x < 3; x++) {
            const cell = newCells[y][x];
            if (!cell.owner && cell.price < minPrice) {
              minPrice = cell.price;
              cheapest = {x,y};
            }
          }
        }
        if (cheapest) {
          const cell = newCells[cheapest.y][cheapest.x];
          cell.owner = "AI";
          cell.price = Math.floor(cell.price * 1.1);
        }
      } else if (aiType === "Sniper") {
        // Wait for price decay then buy
        let target: {x:number,y:number} | null = null;
        let maxDecay = -1;
        for (let y = 0; y < 3; y++) {
          for (let x = 0; x < 3; x++) {
            const cell = newCells[y][x];
            if (!cell.owner) {
              const decay = cell.basePrice - cell.price;
              if (decay > maxDecay) {
                maxDecay = decay;
                target = {x,y};
              }
            }
          }
        }
        if (target) {
          const cell = newCells[target.y][target.x];
          cell.owner = "AI";
          cell.price = Math.floor(cell.price * 1.1);
        }
      }
      return newCells;
    });
  };

  const playerCount = cells.flat().filter(c => c.owner === "player1").length;
  const aiCount = cells.flat().filter(c => c.owner === "AI").length;
  const win = playerCount > 4;

  const getColor = (price: number) => {
    if (price < 20) return "bg-amber-200";
    if (price < 50) return "bg-orange-300";
    if (price < 100) return "bg-emerald-300";
    return "bg-indigo-400";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <span className="mr-2">AI Type: {aiType}</span>
        <span className="mr-2">Player Class: {playerClass}</span>
        <span>Player: {playerCount} cells | AI: {aiCount} cells</span>
      </div>
      {win && <div className="text-2xl text-green-600 mb-4">You Win!</div>}
      <div className="grid grid-cols-3 gap-1">
        {cells.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-12 h-12 flex items-center justify-center border ${getColor(
                cell.price
              )}`}
              onClick={() => handleClick(x, y)}
            >
              {cell.owner ? cell.owner : "🟫"}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
