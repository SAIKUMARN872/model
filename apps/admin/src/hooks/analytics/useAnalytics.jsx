import { useCallback } from "react";

const useAnalytics = () => {
  const trackEvent = useCallback((eventName, eventData = {}) => {
    try {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", eventName, eventData);
      }

      console.log("Analytics Event:", eventName, eventData);
    } catch (error) {
      console.error("Analytics tracking failed:", error);
    }
  }, []);

  const trackPageView = useCallback((pageName) => {
    trackEvent("page_view", {
      page_name: pageName,
    });
  }, [trackEvent]);

  const trackUserAction = useCallback(
    (action, details = {}) => {
      trackEvent(action, details);
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
  };
};

export default useAnalytics;