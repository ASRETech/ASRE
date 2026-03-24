export type CommandContact = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  stage?: string;
  updatedAt: string;
};

export type NormalizedLead = {
  externalId: string;
  sourceSystem: 'command';
  ownerUserId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  pipelineStage: string;
  lastActivityAt?: string;
  updatedAt: string;
};
