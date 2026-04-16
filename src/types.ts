export type Point = { x: number; y: number };

export interface Level {
  id: number;
  name: string;
  targetBezier: [number, number, number, number];
  description: string;
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "The Linear Start",
    targetBezier: [0, 0, 1, 1],
    description: "A perfectly constant velocity. No acceleration, no deceleration. The foundation of all movement."
  },
  {
    id: 2,
    name: "Smooth Entrance",
    targetBezier: [0.42, 0, 1, 1],
    description: "Start slow and build momentum. A classic 'Ease-In' curve used for objects entering the frame."
  },
  {
    id: 3,
    name: "The Soft Landing",
    targetBezier: [0, 0, 0.58, 1],
    description: "High initial speed that gently tapers off. Perfect for UI elements coming to a rest."
  },
  {
    id: 4,
    name: "The Back-Out",
    targetBezier: [0.34, 1.56, 0.64, 1],
    description: "A sophisticated overshoot effect. The ball travels past its destination before snapping back."
  },
  {
    id: 5,
    name: "Anticipation",
    targetBezier: [0.6, -0.28, 0.735, 0.045],
    description: "The ball pulls back slightly before launching forward. Classic animation principle: Anticipation."
  },
  {
    id: 6,
    name: "The Sharp Snap",
    targetBezier: [0.19, 1, 0.22, 1],
    description: "Extremely fast acceleration followed by an immediate stop. High-energy UI transition."
  }
];
