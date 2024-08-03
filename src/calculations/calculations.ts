class Cubic2VariableFunction {
  p00: number;
  p10: number;
  p01: number;
  p20: number;
  p11: number;
  p02: number;
  p30: number;
  p21: number;
  p12: number;
  p03: number;

  constructor(
    p00: number,
    p10: number,
    p01: number,
    p20: number,
    p11: number,
    p02: number,
    p30: number,
    p21: number,
    p12: number,
    p03: number
  ) {
    this.p00 = p00;
    this.p10 = p10;
    this.p01 = p01;
    this.p20 = p20;
    this.p11 = p11;
    this.p02 = p02;
    this.p30 = p30;
    this.p21 = p21;
    this.p12 = p12;
    this.p03 = p03;
  }

  compute(x: number, y: number): number {
    return (
      this.p00 +
      this.p10 * x +
      this.p01 * y +
      this.p20 * x * x +
      this.p11 * x * y +
      this.p02 * y * y +
      this.p30 * x * x * x +
      this.p21 * x * x * y +
      this.p12 * x * y * y +
      this.p03 * y * y * y
    );
  }
}

function dragAccel_m_s2(ext: number, vel_m_s: number, alt_m: number): number {
  const polys = [
    new Cubic2VariableFunction(
      232.2951,
      244.701,
      -75.1435,
      64.3402,
      -79.522,
      11.7309,
      -0.8306,
      -20.4344,
      9.7041,
      -0.6148
    ),
    new Cubic2VariableFunction(
      235.8993,
      249.21,
      -76.2767,
      65.8251,
      -81.2931,
      12.0289,
      -0.8408,
      -21.0236,
      9.9787,
      -0.7853
    ),
    new Cubic2VariableFunction(
      245.6886,
      260.2967,
      -80.2111,
      69.3746,
      -85.4361,
      12.5705,
      -0.6199,
      -22.1676,
      10.4297,
      -0.6666
    ),
    new Cubic2VariableFunction(
      253.9691,
      270.2409,
      -83.5032,
      72.3919,
      -89.3117,
      13.3189,
      -0.7371,
      -23.2489,
      11.0822,
      -0.7471
    ),
    new Cubic2VariableFunction(
      263.5127,
      280.7695,
      -86.9338,
      75.8929,
      -93.6884,
      14.1591,
      -0.3771,
      -24.5324,
      11.7445,
      -0.9399
    ),
    new Cubic2VariableFunction(
      272.4592,
      290.567,
      -90.104,
      78.881,
      -97.0343,
      14.5126,
      -0.1988,
      -25.6374,
      12.0348,
      -0.7327
    ),
    new Cubic2VariableFunction(
      284.8368,
      304.7727,
      -94.4923,
      82.4469,
      -101.4462,
      15.108,
      -0.6357,
      -26.5433,
      12.4927,
      -0.8323
    ),
    new Cubic2VariableFunction(
      296.2638,
      317.3919,
      -98.5746,
      86.2809,
      -106.2663,
      15.9556,
      -0.5224,
      -28.0106,
      13.2557,
      -0.8541
    ),
    new Cubic2VariableFunction(
      303.1856,
      325.1022,
      -100.9674,
      88.7552,
      -109.3743,
      16.5627,
      -0.4253,
      -28.9892,
      13.8034,
      -0.9447
    ),
    new Cubic2VariableFunction(
      316.4963,
      339.6502,
      -104.557,
      92.4088,
      -114.1954,
      16.9114,
      -0.5681,
      -30.4995,
      13.9269,
      -1.2933
    ),
    new Cubic2VariableFunction(
      340.9146,
      367.152,
      -114.8622,
      101.0439,
      -123.1214,
      18.4047,
      -0.1879,
      -31.8071,
      15.4422,
      -1.1456
    ),
  ];
  const idx = Math.floor(ext * 10);
  const x = (vel_m_s - 273.9) / 148.7;
  const y = (alt_m + 295 - 5000) / 3172;
  if (idx === 10) return polys[10].compute(x, y) / ROCKET_BURNOUT_MASS_KG;
  const a = polys[idx].compute(x, y);
  const b = polys[idx + 1].compute(x, y);
  const shift = ext * 10 - idx;
  const out = shift * b + (1 - shift) * a;
  return Math.max(0, out) / ROCKET_BURNOUT_MASS_KG;
}

