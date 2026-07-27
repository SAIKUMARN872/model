import apiClient from "../../api/client";

/**
 * User API Service
 * Handles all user-related API requests.
 */

// Get all users
export const getUsers = async (params = {}) => {
  try {
    const response = await apiClient.get("/users", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};

// Get a single user by ID
export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);

    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user ${userId}:`, error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const response = await apiClient.post("/users", userData);

    return response.data;
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error;
  }
};

// Update an existing user
export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(
      `/users/${userId}`,
      userData
    );

    return response.data;
  } catch (error) {
    console.error(`Failed to update user ${userId}:`, error);
    throw error;
  }
};

// Partially update a user
export const patchUser = async (userId, userData) => {
  try {
    const response = await apiClient.patch(
      `/users/${userId}`,
      userData
    );

    return response.data;
  } catch (error) {
    console.error(`Failed to patch user ${userId}:`, error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);

    return response.data;
  } catch (error) {
    console.error(`Failed to delete user ${userId}:`, error);
    throw error;
  }
};

// Search users
export const searchUsers = async (query) => {
  try {
    const response = await apiClient.get("/users/search", {
      params: {
        q: query,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to search users:", error);
    throw error;
  }
};

// Get current logged-in user
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get("/users/me");

    return response.data;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    throw error;
  }
};

// Update current user's profile
export const updateCurrentUser = async (userData) => {
  try {
    const response = await apiClient.patch(
      "/users/me",
      userData
    );

    return response.data;
  } catch (error) {
    console.error("Failed to update current user:", error);
    throw error;
  }
};

// Activate a user
export const activateUser = async (userId) => {
  try {
    const response = await apiClient.patch(
      `/users/${userId}/activate`
    );

    return response.data;
  } catch (error) {
    console.error(`Failed to activate user ${userId}:`, error);
    throw error;
  }
};

// Deactivate a user
export const deactivateUser = async (userId) => {
  try {
    const response = await apiClient.patch(
      `/users/${userId}/deactivate`
    );

    return response.data;
  } catch (error) {
    console.error(`Failed to deactivate user ${userId}:`, error);
    throw error;
  }
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
  searchUsers,
  getCurrentUser,
  updateCurrentUser,
  activateUser,
  deactivateUser,
};