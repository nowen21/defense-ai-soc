export interface MLPrediction {
  isAnomaly: boolean;
  confidence: number;
  category: string;
  modelUsed: string;
}