"use client";

import React, { useEffect, useState } from "react";

import Spinner from "../../components/loading/Spinner";
import apiClient from "../../api/client";

/**
 * Enterprise Settings Page
 *
 * Route:
 * /settings
 *
 * Responsibilities:
 * - Organization settings
 * - User preferences
 * - Security preferences
 * - Notification settings
 * - API preferences
 * - Theme preferences
 * - Persist settings
 */
export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState("general");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [success, setSuccess] =
    useState(null);

  const [settings, setSettings] =
    useState({
      organizationName: "",
      organizationSlug: "",
      timezone: "Asia/Kolkata",
      language: "en-IN",

      emailNotifications: true,
      securityAlerts: true,
      usageAlerts: true,
      billingAlerts: true,

      twoFactorRequired: false,
      sessionTimeout: 30,

      defaultModel: "",
      defaultTemperature: 0.7,
      defaultMaxTokens: 1000,

      theme: "system",
      compactMode: false,
    });

  /**
   * Load settings.
   */
  useEffect(() => {
    const loadSettings =
      async () => {
        try {
          setLoading(true);

          setError(null);

          const response =
            await apiClient.get(
              "/settings"
            );

          const data =
            response?.data ||
            response ||
            {};

          setSettings(
            (current) => ({
              ...current,
              ...data,
            })
          );
        } catch (requestError) {
          console.error(
            "Failed to load settings:",
            requestError
          );

          setError(
            requestError?.message ||
              "Unable to load settings."
          );
        } finally {
          setLoading(false);
        }
      };

    loadSettings();
  }, []);

  /**
   * Update setting.
   */
  const updateSetting = (
    field,
    value
  ) => {
    setSettings(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setSuccess(null);
  };

  /**
   * Save settings.
   */
  const handleSave = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);

      setError(null);

      setSuccess(null);

      await apiClient.patch(
        "/settings",
        settings
      );

      setSuccess(
        "Settings saved successfully."
      );
    } catch (requestError) {
      console.error(
        "Failed to save settings:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Reset settings.
   */
  const handleReset = () => {
    window.location.reload();
  };

  /**
   * Settings navigation.
   */
  const sections = [
    {
      id: "general",
      label: "General",
    },
    {
      id: "notifications",
      label: "Notifications",
    },
    {
      id: "security",
      label: "Security",
    },
    {
      id: "api",
      label: "API Preferences",
    },
    {
      id: "appearance",
      label: "Appearance",
    },
  ];

  /**
   * Loading state.
   */
  if (loading) {
    return (
      <main
        className="console-settings"
        aria-label="Settings"
      >
        <div className="settings-loading">
          <Spinner />

          <p>
            Loading settings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="console-settings"
      aria-label="Application Settings"
    >
      {/* ========================================
          Page Header
      ========================================= */}
      <header className="settings-header">
        <div>
          <h1>
            Settings
          </h1>

          <p>
            Manage your organization,
            security, API preferences,
            notifications, and appearance.
          </p>
        </div>
      </header>

      {/* ========================================
          Notifications
      ========================================= */}
      {error && (
        <div
          className="settings-alert settings-alert--error"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="settings-alert settings-alert--success"
          role="status"
        >
          {success}
        </div>
      )}

      {/* ========================================
          Settings Layout
      ========================================= */}
      <div className="settings-layout">
        {/* ======================================
            Sidebar Navigation
        ======================================= */}
        <nav
          className="settings-sidebar"
          aria-label="Settings navigation"
        >
          {sections.map(
            (section) => (
              <button
                key={section.id}
                type="button"
                className={
                  activeSection ===
                  section.id
                    ? "settings-nav-item settings-nav-item--active"
                    : "settings-nav-item"
                }
                onClick={() =>
                  setActiveSection(
                    section.id
                  )
                }
              >
                {section.label}
              </button>
            )
          )}
        </nav>

        {/* ======================================
            Settings Content
        ======================================= */}
        <form
          className="settings-content"
          onSubmit={
            handleSave
          }
        >
          {/* ====================================
              General Settings
          ===================================== */}
          {activeSection ===
            "general" && (
            <section className="settings-section">
              <header className="settings-section-header">
                <h2>
                  General Settings
                </h2>

                <p>
                  Configure your organization
                  and regional preferences.
                </p>
              </header>

              <div className="settings-form">
                <div className="settings-field">
                  <label htmlFor="organization-name">
                    Organization Name
                  </label>

                  <input
                    id="organization-name"
                    type="text"
                    value={
                      settings.organizationName
                    }
                    onChange={(event) =>
                      updateSetting(
                        "organizationName",
                        event.target.value
                      )
                    }
                    placeholder="My Organization"
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="organization-slug">
                    Organization Slug
                  </label>

                  <input
                    id="organization-slug"
                    type="text"
                    value={
                      settings.organizationSlug
                    }
                    onChange={(event) =>
                      updateSetting(
                        "organizationSlug",
                        event.target.value
                      )
                    }
                    placeholder="my-organization"
                  />

                  <small>
                    Used to identify your
                    organization in API
                    requests.
                  </small>
                </div>

                <div className="settings-field">
                  <label htmlFor="timezone">
                    Timezone
                  </label>

                  <select
                    id="timezone"
                    value={
                      settings.timezone
                    }
                    onChange={(event) =>
                      updateSetting(
                        "timezone",
                        event.target.value
                      )
                    }
                  >
                    <option value="Asia/Kolkata">
                      India Standard Time
                    </option>

                    <option value="UTC">
                      UTC
                    </option>

                    <option value="America/New_York">
                      Eastern Time
                    </option>

                    <option value="America/Los_Angeles">
                      Pacific Time
                    </option>

                    <option value="Europe/London">
                      London
                    </option>

                    <option value="Asia/Singapore">
                      Singapore
                    </option>
                  </select>
                </div>

                <div className="settings-field">
                  <label htmlFor="language">
                    Language
                  </label>

                  <select
                    id="language"
                    value={
                      settings.language
                    }
                    onChange={(event) =>
                      updateSetting(
                        "language",
                        event.target.value
                      )
                    }
                  >
                    <option value="en-IN">
                      English (India)
                    </option>

                    <option value="en-US">
                      English (US)
                    </option>

                    <option value="en-GB">
                      English (UK)
                    </option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* ====================================
              Notification Settings
          ===================================== */}
          {activeSection ===
            "notifications" && (
            <section className="settings-section">
              <header className="settings-section-header">
                <h2>
                  Notifications
                </h2>

                <p>
                  Choose which events you
                  want to receive notifications
                  for.
                </p>
              </header>

              <div className="settings-options">
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={
                      settings.emailNotifications
                    }
                    onChange={(event) =>
                      updateSetting(
                        "emailNotifications",
                        event.target
                          .checked
                      )
                    }
                  />

                  <span>
                    <strong>
                      Email Notifications
                    </strong>

                    <small>
                      Receive important platform
                      updates by email.
                    </small>
                  </span>
                </label>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={
                      settings.securityAlerts
                    }
                    onChange={(event) =>
                      updateSetting(
                        "securityAlerts",
                        event.target
                          .checked
                      )
                    }
                  />

                  <span>
                    <strong>
                      Security Alerts
                    </strong>

                    <small>
                      Get notified about security
                      events and suspicious
                      activity.
                    </small>
                  </span>
                </label>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={
                      settings.usageAlerts
                    }
                    onChange={(event) =>
                      updateSetting(
                        "usageAlerts",
                        event.target
                          .checked
                      )
                    }
                  />

                  <span>
                    <strong>
                      Usage Alerts
                    </strong>

                    <small>
                      Receive notifications when
                      usage thresholds are reached.
                    </small>
                  </span>
                </label>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={
                      settings.billingAlerts
                    }
                    onChange={(event) =>
                      updateSetting(
                        "billingAlerts",
                        event.target
                          .checked
                      )
                    }
                  />

                  <span>
                    <strong>
                      Billing Alerts
                    </strong>

                    <small>
                      Receive notifications about
                      billing and payment events.
                    </small>
                  </span>
                </label>
              </div>
            </section>
          )}

          {/* ====================================
              Security Settings
          ===================================== */}
          {activeSection ===
            "security" && (
            <section className="settings-section">
              <header className="settings-section-header">
                <h2>
                  Security
                </h2>

                <p>
                  Configure security policies
                  for your organization.
                </p>
              </header>

              <div className="settings-options">
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={
                      settings.twoFactorRequired
                    }
                    onChange={(event) =>
                      updateSetting(
                        "twoFactorRequired",
                        event.target
                          .checked
                      )
                    }
                  />

                  <span>
                    <strong>
                      Require Two-Factor
                      Authentication
                    </strong>

                    <small>
                      Require organization
                      members to use two-factor
                      authentication.
                    </small>
                  </span>
                </label>
              </div>

              <div className="settings-form">
                <div className="settings-field">
                  <label htmlFor="session-timeout">
                    Session Timeout
                  </label>

                  <select
                    id="session-timeout"
                    value={
                      settings.sessionTimeout
                    }
                    onChange={(event) =>
                      updateSetting(
                        "sessionTimeout",
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                  >
                    <option value={15}>
                      15 minutes
                    </option>

                    <option value={30}>
                      30 minutes
                    </option>

                    <option value={60}>
                      1 hour
                    </option>

                    <option value={120}>
                      2 hours
                    </option>

                    <option value={480}>
                      8 hours
                    </option>
                  </select>
                </div>
              </div>

              <div className="settings-security-warning">
                <strong>
                  Security Recommendation
                </strong>

                <p>
                  Enable two-factor authentication
                  for all users with access to
                  production resources.
                </p>
              </div>
            </section>
          )}

          {/* ====================================
              API Preferences
          ===================================== */}
          {activeSection ===
            "api" && (
            <section className="settings-section">
              <header className="settings-section-header">
                <h2>
                  API Preferences
                </h2>

                <p>
                  Configure default parameters
                  for AI model requests.
                </p>
              </header>

              <div className="settings-form">
                <div className="settings-field">
                  <label htmlFor="default-model">
                    Default Model
                  </label>

                  <input
                    id="default-model"
                    type="text"
                    value={
                      settings.defaultModel
                    }
                    onChange={(event) =>
                      updateSetting(
                        "defaultModel",
                        event.target.value
                      )
                    }
                    placeholder="Enter default model ID"
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="default-temperature">
                    Default Temperature
                  </label>

                  <input
                    id="default-temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={
                      settings.defaultTemperature
                    }
                    onChange={(event) =>
                      updateSetting(
                        "defaultTemperature",
                        Number(
                          event.target.value
                        )
                      )
                    }
                  />

                  <small>
                    Controls response randomness.
                    Range: 0 to 2.
                  </small>
                </div>

                <div className="settings-field">
                  <label htmlFor="default-max-tokens">
                    Default Max Tokens
                  </label>

                  <input
                    id="default-max-tokens"
                    type="number"
                    min="1"
                    max="100000"
                    value={
                      settings.defaultMaxTokens
                    }
                    onChange={(event) =>
                      updateSetting(
                        "defaultMaxTokens",
                        Number(
                          event.target.value
                        )
                      )
                    }
                  />
                </div>
              </div>
            </section>
          )}

          {/* ====================================
              Appearance Settings
          ===================================== */}
          {activeSection ===
            "appearance" && (
            <section className="settings-section">
              <header className="settings-section-header">
                <h2>
                  Appearance
                </h2>

                <p>
                  Customize the appearance of
                  your console.
                </p>
              </header>

              <div className="settings-form">
                <div className="settings-field">
                  <label htmlFor="theme">
                    Theme
                  </label>

                  <select
                    id="theme"
                    value={
                      settings.theme
                    }
                    onChange={(event) =>
                      updateSetting(
                        "theme",
                        event.target.value
                      )
                    }
                  >
                    <option value="system">
                      System Default
                    </option>

                    <option value="light">
                      Light
                    </option>

                    <option value="dark">
                      Dark
                    </option>
                  </select>
                </div>
              </div>

              <div className="settings-options">
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={
                      settings.compactMode
                    }
                    onChange={(event) =>
                      updateSetting(
                        "compactMode",
                        event.target
                          .checked
                      )
                    }
                  />

                  <span>
                    <strong>
                      Compact Mode
                    </strong>

                    <small>
                      Display more information
                      in less space.
                    </small>
                  </span>
                </label>
              </div>
            </section>
          )}

          {/* ====================================
              Action Bar
          ===================================== */}
          <footer className="settings-actions">
            <button
              type="button"
              onClick={
                handleReset
              }
              disabled={saving}
              className="settings-secondary-button"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="settings-primary-button"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </footer>
        </form>
      </div>
    </main>
  );
}