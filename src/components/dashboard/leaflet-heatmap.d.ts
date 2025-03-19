declare module 'leaflet-heatmap' {
    import { Map, Layer } from 'leaflet';
  
    interface HeatmapConfig {
      radius?: number;
      maxZoom?: number;
      scaleRadius?: boolean;
      useLocalExtrema?: boolean;
    }
  
    export class HeatmapOverlay extends Layer {
      constructor(config?: HeatmapConfig);
      addData(data: any): void;
    }
  
    export function heatmapOverlay(config?: HeatmapConfig): HeatmapOverlay;
  }
  