const GRAV_AT_SEA_LVL = 9.80665; // m/s^2
const EARTH_MEAN_RADIUS = 6371009; // m
const ROCKET_BURNOUT_MASS_KG = 39.609;

type Accelerations = { ay_m_s2: number; ax_m_s2: number };

function gravitationalAccel_m_s2(altitude_m: number): number {
  return (
    GRAV_AT_SEA_LVL *
    Math.pow(EARTH_MEAN_RADIUS / (EARTH_MEAN_RADIUS + altitude_m), 2)
  );
}

function getAccels(
  extension: number,
  vx_m_s: number,
  vy_m_s: number,
  y_m: number
): Accelerations {
  // Total spee
  const speed_m_s = Math.sqrt(vy_m_s * vy_m_s + vx_m_s * vx_m_s);
  // Acceleration due to drag
  const ad_m_s2 = -dragAccel_m_s2(extension, speed_m_s, y_m);
  // Acceleration due to gravity
  const ag_m_s2 = -gravitationalAccel_m_s2(y_m);
  return {
    ay_m_s2: (ad_m_s2 * vy_m_s) / speed_m_s + ag_m_s2,
    ax_m_s2: (ad_m_s2 * vx_m_s) / speed_m_s,
  };
}

export type RocketState = {
  t_s: number;
  vy_m_s: number;
  vx_m_s: number;
  y_m: number;
  x_m: number;
};

export const defaultRocketState: RocketState = {
  t_s: 0,
  // not actual, just here for angle
  vy_m_s: Math.cos((5 * Math.PI) / 180),
  vx_m_s: Math.sin((5 * Math.PI) / 180),
  y_m: 0,
  x_m: 0,
};

function rk4(state: RocketState, h_s: number, extension: number): RocketState {
  let accels = getAccels(extension, state.vx_m_s, state.vy_m_s, state.y_m);
  const ka1 = h_s * state.vy_m_s;
  const kvY1 = h_s * accels.ay_m_s2;
  const kx1 = h_s * state.vx_m_s;
  const kvX1 = h_s * accels.ax_m_s2;

  accels = getAccels(
    extension,
    state.vx_m_s + kvX1 / 2,
    state.vy_m_s + kvY1 / 2,
    state.y_m + ka1 / 2
  );
  const ka2 = h_s * (state.vy_m_s + (h_s * kvY1) / 2);
  const kvY2 = h_s * accels.ay_m_s2;
  const kx2 = h_s * (state.vx_m_s + (h_s * kvX1) / 2);
  const kvX2 = h_s * accels.ax_m_s2;

  accels = getAccels(
    extension,
    state.vx_m_s + kvX2 / 2,
    state.vy_m_s + kvY2 / 2,
    state.y_m + ka2 / 2
  );
  const ka3 = h_s * (state.vy_m_s + (h_s * kvY2) / 2);
  const kvY3 = h_s * accels.ay_m_s2;
  const kx3 = h_s * (state.vx_m_s + (h_s * kvX2) / 2);
  const kvX3 = h_s * accels.ax_m_s2;

  accels = getAccels(
    extension,
    state.vx_m_s + kvX3,
    state.vy_m_s + kvY3,
    state.y_m + ka3
  );
  const ka4 = h_s * (state.vy_m_s + h_s * kvY3);
  const kvY4 = h_s * accels.ay_m_s2;
  const kx4 = h_s * (state.vx_m_s + h_s * kvX3);
  const kvX4 = h_s * accels.ax_m_s2;

  return {
    y_m: state.y_m + (ka1 + 2 * ka2 + 2 * ka3 + ka4) / 6,
    vy_m_s: state.vy_m_s + (kvY1 + 2 * kvY2 + 2 * kvY3 + kvY4) / 6,
    x_m: state.x_m + (kx1 + 2 * kx2 + 2 * kx3 + kx4) / 6,
    vx_m_s: state.vx_m_s + (kvX1 + 2 * kvX2 + 2 * kvX3 + kvX4) / 6,
    t_s: state.t_s + h_s,
  };
}

