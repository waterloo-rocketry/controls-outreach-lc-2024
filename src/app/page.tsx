"use client";

import Image from "next/image";
import bannerLogo from "@/images/colour_horizontal_standard.png";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  defaultRocketState,
  predictTrajectory,
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
) & { trajectory: RocketState[] };

export default function Home() {
  const [ext, setExt] = useState(58);
  const extRef = useRef(58);
  const [extTraj, setExtTraj] = useState(58);
  const [status, setStatus] = useState<GameStatus>({
    status: "paused",
    trajectory: [defaultRocketState],
  });
  const [timeWarp, setTimeWarp] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus((status) => {
        if (status.status === "running") {
          const now = performance.now();
          const state = step(
            status.trajectory[status.trajectory.length - 1],
            ((performance.now() - status.lastStepMs) * timeWarp) / 1000,
            extRef.current / 100
          );
          if (state === null) {
            return { status: "finished", trajectory: status.trajectory };
          }
          return {
            status: "running",
            lastStepMs: now,
            trajectory: [...status.trajectory, state],
          };
        } else {
          return status;
        }
      });
    }, 50 / timeWarp);
    return () => clearInterval(interval);
  }, [timeWarp]);
  const [target, setTarget] = useState(6660);

  const currentState = status.trajectory[status.trajectory.length - 1];

  const predicted = predictTrajectory(currentState, extTraj / 100);

  return (
    <main className="flex h-screen w-full">
      <div className="overflow-y-scroll border-r shadow">
        <div className="flex flex-col gap-4 p-4 w-96 min-h-screen">
          <div className="flex justify-center">
            <div className="w-64 h-16 relative">
              <a href="https://www.waterloorocketry.com/" target="_blank">
                <Image src={bannerLogo} alt="Waterloo Rocketry Logo" fill />
              </a>
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
                    trajectory: status.trajectory,
                  });
                } else if (status.status === "running") {
                  setStatus({
                    status: "paused",
                    trajectory: status.trajectory,
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
                  trajectory: [defaultRocketState],
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
          <label htmlFor="extension-trajectory" className="text-center">
            Extension for trajectory prediction: {extTraj}%
          </label>
          <input
            type="range"
            name="extension-trajectory"
            min={0}
            max={100}
            step={1}
            value={extTraj}
            onChange={(e) => {
              setExtTraj(e.target.valueAsNumber);
            }}
          />

          <hr />

          <p>Time: {currentState.t_s.toFixed(2)} s</p>
          <p>Altitude: {currentState.y_m.toFixed(0)} m</p>
          <p>
            Vertical Velocity: {Math.max(currentState.vy_m_s, 0.0).toFixed(0)}{" "}
            m/s
          </p>
          <p>Lateral Distance: {currentState.x_m.toFixed(0)} m</p>
          <p>Lateral Velocity: {currentState.vx_m_s.toFixed(0)} m/s</p>

          <hr />

          <div className="flex gap-4">
            <label htmlFor="target" className="w-32">
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
              className="flex-grow"
            />
          </div>

          <div className="flex gap-4">
            <label htmlFor="time-warp" className="w-32">
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
              className="flex-grow"
            />
          </div>

          <hr />

          <p>A video game to see what it&apos;s like to control a rocket!</p>
          <p>
            Based off real aerodynamic data from Cycle 4 of our Borealis rocket.
            To be launched at{" "}
            <a
              href="https://www.launchcanada.org/"
              target="_blank"
              className="text-blue-500"
            >
              Launch Canada
            </a>
            , Timmins ON, August 17&ndash;23, 2024.
          </p>
          <p>
            Controls Outreach Game.{" "}
            <a
              href="https://github.com/waterloo-rocketry/controls-outreach-lc-2024"
              className="text-blue-500"
              target="_blank"
            >
              Source
            </a>
            . Made with ❤️ by Waterloo Rocketry.
          </p>
        </div>
      </div>
      <div className="flex-grow p-8">
        <div className="h-full relative" style={{ containerType: "size" }}>
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
          {/* can deploy at 9 s which is 2665 m, coincidentally close to 1/3 of 8000 */}
          <div className="absolute bottom-1/3 flex items-center w-full gap-4 translate-y-[50%]">
            <p className="w-16 text-yellow-600">Deploy</p>
            <hr className="flex-grow border-yellow-600" />
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 4000 8000"
            className="h-full absolute left-24"
          >
            <path
              d={
                "M0 8000" +
                status.trajectory
                  .map((state) => `L${state.x_m} ${8000 - state.y_m}`)
                  .join("")
              }
              stroke="#000"
              fill="none"
              strokeWidth="1rem"
              strokeLinecap="round"
            />
            <path
              d={predicted
                .map(
                  (state, i) =>
                    `${i === 0 ? "M" : "L"}${state.x_m} ${8000 - state.y_m}`
                )
                .join("")}
              stroke="#fde047"
              fill="none"
              strokeWidth="1rem"
              strokeLinecap="round"
            />
          </svg>
          <div
            className="absolute w-0 h-0"
            style={{
              // Technically you could use the velocity to interpolate each frame
              bottom: `${(currentState.y_m / 8000) * 100}%`,
              left: `calc(6rem + ${(currentState.x_m / 8000) * 100}cqh)`,
              transform: `rotate(${currentState.vx_m_s === 0 && currentState.vy_m_s === 0 ? (5 / 180) * Math.PI : Math.atan2(currentState.vx_m_s, currentState.vy_m_s)}rad)`,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 6 14"
              className="w-6 -translate-x-[50%] -translate-y-[50%]"
            >
              <path
                d={`M 3 0 C 2 1 1 2 1 4 L 1 5 l -${currentState.t_s <= 9 ? 0 : ext / 100} 0 l 0 1 l ${currentState.t_s <= 9 ? 0 : ext / 100} 0 L 1 11 L 0 13 L 0 14 L 2 12 L 2 13 L 4 13 L 4 12 L 6 14 L 6 13 L 5 11 L 5 6 l ${currentState.t_s <= 9 ? 0 : ext / 100} 0 l 0 -1 l -${currentState.t_s <= 9 ? 0 : ext / 100} 0 L 5 4 C 5 2 4 1 3 0`}
                fill={currentState.t_s < 7.69 ? "#f97316" : "#000"}
                className="transition"
              />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}
