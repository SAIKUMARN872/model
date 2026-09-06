export interface Feature {
  id: string;
  name: string;
  enabled: boolean;
}

const features: Feature[] = [];

export function createFeature(
  id: string,
  name: string
): Feature {
  const feature: Feature = {
    id,
    name,
    enabled: false,
  };

  features.push(feature);

  return feature;
}

export function getFeature(
  id: string
): Feature | undefined {
  return features.find(
    (feature) => feature.id === id
  );
}

export function getFeatures(): Feature[] {
  return [...features];
}

export function enableFeature(
  id: string
): boolean {
  const feature = getFeature(id);

  if (!feature) {
    return false;
  }

  feature.enabled = true;

  return true;
}

export function disableFeature(
  id: string
): boolean {
  const feature = getFeature(id);

  if (!feature) {
    return false;
  }

  feature.enabled = false;

  return true;
}

export function isFeatureEnabled(
  id: string
): boolean {
  const feature = getFeature(id);

  return feature?.enabled === true;
}

export function removeFeature(
  id: string
): boolean {
  const index = features.findIndex(
    (feature) => feature.id === id
  );

  if (index === -1) {
    return false;
  }

  features.splice(index, 1);

  return true;
}

export function clearFeatures(): void {
  features.length = 0;
}