export function step(
  state: RocketState,
  h_s: number,
  extension: number
): RocketState | null {
  if (state.t_s + h_s <= 9) {
    for (let i = 0; i < openrocketData.length - 1; i++) {
      if (openrocketData[i + 1][0] > state.t_s + h_s) {
        const [t1, y1, vy1, x1, vx1] = openrocketData[i];
        const [t2, y2, vy2, x2, vx2] = openrocketData[i + 1];
        // lerp :P
        const shift = (state.t_s + h_s - t1) / (t2 - t1);
        return {
          y_m: y1 * (1 - shift) + y2 * shift,
          vy_m_s: vy1 * (1 - shift) + vy2 * shift,
          x_m: x1 * (1 - shift) + x2 * shift,
          vx_m_s: vx1 * (1 - shift) + vx2 * shift,
          t_s: state.t_s + h_s,
        };
      }
    }
    throw new Error("time is wrong??");
  }
  const s = rk4(state, h_s, extension);
  if (s.y_m < state.y_m) {
    return null;
  }
  return s;
}

export function predictTrajectory(
  state: RocketState,
  extension: number
): RocketState[] {
  const traj = [state];
  for (;;) {
    const s = step(traj[traj.length - 1], 0.05, extension);
    if (s === null) {
      return traj;
    }
    traj.push(s);
  }
}

/**
 * Time (s),Altitude (m),Vertical velocity (m/s),Lateral distance (m),Lateral velocity (m/s)
 */
