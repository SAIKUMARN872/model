import type { Invoice } from "../models.js";

export class InvoicePdfGenerator {
    generate(
        invoice: Invoice
    ): Buffer {
        const lines =
            invoice.lines
                .map(
                    (line) =>
                        `${line.description} x${line.quantity} ${line.amount.toFixed(2)}`
                )
                .join("\n");

        return Buffer.from(
            [
                `Invoice ${invoice.number}`,
                `Customer: ${invoice.customerId}`,
                `Currency: ${invoice.currency}`,
                "",
                lines,
                "",
                `Subtotal: ${invoice.subtotal.toFixed(2)}`,
                `Tax: ${invoice.tax.toFixed(2)}`,
                `Total: ${invoice.total.toFixed(2)}`,
                `Amount due: ${invoice.amountDue.toFixed(2)}`
            ].join("\n"),
            "utf8"
        );
    }
}
