interface ApiErrorProps {
  error?: unknown;
  message?: string;
  onRetry?: () => void;
}

export default function ApiError({
  error,
  message = "Something went wrong.",
  onRetry,
}: ApiErrorProps) {
  let errorMessage = message;

  if (typeof error === "string") {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message || message;
  } else if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    errorMessage = error.message;
  }

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #fecaca",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#991b1b",
        }}
      >
        API Error
      </h2>

      <p
        style={{
          color: "#b91c1c",
          marginBottom: "16px",
        }}
      >
        {errorMessage}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "#dc2626",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}