const openrocketData = [
  [0.01, -3.863e-4, -0.077, 3.38e-5, 0.007],
  [0.02, -1.854e-4, -0.037, 1.622e-5, 0.003],
  [0.03, 1.575e-5, 0.003, 1.378e-6, 2.763e-4],
  [0.04, 0.001, 0.294, 1.312e-4, 0.026],
  [0.05, 0.009, 1.119, 7.491e-4, 0.098],
  [0.06, 0.025, 2.251, 0.002, 0.197],
  [0.07, 0.054, 3.462, 0.005, 0.303],
  [0.08, 0.095, 4.75, 0.008, 0.416],
  [0.09, 0.149, 6.068, 0.013, 0.531],
  [0.1, 0.216, 7.366, 0.019, 0.644],
  [0.11, 0.296, 8.647, 0.026, 0.757],
  [0.12, 0.389, 9.914, 0.034, 0.867],
  [0.13, 0.495, 11.168, 0.043, 0.977],
  [0.14, 0.612, 12.412, 0.054, 1.086],
  [0.15, 0.743, 13.65, 0.065, 1.194],
  [0.16, 0.885, 14.876, 0.077, 1.302],
  [0.17, 1.04, 16.086, 0.091, 1.407],
  [0.18, 1.207, 17.278, 0.106, 1.512],
  [0.19, 1.386, 18.459, 0.121, 1.615],
  [0.2, 1.576, 19.635, 0.138, 1.718],
  [0.21, 1.778, 20.805, 0.156, 1.82],
  [0.22, 1.992, 21.971, 0.174, 1.922],
  [0.23, 2.218, 23.131, 0.194, 2.024],
  [0.24, 2.455, 24.283, 0.215, 2.124],
  [0.25, 2.703, 25.423, 0.237, 2.224],
  [0.26, 2.963, 26.551, 0.259, 2.323],
  [0.27, 3.234, 27.669, 0.283, 2.421],
  [0.28, 3.517, 28.777, 0.308, 2.518],
  [0.29, 3.81, 29.882, 0.333, 2.614],
  [0.3, 4.114, 30.99, 0.36, 2.711],
  [0.31, 4.43, 32.09, 0.388, 2.808],
  [0.32, 4.756, 33.172, 0.416, 2.902],
  [0.33, 5.093, 34.235, 0.446, 2.995],
  [0.34, 5.441, 35.276, 0.476, 3.086],
  [0.35, 5.798, 36.291, 0.507, 3.175],
  [0.36, 6.166, 37.293, 0.539, 3.263],
  [0.37, 6.544, 38.295, 0.573, 3.35],
  [0.38, 6.932, 39.296, 0.606, 3.438],
  [0.39, 7.33, 40.292, 0.641, 3.525],
  [0.4, 7.738, 41.279, 0.677, 3.611],
  [0.41, 8.156, 42.261, 0.714, 3.697],
  [0.42, 8.583, 43.241, 0.751, 3.783],
  [0.435, 9.243, 44.708, 0.809, 3.919],
  [0.458, 10.273, 46.864, 0.899, 4.12],
  [0.491, 11.909, 50.075, 1.043, 4.418],
  [0.541, 14.53, 54.766, 1.275, 4.855],
  [0.591, 17.384, 59.418, 1.529, 5.293],
  [0.641, 20.47, 64.018, 1.804, 5.732],
  [0.691, 23.785, 68.577, 2.102, 6.177],
  [0.741, 27.329, 73.171, 2.422, 6.64],
  [0.791, 31.1, 77.697, 2.766, 7.113],
  [0.841, 35.098, 82.215, 3.134, 7.607],
  [0.891, 39.323, 86.76, 3.527, 8.129],
  [0.941, 43.773, 91.271, 3.947, 8.676],
  [0.991, 48.451, 95.82, 4.395, 9.259],
  [1.041, 53.355, 100.357, 4.874, 9.873],
  [1.091, 58.487, 104.929, 5.383, 10.527],
  [1.141, 63.848, 109.505, 5.927, 11.22],
  [1.191, 69.437, 114.057, 6.506, 11.949],
  [1.241, 75.254, 118.628, 7.122, 12.718],
  [1.291, 81.3, 123.194, 7.778, 13.519],
  [1.341, 87.573, 127.758, 8.475, 14.345],
  [1.391, 94.074, 132.287, 9.213, 15.187],
  [1.441, 100.802, 136.804, 9.994, 16.038],
  [1.491, 107.755, 141.317, 10.817, 16.893],
  [1.541, 114.932, 145.78, 11.683, 17.729],
  [1.591, 122.332, 150.233, 12.589, 18.541],
  [1.641, 129.955, 154.671, 13.536, 19.321],
  [1.691, 137.798, 159.068, 14.521, 20.059],
  [1.741, 145.861, 163.44, 15.541, 20.753],
  [1.791, 154.142, 167.79, 16.595, 21.404],
  [1.841, 162.64, 172.135, 17.681, 22.02],
  [1.891, 171.354, 176.436, 18.797, 22.603],
  [1.941, 180.283, 180.734, 19.941, 23.172],
  [1.991, 189.426, 184.992, 21.114, 23.738],
  [2.041, 198.781, 189.189, 22.315, 24.313],
  [2.091, 208.345, 193.358, 23.545, 24.914],
  [2.141, 218.117, 197.52, 24.807, 25.548],
  [2.191, 228.096, 201.659, 26.101, 26.217],
  [2.241, 238.281, 205.738, 27.429, 26.916],
  [2.291, 248.669, 209.779, 28.793, 27.647],
  [2.341, 259.259, 213.8, 30.194, 28.396],
  [2.391, 270.049, 217.8, 31.632, 29.145],
  [2.441, 281.038, 221.763, 33.108, 29.883],
  [2.491, 292.225, 225.717, 34.62, 30.594],
  [2.541, 303.609, 229.642, 36.167, 31.263],
  [2.591, 315.188, 233.534, 37.746, 31.882],
  [2.641, 326.961, 237.408, 39.354, 32.456],
  [2.691, 338.928, 241.257, 40.991, 33],
  [2.741, 351.087, 245.092, 42.654, 33.543],
  [2.791, 363.436, 248.887, 44.345, 34.096],
  [2.841, 375.975, 252.638, 46.064, 34.678],
  [2.891, 388.699, 256.342, 47.814, 35.305],
  [2.941, 401.608, 260.011, 49.596, 35.979],
  [2.991, 414.7, 263.661, 51.412, 36.682],
  [3.041, 427.974, 267.29, 53.264, 37.387],
  [3.091, 441.429, 270.904, 55.15, 38.068],
  [3.141, 455.063, 274.486, 57.07, 38.703],
  [3.191, 468.877, 278.074, 59.02, 39.293],
  [3.241, 482.87, 281.642, 60.999, 39.847],
  [3.291, 497.04, 285.16, 63.004, 40.379],
  [3.341, 511.385, 288.62, 65.036, 40.906],
  [3.391, 525.902, 292.054, 67.095, 41.452],
  [3.441, 540.59, 295.469, 69.182, 42.034],
  [3.491, 555.448, 298.873, 71.299, 42.67],
  [3.541, 570.476, 302.235, 73.45, 43.342],
  [3.591, 585.671, 305.552, 75.634, 44.017],
  [3.641, 601.031, 308.836, 77.851, 44.66],
  [3.691, 616.554, 312.113, 80.099, 45.252],
  [3.741, 632.243, 315.419, 82.375, 45.807],
  [3.791, 648.095, 318.674, 84.679, 46.319],
  [3.841, 664.111, 321.951, 87.007, 46.829],
  [3.891, 680.288, 325.163, 89.362, 47.362],
  [3.941, 696.627, 328.393, 91.744, 47.942],
  [3.991, 713.126, 331.543, 94.156, 48.539],
  [4.041, 729.781, 334.648, 96.598, 49.145],
  [4.091, 746.588, 337.667, 99.07, 49.726],
  [4.141, 763.548, 340.733, 101.571, 50.281],
  [4.191, 780.661, 343.758, 104.098, 50.798],
  [4.241, 797.923, 346.748, 106.65, 51.3],
  [4.291, 815.334, 349.689, 109.228, 51.803],
  [4.341, 832.892, 352.594, 111.831, 52.321],
  [4.391, 850.595, 355.555, 114.46, 52.871],
  [4.441, 868.446, 358.491, 117.118, 53.449],
  [4.491, 886.444, 361.399, 119.805, 54.031],
  [4.541, 904.586, 364.306, 122.521, 54.59],
  [4.591, 922.875, 367.256, 125.264, 55.117],
  [4.641, 941.311, 370.166, 128.032, 55.608],
  [4.691, 959.891, 373.024, 130.824, 56.085],
  [4.741, 978.612, 375.83, 133.641, 56.577],
  [4.791, 997.473, 378.604, 136.483, 57.108],
  [4.841, 1016.472, 381.348, 139.352, 57.668],
  [4.891, 1035.607, 384.065, 142.249, 58.234],
  [4.941, 1054.878, 386.761, 145.175, 58.772],
  [4.991, 1074.283, 389.438, 148.126, 59.264],
  [5.041, 1093.821, 392.094, 151.101, 59.722],
  [5.091, 1113.492, 394.725, 154.098, 60.175],
  [5.141, 1133.293, 397.326, 157.118, 60.647],
  [5.191, 1153.223, 399.895, 160.163, 61.153],
  [5.241, 1173.282, 402.434, 163.234, 61.689],
  [5.291, 1193.466, 404.949, 166.332, 62.211],
  [5.341, 1213.776, 407.445, 169.454, 62.685],
  [5.391, 1234.21, 409.921, 172.6, 63.125],
  [5.441, 1254.768, 412.373, 175.767, 63.553],
  [5.491, 1275.447, 414.795, 178.955, 64],
  [5.541, 1296.246, 417.187, 182.167, 64.475],
  [5.591, 1317.165, 419.549, 185.403, 64.968],
  [5.641, 1338.201, 421.883, 188.664, 65.47],
  [5.691, 1359.35, 424.102, 191.949, 65.929],
  [5.741, 1380.567, 424.578, 195.249, 66.054],
  [5.791, 1401.798, 424.651, 198.553, 66.089],
  [5.841, 1423.024, 424.408, 201.857, 66.096],
  [5.891, 1444.239, 424.176, 205.163, 66.148],
  [5.941, 1465.447, 424.157, 208.473, 66.267],
  [5.991, 1486.652, 424.023, 211.789, 66.374],
  [6.041, 1507.852, 423.978, 215.11, 66.462],
  [6.091, 1529.05, 423.962, 218.435, 66.505],
  [6.141, 1550.247, 423.93, 221.76, 66.524],
  [6.191, 1571.442, 423.853, 225.087, 66.56],
  [6.241, 1592.627, 423.554, 228.416, 66.596],
  [6.291, 1613.799, 423.3, 231.748, 66.663],
  [6.341, 1634.955, 422.942, 235.082, 66.73],
  [6.391, 1656.088, 422.383, 238.419, 66.738],
  [6.441, 1677.192, 421.798, 241.755, 66.691],
  [6.491, 1698.265, 421.13, 245.088, 66.612],
  [6.541, 1719.296, 420.09, 248.415, 66.497],
  [6.591, 1740.282, 419.341, 251.739, 66.47],
  [6.641, 1761.215, 417.995, 255.06, 66.366],
  [6.691, 1782.079, 416.59, 258.375, 66.241],
  [6.741, 1802.882, 415.532, 261.685, 66.137],
  [6.791, 1823.623, 414.089, 264.987, 65.941],
  [6.841, 1844.288, 412.52, 268.279, 65.726],
  [6.891, 1864.874, 410.92, 271.56, 65.532],
  [6.941, 1885.381, 409.344, 274.833, 65.375],
  [6.991, 1905.808, 407.741, 278.097, 65.219],
  [7.041, 1926.155, 406.153, 281.354, 65.046],
  [7.091, 1946.423, 404.573, 284.602, 64.847],
  [7.141, 1966.613, 403.003, 287.839, 64.639],
  [7.191, 1986.724, 401.437, 291.066, 64.439],
  [7.241, 2006.756, 399.869, 294.283, 64.253],
  [7.291, 2026.711, 398.307, 297.491, 64.087],
  [7.341, 2046.587, 396.742, 300.692, 63.927],
  [7.391, 2066.385, 395.176, 303.884, 63.759],
  [7.441, 2086.105, 393.621, 307.067, 63.571],
  [7.491, 2105.747, 392.081, 310.241, 63.358],
  [7.541, 2125.312, 390.536, 313.403, 63.143],
  [7.591, 2144.801, 388.989, 316.555, 62.959],
  [7.641, 2164.211, 387.44, 319.699, 62.802],
  [7.691, 2183.545, 385.897, 322.836, 62.652],
  [7.741, 2202.801, 384.365, 325.964, 62.489],
  [7.791, 2221.981, 382.845, 329.084, 62.311],
  [7.841, 2241.086, 381.335, 332.195, 62.124],
  [7.891, 2260.115, 379.835, 335.297, 61.932],
  [7.941, 2279.069, 378.344, 338.388, 61.736],
  [7.991, 2297.95, 376.859, 341.47, 61.555],
  [8.041, 2316.755, 375.379, 344.544, 61.391],
  [8.091, 2335.488, 373.906, 347.61, 61.243],
  [8.141, 2354.146, 372.44, 350.668, 61.096],
  [8.191, 2372.732, 370.985, 353.719, 60.942],
  [8.241, 2391.245, 369.541, 356.762, 60.768],
  [8.291, 2409.686, 368.107, 359.796, 60.58],
  [8.341, 2428.056, 366.682, 362.82, 60.394],
  [8.391, 2446.354, 365.263, 365.835, 60.212],
  [8.441, 2464.582, 363.85, 368.842, 60.049],
  [8.491, 2482.739, 362.44, 371.841, 59.908],
  [8.541, 2500.826, 361.037, 374.833, 59.778],
  [8.591, 2518.843, 359.643, 377.818, 59.637],
  [8.641, 2536.791, 358.26, 380.796, 59.476],
  [8.691, 2554.669, 356.888, 383.765, 59.298],
  [8.741, 2572.48, 355.524, 386.726, 59.123],
  [8.791, 2590.222, 354.166, 389.678, 58.954],
  [8.841, 2607.896, 352.814, 392.622, 58.801],
  [8.891, 2625.503, 351.467, 395.558, 58.658],
  [8.941, 2643.043, 350.127, 398.488, 58.521],
  [8.991, 2660.516, 348.795, 401.41, 58.383],
  [9.041, 2677.927, 347.702, 404.326, 58.278],
];
