
import { NormalizedLandmark } from '@mediapipe/tasks-vision';

// Flattens landmark data into a single number array
const flattenLandmarks = (landmarks: NormalizedLandmark[]): number[] => {
  const flattened: number[] = [];
  for (const landmark of landmarks) {
    flattened.push(landmark.x, landmark.y, landmark.z);
  }
  return flattened;
};

// Calculates the dot product of two vectors
const dotProduct = (vecA: number[], vecB: number[]): number => {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
};

// Calculates the magnitude (length) of a vector
const magnitude = (vec: number[]): number => {
  let sumOfSquares = 0;
  for (const val of vec) {
    sumOfSquares += val * val;
  }
  return Math.sqrt(sumOfSquares);
};

// Calculates the cosine similarity between two sets of facial landmarks
export const calculateSimilarity = (landmarksA: NormalizedLandmark[], landmarksB: NormalizedLandmark[]): number => {
  if (!landmarksA || !landmarksB || landmarksA.length === 0 || landmarksB.length === 0) {
    return 0;
  }

  const vecA = flattenLandmarks(landmarksA);
  const vecB = flattenLandmarks(landmarksB);

  if (vecA.length !== vecB.length) {
    // This shouldn't happen if both are from the same MediaPipe model
    console.error("Landmark vectors have different lengths.");
    return 0;
  }

  const magA = magnitude(vecA);
  const magB = magnitude(vecB);
  
  if (magA === 0 || magB === 0) {
    return 0;
  }

  const dot = dotProduct(vecA, vecB);

  return dot / (magA * magB);
};
