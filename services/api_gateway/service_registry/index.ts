export {
  ServiceRegistry,
  serviceRegistry,
  type RegistryOptions,
  type RegistryHealth,
} from "./registry.js";

export {
  ServiceDiscovery,
  serviceDiscovery,
  type DiscoveryStrategy,
  type DiscoveryOptions,
  type DiscoveryResult,
  type DiscoveryHealth,
} from "./discovery.js";

export {
  type ServiceStatus,
  type ServiceInstance,
  type ServiceRegistration,
  type ServiceQuery,
  type ServiceSummary,
  validateServiceName,
  validateServiceRegistration,
  createServiceInstance,
  getServiceUrl,
  cloneServiceInstance,
} from "./services.js";