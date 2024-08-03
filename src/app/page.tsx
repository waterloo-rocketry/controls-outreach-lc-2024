"use client";

import Image from "next/image";
import bannerLogo from "@/images/colour_horizontal_standard.png";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  defaultRocketState,
  RocketState,
  step,
} from "@/calculations/calculations";

type GameStatus = (
  | {
      status: "running";
      lastStepMs: number;
    }
  | { status: "paused" }
  | {
      status: "finished";
    }
) & { state: RocketState };

export default function Home() {
  const [ext, setExt] = useState(58);
  const extRef = useRef(58);
  const [status, setStatus] = useState<GameStatus>({
    status: "paused",
    state: defaultRocketState,
  });
  const [timeWarp, setTimeWarp] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus((status) => {
        if (status.status === "running") {
          const now = performance.now();
          const state = step(
            status.state,
            ((performance.now() - status.lastStepMs) * timeWarp) / 1000,
            extRef.current / 100
          );
          if (state === null) {
            return { status: "finished", state: status.state };
          }
          return { status: "running", lastStepMs: now, state };
        } else {
          return status;
        }
      });
    }, 50 / timeWarp);
    return () => clearInterval(interval);
  }, [timeWarp]);
  const [target, setTarget] = useState(6660);

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
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (status.status === "paused") {
                setStatus({
                  status: "running",
                  lastStepMs: performance.now(),
                  state: status.state,
                });
              } else if (status.status === "running") {
                setStatus({
                  status: "paused",
                  state: status.state,
                });
              }
            }}
            className={`px-4 py-2 rounded transition flex-1 ${status.status === "running" ? "bg-red-300" : "bg-yellow-300"} disabled:bg-gray-300`}
            disabled={status.status === "finished"}
          >
            {status.status === "running" ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => {
              setStatus({
                status: "paused",
                state: defaultRocketState,
              });
            }}
            className="px-4 py-2 rounded transition bg-purple-300 flex-1"
          >
            Restart
          </button>
        </div>

        <hr />

        <label htmlFor="extension" className="text-center">
          Extension: {ext}%
        </label>
        <input
          type="range"
          name="extension"
          min={0}
          max={100}
          step={1}
          value={ext}
          onChange={(e) => {
            setExt(e.target.valueAsNumber);
            extRef.current = e.target.valueAsNumber;
          }}
        />

        <hr />

        <p>Time: {status.state.t_s.toFixed(2)} s</p>
        <p>Altitude: {status.state.y_m.toFixed(0)} m</p>
        <p>
          Vertical Velocity: {Math.max(status.state.vy_m_s, 0.0).toFixed(0)} m/s
        </p>

        <hr />

        <label htmlFor="target" className="text-center">
          Target: {target} m
        </label>
        <input
          type="range"
          name="target"
          min={6410}
          max={6810}
          step={10}
          value={target}
          onChange={(e) => {
            setTarget(e.target.valueAsNumber);
          }}
        />

        <label htmlFor="time-warp" className="text-center">
          Time warp: x{timeWarp.toFixed(1)}
        </label>
        <input
          type="range"
          name="time-warp"
          min={0}
          max={5}
          step={0.1}
          value={timeWarp}
          onChange={(e) => {
            setTimeWarp(e.target.valueAsNumber);
          }}
        />
      </div>
      <div className="flex-grow p-8">
        <div className="h-full @container relative">
          <div
            className="absolute bg-teal-300 rounded-full translate-y-[50%] left-1/2 w-4 h-4"
            style={{
              bottom: `${(status.state.y_m / 8000) * 100}%`,
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
          {/* can deploy at 9 s which is 2665 m, coincidentally close to 1/3 of 8000 */}
          <div className="absolute bottom-1/3 flex items-center w-full gap-4 translate-y-[50%]">
            <p className="w-16 text-yellow-600">Deploy</p>
            <hr className="flex-grow border-yellow-600" />
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
          <div
            className="absolute flex items-center w-full gap-4 translate-y-[50%]"
            style={{
              bottom: `${(target / 8000) * 100}%`,
            }}
          >
            <p className="w-16 text-purple-600">Target</p>
            <hr className="flex-grow border-purple-600" />
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
