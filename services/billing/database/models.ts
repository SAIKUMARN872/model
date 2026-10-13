export interface BillingDatabaseRecord {
    id: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface BillingDatabaseTable<
    T extends BillingDatabaseRecord
> {
    records: T[];
}
