export interface Contract {
    id: string;
    customerId: string;
    name: string;
    startDate: Date;
    endDate?: Date;
    minimumCommitment: number;
    currency: string;
    active: boolean;
    metadata: Record<string, unknown>;
}
