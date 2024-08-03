"use client";

import Image from "next/image";
import bannerLogo from "@/images/colour_horizontal_standard.png";
import { useEffect, useReducer, useState } from "react";
import {
  defaultRocketState,
  RocketState,
  step,
} from "@/calculations/calculations";

export default function Home() {
  const [ext, setExt] = useState(0.58);
  const [gameState, setGameState] = useState<[number | null, RocketState]>([
    null,
    defaultRocketState,
  ]);
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(([lastTime, lastState]) => {
        if (lastTime === null) {
          return [null, lastState];
        }
        const now = performance.now();
        return [
          now,
          step(lastState, (performance.now() - lastTime) / 1000, ext),
        ];
      });
    }, 50);
    return () => clearInterval(interval);
  }, [ext]);

  return (
    <main className="flex min-h-screen w-full">
      <div className="flex flex-col gap-4 p-4 border-r shadow w-96">
        <div className="flex justify-center">
          <div className="w-64 h-16 relative">
            <Image src={bannerLogo} alt="Waterloo Rocketry Logo" fill />
          </div>
        </div>
        <h1 className="text-3xl text-center font-bold">Controls Game</h1>
        <p>Use the slider to control the airbrakes and reach the target!</p>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={ext}
          onChange={(e) => {
            setExt(e.target.valueAsNumber);
          }}
        />
        <button
          onClick={() => {
            if (gameState[0] === null) {
              setGameState([performance.now(), gameState[1]]);
            } else {
              setGameState([null, gameState[1]]);
            }
          }}
          className={`px-4 py-2 rounded transition ${gameState[0] === null ? "bg-yellow-300" : "bg-red-300"}`}
        >
          {gameState[0] === null ? "Play" : "Pause"}
        </button>

        <p>Time: {gameState[1].t_s.toFixed(2)} s</p>
        <p>Altitude: {gameState[1].y_m.toFixed(0)} m</p>
      </div>
      <div className="flex-grow p-8">
        <div className="h-full @container relative">
          <div
            className="absolute bg-teal-300 rounded-full translate-y-[50%] left-1/2 w-4 h-4"
            style={{
              bottom: `${(gameState[1].y_m / 8000) * 100}%`,
            }}
          ></div>
          <div className="absolute bottom-0 flex items-center w-full gap-4 translate-y-[50%]">
            <p className="w-16">0 m</p>
            <hr className="flex-grow border-gray-400" />
          </div>
          <div className="absolute bottom-[12.5%] flex items-center w-full gap-4 translate-y-[50%]">
            <p className="w-16">1000 m</p>
            <hr className="flex-grow border-gray-400" />
          </div>
          <div className="absolute bottom-1/4 flex items-center w-full gap-4 translate-y-[50%]">
            <p className="w-16">2000 m</p>
            <hr className="flex-grow border-gray-400" />
          </div>
          <div className="absolute bottom-[37.5%] flex items-center w-full gap-4 translate-y-[50%]">
            <p className="w-16">3000 m</p>
            <hr className="flex-grow border-gray-400" />
          </div>
          <div className="absolute bottom-1/2 flex items-center w-full gap-4 translate-y-[50%]">
            <p className="w-16">4000 m</p>
            <hr className="flex-grow border-gray-400" />
          </div>
          <div className="absolute bottom-[62.5%] flex items-center w-full gap-4 translate-y-[50%]">
            <p className="w-16">5000 m</p>
            <hr className="flex-grow border-gray-400" />
          </div>
          <div className="absolute bottom-3/4 flex items-center w-full gap-4 translate-y-[50%]">
            <p className="w-16">6000 m</p>
            <hr className="flex-grow border-gray-400" />
          </div>
          <div className="absolute bottom-[87.5%] flex items-center w-full gap-4 translate-y-[50%]">
            <p className="w-16">7000 m</p>
            <hr className="flex-grow border-gray-400" />
          </div>
          <div className="absolute bottom-[100%] flex items-center w-full gap-4 translate-y-[50%]">
            <p className="w-16">8000 m</p>
            <hr className="flex-grow border-gray-400" />
          </div>
        </div>
      </div>
    </main>
  );
}
