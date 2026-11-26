
"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export type BillingPaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageNumbers?: boolean;
};

export default function BillingPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  showPageNumbers = true,
}: BillingPaginationProps) {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(0, totalItems) / safePageSize)
  );
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * safePageSize + 1;
  const endItem = Math.min(currentPage * safePageSize, totalItems);

  function goToPage(nextPage: number) {
    onPageChange(Math.min(totalPages, Math.max(1, nextPage)));
  }

  function getPageNumbers() {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let value = start; value <= end; value += 1) {
      pages.push(value);
    }

    return pages;
  }

  const buttonClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label="Billing table pagination"
      className="flex flex-col gap-4 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap">Rows per page</span>
          <select
            value={safePageSize}
            onChange={(event) => {
              onPageSizeChange(Number(event.target.value));
              onPageChange(1);
            }}
            aria-label="Rows per page"
            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <span aria-live="polite" className="whitespace-nowrap">
          {startItem}–{endItem} of {totalItems.toLocaleString()}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => goToPage(1)}
          disabled={currentPage <= 1}
          aria-label="First page"
          title="First page"
          className={buttonClass}
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          title="Previous page"
          className={buttonClass}
        >
          <ChevronLeft size={16} />
        </button>

        {showPageNumbers &&
          getPageNumbers().map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => goToPage(pageNumber)}
              aria-label={`Page ${pageNumber}`}
              aria-current={
                pageNumber === currentPage ? "page" : undefined
              }
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition ${
                pageNumber === currentPage
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {pageNumber}
            </button>
          ))}

        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          title="Next page"
          className={buttonClass}
        >
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          onClick={() => goToPage(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Last page"
          title="Last page"
          className={buttonClass}
        >
          <ChevronsRight size={16} />
        </button>

        <span className="ml-2 whitespace-nowrap text-xs text-slate-500">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </nav>
  );
}
