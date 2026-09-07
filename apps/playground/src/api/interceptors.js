function requestInterceptor(
  options = {}
) {
  return {
    ...options,
    headers: {
      "Content-Type":
        "application/json",
      ...(options.headers || {}),
    },
  };
}

async function responseInterceptor(
  response
) {
  if (!response.ok) {
    let message =
      "API request failed.";

    try {
      const data =
        await response.json();

      message =
        data?.message || message;
    } catch {
      // Ignore invalid JSON response
    }

    throw new Error(message);
  }

  return response;
}

function errorInterceptor(error) {
  console.error(
    "API Error:",
    error
  );

  throw error;
}

module.exports = {
  requestInterceptor,
  responseInterceptor,
  errorInterceptor,
};