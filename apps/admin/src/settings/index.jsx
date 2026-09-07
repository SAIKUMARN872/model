import apiClient from "../../api/client";

/**
 * Settings API Service
 * Handles application and user settings.
 */

// Get all application settings
export const getSettings = async (params = {}) => {
  try {
    const response = await apiClient.get("/settings", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    throw error;
  }
};

// Get a specific setting
export const getSettingByKey = async (key) => {
  try {
    const response = await apiClient.get(
      `/settings/${key}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch setting ${key}:`,
      error
    );
    throw error;
  }
};

// Create a new setting
export const createSetting = async (settingData) => {
  try {
    const response = await apiClient.post(
      "/settings",
      settingData
    );

    return response.data;
  } catch (error) {
    console.error("Failed to create setting:", error);
    throw error;
  }
};

// Update a setting
export const updateSetting = async (
  key,
  settingData
) => {
  try {
    const response = await apiClient.put(
      `/settings/${key}`,
      settingData
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to update setting ${key}:`,
      error
    );
    throw error;
  }
};

// Delete a setting
export const deleteSetting = async (key) => {
  try {
    const response = await apiClient.delete(
      `/settings/${key}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to delete setting ${key}:`,
      error
    );
    throw error;
  }
};

// Get user settings
export const getUserSettings = async () => {
  try {
    const response = await apiClient.get(
      "/settings/user"
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch user settings:",
      error
    );
    throw error;
  }
};

// Update user settings
export const updateUserSettings = async (
  settingsData
) => {
  try {
    const response = await apiClient.patch(
      "/settings/user",
      settingsData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to update user settings:",
      error
    );
    throw error;
  }
};

// Get application preferences
export const getPreferences = async () => {
  try {
    const response = await apiClient.get(
      "/settings/preferences"
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch preferences:",
      error
    );
    throw error;
  }
};

// Update application preferences
export const updatePreferences = async (
  preferencesData
) => {
  try {
    const response = await apiClient.patch(
      "/settings/preferences",
      preferencesData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to update preferences:",
      error
    );
    throw error;
  }
};

export default {
  getSettings,
  getSettingByKey,
  createSetting,
  updateSetting,
  deleteSetting,
  getUserSettings,
  updateUserSettings,
  getPreferences,
  updatePreferences,
};