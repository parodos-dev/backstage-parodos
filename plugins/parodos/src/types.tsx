export interface ParodosConfig {
  backendUrl: string;
  workflows: {
    assessment: string;
    assessmentTask: string;
  };
  pollingInterval: number;
}
