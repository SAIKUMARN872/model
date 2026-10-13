export interface CatalogModel {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCatalogInput {
  name: string;
  description: string;
}

export interface UpdateCatalogInput {
  name?: string;
  description?: string;
}
