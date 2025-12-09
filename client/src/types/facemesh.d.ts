declare module '@tensorflow-models/facemesh' {
  export interface FaceMeshPrediction {
    faceInViewConfidence: number;
    mesh: Array<[number, number, number]>;
    scaledMesh: Array<[number, number, number]>;
    annotations: {
      [key: string]: Array<[number, number, number]>;
    };
  }

  export interface FaceMeshModel {
    estimateFaces(input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Promise<FaceMeshPrediction[]>;
  }

  export function load(): Promise<FaceMeshModel>;
} 