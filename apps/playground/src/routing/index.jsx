"use client";

import React from "react";
import { useRouter } from "next/navigation";

export function useAppRouting() {
  const router = useRouter();

  const goTo = (path) => {
    router.push(path);
  };

  const replaceTo = (path) => {
    router.replace(path);
  };

  const goBack = () => {
    router.back();
  };

  const goForward = () => {
    router.forward();
  };

  const refresh = () => {
    router.refresh();
  };

  return {
    goTo,
    replaceTo,
    goBack,
    goForward,
    refresh,
  };
}

export function navigateTo(
  router,
  path
) {
  if (!router || !path) {
    return;
  }

  router.push(path);
}

export default {
  useAppRouting,
  navigateTo,
};