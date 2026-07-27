import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const ACCESS_LEVELS = Object.freeze({
  VIEWER: "viewer",
  EDITOR: "editor",
  ADMIN: "admin",
});

const SHARE_STATUS = Object.freeze({
  ACTIVE: "active",
  PENDING: "pending",
  REVOKED: "revoked",
});

const ShareWorkspace = ({
  workspaceId,
  workspaceName = "Workspace",
  apiBaseUrl = "/api",
  currentUserId,
  onClose,
}) => {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] =
    useState(ACCESS_LEVELS.VIEWER);

  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const activeMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          member.status !== SHARE_STATUS.REVOKED
      ),
    [members]
  );

  const loadMembers = useCallback(async () => {
    if (!workspaceId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/workspaces/${workspaceId}/members`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load workspace members (${response.status}).`
        );
      }

      const data = await response.json();

      setMembers(
        Array.isArray(data.members)
          ? data.members
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load workspace members."
      );
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, workspaceId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleShare = async (event) => {
    event.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter an email address.");
      return;
    }

    setSharing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/workspaces/${workspaceId}/members`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            accessLevel,
            invitedBy: currentUserId,
          }),
        }
      );

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          data.message ||
            `Unable to share workspace (${response.status}).`
        );
      }

      const data = await response.json();

      if (data.member) {
        setMembers((current) => [
          data.member,
          ...current.filter(
            (member) =>
              member.id !== data.member.id
          ),
        ]);
      } else {
        await loadMembers();
      }

      setEmail("");
      setAccessLevel(
        ACCESS_LEVELS.VIEWER
      );

      setSuccess(
        `Workspace shared with ${normalizedEmail}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to share workspace."
      );
    } finally {
      setSharing(false);
    }
  };

  const handleAccessChange = async (
    memberId,
    nextAccessLevel
  ) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/workspaces/${workspaceId}/members/${memberId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            accessLevel: nextAccessLevel,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update member permissions."
        );
      }

      setMembers((current) =>
        current.map((member) =>
          member.id === memberId
            ? {
                ...member,
                accessLevel:
                  nextAccessLevel,
              }
            : member
        )
      );

      setSuccess(
        "Workspace permissions updated."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update permissions."
      );
    }
  };

  const handleRevoke = async (
    memberId
  ) => {
    setRevokingId(memberId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/workspaces/${workspaceId}/members/${memberId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to revoke workspace access."
        );
      }

      setMembers((current) =>
        current.map((member) =>
          member.id === memberId
            ? {
                ...member,
                status:
                  SHARE_STATUS.REVOKED,
              }
            : member
        )
      );

      setSuccess(
        "Workspace access revoked."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to revoke access."
      );
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <section className="share-workspace">
      <header className="share-workspace__header">
        <div>
          <span className="share-workspace__eyebrow">
            Workspace Access
          </span>

          <h2>
            Share {workspaceName}
          </h2>

          <p>
            Invite team members and manage
            their workspace permissions.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share workspace"
          >
            ×
          </button>
        )}
      </header>

      {error && (
        <div
          className="share-workspace__alert share-workspace__alert--error"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="share-workspace__alert share-workspace__alert--success"
          role="status"
        >
          {success}
        </div>
      )}

      <form
        className="share-workspace__form"
        onSubmit={handleShare}
      >
        <div className="share-workspace__field">
          <label htmlFor="workspace-member-email">
            Email Address
          </label>

          <input
            id="workspace-member-email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="colleague@company.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="share-workspace__field">
          <label htmlFor="workspace-access-level">
            Access Level
          </label>

          <select
            id="workspace-access-level"
            value={accessLevel}
            onChange={(event) =>
              setAccessLevel(
                event.target.value
              )
            }
          >
            <option
              value={ACCESS_LEVELS.VIEWER}
            >
              Viewer
            </option>

            <option
              value={ACCESS_LEVELS.EDITOR}
            >
              Editor
            </option>

            <option
              value={ACCESS_LEVELS.ADMIN}
            >
              Admin
            </option>
          </select>
        </div>

        <button
          type="submit"
          disabled={sharing}
        >
          {sharing
            ? "Sharing..."
            : "Share Workspace"}
        </button>
      </form>

      <div className="share-workspace__members">
        <div className="share-workspace__members-header">
          <div>
            <h3>
              People with access
            </h3>

            <p>
              {activeMembers.length} active
              member
              {activeMembers.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={loadMembers}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="share-workspace__empty">
            Loading workspace members...
          </div>
        ) : activeMembers.length === 0 ? (
          <div className="share-workspace__empty">
            <strong>
              No members yet
            </strong>

            <p>
              Invite someone to collaborate
              on this workspace.
            </p>
          </div>
        ) : (
          <div className="share-workspace__member-list">
            {activeMembers.map(
              (member) => (
                <article
                  key={member.id}
                  className="share-workspace__member"
                >
                  <div className="share-workspace__member-info">
                    <div className="share-workspace__avatar">
                      {(
                        member.name ||
                        member.email ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {member.name ||
                          member.email}
                      </strong>

                      {member.name && (
                        <span>
                          {member.email}
                        </span>
                      )}

                      <small>
                        {member.status ===
                        SHARE_STATUS.PENDING
                          ? "Invitation pending"
                          : "Active member"}
                      </small>
                    </div>
                  </div>

                  <div className="share-workspace__member-actions">
                    <select
                      value={
                        member.accessLevel ||
                        ACCESS_LEVELS.VIEWER
                      }
                      onChange={(event) =>
                        handleAccessChange(
                          member.id,
                          event.target.value
                        )
                      }
                      aria-label={`Access level for ${
                        member.email
                      }`}
                    >
                      <option
                        value={
                          ACCESS_LEVELS.VIEWER
                        }
                      >
                        Viewer
                      </option>

                      <option
                        value={
                          ACCESS_LEVELS.EDITOR
                        }
                      >
                        Editor
                      </option>

                      <option
                        value={
                          ACCESS_LEVELS.ADMIN
                        }
                      >
                        Admin
                      </option>
                    </select>

                    <button
                      type="button"
                      disabled={
                        revokingId ===
                        member.id
                      }
                      onClick={() =>
                        handleRevoke(
                          member.id
                        )
                      }
                    >
                      {revokingId ===
                      member.id
                        ? "Revoking..."
                        : "Revoke"}
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShareWorkspace;