import { AuditEventProcessor } from './services/audit_logs/events/event_processor.ts';

const processor = new AuditEventProcessor();
const first = {
  id: 'evt-1',
  type: 'created',
  severity: 'info',
  action: 'create',
  resource: 'user',
  resourceId: 'user-1',
  actorId: 'actor-1',
  organizationId: 'org-1',
  timestamp: new Date().toISOString(),
};

const processed = processor.process(first);
console.log('first keys', Object.keys(first), first);
console.log('processed keys', Object.keys(processed), processed);
console.log('stored keys', Object.keys(processor.all()[0]), processor.all()[0]);
console.log('found keys', Object.keys(processor.find({ resource: 'user' })[0]), processor.find({ resource: 'user' })[0]);
