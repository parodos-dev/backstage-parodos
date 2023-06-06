export interface ParodosConfig {
  backendUrl: string;
  workflows: {
    assessment: string;
  };
  pollingInterval: number;
}
