import { CommandContact, NormalizedLead } from './types';

export function mapCommandContactToLead(
  contact: CommandContact,
  userId: number
): NormalizedLead {
  return {
    externalId: contact.id,
    sourceSystem: 'command',
    ownerUserId: userId,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    pipelineStage: contact.stage || 'new',
    lastActivityAt: contact.updatedAt,
    updatedAt: contact.updatedAt,
  };
}
