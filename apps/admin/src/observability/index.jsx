import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Observability Layer
 *
 * Responsibilities:
 * - Structured logging
 * - Metrics collection
 * - Trace management
 * - API request tracking
 * - Performance monitoring
 * - Health monitoring
 * - Event tracking
 */

/* -------------------------------------------------
   Constants
------------------------------------------------- */

export const LOG_LEVELS = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  FATAL: "fatal",
};

export const METRIC_TYPES = {
  COUNTER: "counter",
  GAUGE: "gauge",
  HISTOGRAM: "histogram",
};

export const TRACE_STATUS = {
  OK: "ok",
  ERROR: "error",
  UNSET: "unset",
};

/* -------------------------------------------------
   ID Generator
------------------------------------------------- */

function generateId(
  prefix
) {
  if (
    typeof crypto !==
      "undefined" &&
    crypto.randomUUID
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`;
}

/* -------------------------------------------------
   Logger
------------------------------------------------- */

class Logger {
  constructor(
    options = {}
  ) {
    this.service =
      options.service ||
      "admin-console";

    this.environment =
      options.environment ||
      "development";

    this.endpoint =
      options.endpoint ||
      "";

    this.logs = [];
  }

  log(
    level,
    message,
    context = {}
  ) {
    const entry = {
      id: generateId(
        "log"
      ),
      timestamp:
        new Date().toISOString(),
      level,
      message,
      service:
        this.service,
      environment:
        this.environment,
      context,
    };

    this.logs.push(entry);

    if (
      this.logs.length >
      1000
    ) {
      this.logs =
        this.logs.slice(
          -1000
        );
    }

    this.writeToConsole(
      entry
    );

    if (this.endpoint) {
      this.send(entry);
    }

    return entry.id;
  }

  debug(
    message,
    context = {}
  ) {
    return this.log(
      LOG_LEVELS.DEBUG,
      message,
      context
    );
  }

  info(
    message,
    context = {}
  ) {
    return this.log(
      LOG_LEVELS.INFO,
      message,
      context
    );
  }

  warn(
    message,
    context = {}
  ) {
    return this.log(
      LOG_LEVELS.WARN,
      message,
      context
    );
  }

  error(
    message,
    context = {}
  ) {
    return this.log(
      LOG_LEVELS.ERROR,
      message,
      context
    );
  }

  fatal(
    message,
    context = {}
  ) {
    return this.log(
      LOG_LEVELS.FATAL,
      message,
      context
    );
  }

  getLogs() {
    return [
      ...this.logs,
    ];
  }

  clear() {
    this.logs = [];
  }

  writeToConsole(
    entry
  ) {
    if (
      entry.level ===
      LOG_LEVELS.ERROR ||
      entry.level ===
      LOG_LEVELS.FATAL
    ) {
      console.error(
        `[${entry.level}] ${entry.message}`,
        entry.context
      );

      return;
    }

    if (
      entry.level ===
      LOG_LEVELS.WARN
    ) {
      console.warn(
        `[${entry.level}] ${entry.message}`,
        entry.context
      );

      return;
    }

    console.log(
      `[${entry.level}] ${entry.message}`,
      entry.context
    );
  }

  async send(entry) {
    try {
      await fetch(
        this.endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            entry
          ),
          keepalive: true,
        }
      );
    } catch (error) {
      console.warn(
        "Failed to send observability log:",
        error
      );
    }
  }
}

/* -------------------------------------------------
   Metrics
------------------------------------------------- */

class MetricsCollector {
  constructor() {
    this.metrics = new Map();
  }

  increment(
    name,
    value = 1,
    labels = {}
  ) {
    const existing =
      this.metrics.get(
        name
      );

    const currentValue =
      existing?.value || 0;

    this.metrics.set(
      name,
      {
        name,
        type:
          METRIC_TYPES.COUNTER,
        value:
          currentValue +
          value,
        labels,
        timestamp:
          new Date().toISOString(),
      }
    );
  }

  gauge(
    name,
    value,
    labels = {}
  ) {
    this.metrics.set(
      name,
      {
        name,
        type:
          METRIC_TYPES.GAUGE,
        value,
        labels,
        timestamp:
          new Date().toISOString(),
      }
    );
  }

  histogram(
    name,
    value,
    labels = {}
  ) {
    const existing =
      this.metrics.get(
        name
      );

    const values =
      existing?.values || [];

    values.push(value);

    this.metrics.set(
      name,
      {
        name,
        type:
          METRIC_TYPES.HISTOGRAM,
        values,
        labels,
        timestamp:
          new Date().toISOString(),
      }
    );
  }

  get(
    name
  ) {
    return (
      this.metrics.get(
        name
      ) || null
    );
  }

  getAll() {
    return Array.from(
      this.metrics.values()
    );
  }

  clear() {
    this.metrics.clear();
  }
}

/* -------------------------------------------------
   Trace Manager
------------------------------------------------- */

class TraceManager {
  constructor() {
    this.traces = new Map();
  }

  startTrace(
    name,
    metadata = {}
  ) {
    const trace = {
      id: generateId(
        "trace"
      ),
      name,
      status:
        TRACE_STATUS.UNSET,
      startTime:
        performance.now(),
      startedAt:
        new Date().toISOString(),
      metadata,
      spans: [],
    };

    this.traces.set(
      trace.id,
      trace
    );

    return trace.id;
  }

  addSpan(
    traceId,
    name,
    metadata = {}
  ) {
    const trace =
      this.traces.get(
        traceId
      );

    if (!trace) {
      return null;
    }

    const span = {
      id: generateId(
        "span"
      ),
      name,
      startTime:
        performance.now(),
      metadata,
    };

    trace.spans.push(
      span
    );

    return span.id;
  }

  finishSpan(
    traceId,
    spanId,
    status =
      TRACE_STATUS.OK
  ) {
    const trace =
      this.traces.get(
        traceId
      );

    if (!trace) {
      return;
    }

    const span =
      trace.spans.find(
        (item) =>
          item.id ===
          spanId
      );

    if (!span) {
      return;
    }

    span.endTime =
      performance.now();

    span.duration =
      span.endTime -
      span.startTime;

    span.status =
      status;
  }

  finishTrace(
    traceId,
    status =
      TRACE_STATUS.OK
  ) {
    const trace =
      this.traces.get(
        traceId
      );

    if (!trace) {
      return null;
    }

    trace.endTime =
      performance.now();

    trace.duration =
      trace.endTime -
      trace.startTime;

    trace.status =
      status;

    return trace;
  }

  getTrace(
    traceId
  ) {
    return (
      this.traces.get(
        traceId
      ) || null
    );
  }

  getAllTraces() {
    return Array.from(
      this.traces.values()
    );
  }

  clear() {
    this.traces.clear();
  }
}

/* -------------------------------------------------
   API Request Tracker
------------------------------------------------- */

class ApiTracker {
  constructor(
    metrics,
    logger
  ) {
    this.metrics =
      metrics;

    this.logger =
      logger;
  }

  async track(
    request
  ) {
    const {
      method = "GET",
      url,
      execute,
    } = request;

    const start =
      performance.now();

    this.logger.info(
      "API request started",
      {
        method,
        url,
      }
    );

    try {
      const response =
        await execute();

      const duration =
        performance.now() -
        start;

      this.metrics.increment(
        "api_requests_total",
        1,
        {
          method,
          status:
            response?.status ||
            "unknown",
        }
      );

      this.metrics.histogram(
        "api_request_duration_ms",
        duration,
        {
          method,
          url,
        }
      );

      this.logger.info(
        "API request completed",
        {
          method,
          url,
          duration,
          status:
            response?.status,
        }
      );

      return response;
    } catch (error) {
      const duration =
        performance.now() -
        start;

      this.metrics.increment(
        "api_errors_total",
        1,
        {
          method,
          url,
        }
      );

      this.logger.error(
        "API request failed",
        {
          method,
          url,
          duration,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        }
      );

      throw error;
    }
  }
}

/* -------------------------------------------------
   Observability Service
------------------------------------------------- */

class ObservabilityService {
  constructor(
    options = {}
  ) {
    this.logger =
      new Logger(options);

    this.metrics =
      new MetricsCollector();

    this.traces =
      new TraceManager();

    this.api =
      new ApiTracker(
        this.metrics,
        this.logger
      );
  }

  getSnapshot() {
    return {
      logs:
        this.logger.getLogs(),

      metrics:
        this.metrics.getAll(),

      traces:
        this.traces.getAllTraces(),
    };
  }

  clear() {
    this.logger.clear();
    this.metrics.clear();
    this.traces.clear();
  }
}

/* -------------------------------------------------
   Global Observability Instance
------------------------------------------------- */

export const observability =
  new ObservabilityService({
    service:
      "admin-console",

    environment:
      import.meta.env?.MODE ||
      "development",

    endpoint:
      "",
  });

/* -------------------------------------------------
   Logging Helpers
------------------------------------------------- */

export const logger = {
  debug(
    message,
    context
  ) {
    return observability.logger.debug(
      message,
      context
    );
  },

  info(
    message,
    context
  ) {
    return observability.logger.info(
      message,
      context
    );
  },

  warn(
    message,
    context
  ) {
    return observability.logger.warn(
      message,
      context
    );
  },

  error(
    message,
    context
  ) {
    return observability.logger.error(
      message,
      context
    );
  },

  fatal(
    message,
    context
  ) {
    return observability.logger.fatal(
      message,
      context
    );
  },
};

/* -------------------------------------------------
   Metric Helpers
------------------------------------------------- */

export const metrics = {
  increment(
    name,
    value = 1,
    labels = {}
  ) {
    return observability.metrics.increment(
      name,
      value,
      labels
    );
  },

  gauge(
    name,
    value,
    labels = {}
  ) {
    return observability.metrics.gauge(
      name,
      value,
      labels
    );
  },

  histogram(
    name,
    value,
    labels = {}
  ) {
    return observability.metrics.histogram(
      name,
      value,
      labels
    );
  },

  get(name) {
    return observability.metrics.get(
      name
    );
  },

  getAll() {
    return observability.metrics.getAll();
  },
};

/* -------------------------------------------------
   Trace Helpers
------------------------------------------------- */

export const tracing = {
  start(
    name,
    metadata
  ) {
    return observability.traces.startTrace(
      name,
      metadata
    );
  },

  addSpan(
    traceId,
    name,
    metadata
  ) {
    return observability.traces.addSpan(
      traceId,
      name,
      metadata
    );
  },

  finishSpan(
    traceId,
    spanId,
    status
  ) {
    return observability.traces.finishSpan(
      traceId,
      spanId,
      status
    );
  },

  finish(
    traceId,
    status
  ) {
    return observability.traces.finishTrace(
      traceId,
      status
    );
  },

  get(traceId) {
    return observability.traces.getTrace(
      traceId
    );
  },
};

/* -------------------------------------------------
   API Tracking Helper
------------------------------------------------- */

export async function trackApiRequest(
  method,
  url,
  execute
) {
  return observability.api.track({
    method,
    url,
    execute,
  });
}

/* -------------------------------------------------
   Performance Tracking
------------------------------------------------- */

export function measurePerformance(
  name,
  callback
) {
  const start =
    performance.now();

  try {
    const result =
      callback();

    if (
      result &&
      typeof result.then ===
        "function"
    ) {
      return result.finally(
        () => {
          const duration =
            performance.now() -
            start;

          metrics.histogram(
            "performance_duration_ms",
            duration,
            {
              operation:
                name,
            }
          );
        }
      );
    }

    const duration =
      performance.now() -
      start;

    metrics.histogram(
      "performance_duration_ms",
      duration,
      {
        operation:
          name,
      }
    );

    return result;
  } catch (error) {
    logger.error(
      "Performance operation failed",
      {
        operation:
          name,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      }
    );

    throw error;
  }
}

/* -------------------------------------------------
   React Context
------------------------------------------------- */

const ObservabilityContext =
  createContext(
    observability
  );

/* -------------------------------------------------
   Observability Provider
------------------------------------------------- */

export function ObservabilityProvider({
  children,
}) {
  return (
    <ObservabilityContext.Provider
      value={
        observability
      }
    >
      {children}
    </ObservabilityContext.Provider>
  );
}

/* -------------------------------------------------
   React Hook
------------------------------------------------- */

export function useObservability() {
  return useContext(
    ObservabilityContext
  );
}

/* -------------------------------------------------
   Health Status Hook
------------------------------------------------- */

export function useObservabilityHealth() {
  const [
    health,
    setHealth,
  ] = useState({
    status: "healthy",
    timestamp:
      new Date().toISOString(),
  });

  useEffect(() => {
    const interval =
      setInterval(() => {
        const snapshot =
          observability.getSnapshot();

        setHealth({
          status: "healthy",

          timestamp:
            new Date().toISOString(),

          logCount:
            snapshot.logs.length,

          metricCount:
            snapshot.metrics.length,

          traceCount:
            snapshot.traces.length,
        });
      }, 10000);

    return () =>
      clearInterval(
        interval
      );
  }, []);

  return health;
}

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default observability;