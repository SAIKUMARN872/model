import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const COLLABORATION_STATUS = Object.freeze({
  ACTIVE: "active",
  IDLE: "idle",
  OFFLINE: "offline",
});

const ACCESS_LEVELS = Object.freeze({
  VIEWER: "viewer",
  EDITOR: "editor",
  ADMIN: "admin",
});

const WorkspaceCollaboration = ({
  workspaceId,
  workspaceName = "Workspace",
  apiBaseUrl = "/api",
  currentUserId,
  onMemberSelect,
}) => {
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] =
    useState(null);

  const loadCollaborationData =
    useCallback(async () => {
      if (!workspaceId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${apiBaseUrl}/workspaces/${workspaceId}/collaboration`,
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
            `Unable to load collaboration data (${response.status}).`
          );
        }

        const data = await response.json();

        setMembers(
          Array.isArray(data.members)
            ? data.members
            : []
        );

        setActivities(
          Array.isArray(data.activities)
            ? data.activities
            : []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load collaboration data."
        );
      } finally {
        setLoading(false);
      }
    }, [apiBaseUrl, workspaceId]);

  useEffect(() => {
    loadCollaborationData();

    const interval = setInterval(
      loadCollaborationData,
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, [loadCollaborationData]);

  const activeMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          member.status ===
            COLLABORATION_STATUS.ACTIVE ||
          member.status ===
            COLLABORATION_STATUS.IDLE
      ),
    [members]
  );

  const onlineCount = useMemo(
    () =>
      members.filter(
        (member) =>
          member.status ===
          COLLABORATION_STATUS.ACTIVE
      ).length,
    [members]
  );

  const handleMemberSelect = (
    member
  ) => {
    setSelectedMember(member);

    onMemberSelect?.(member);
  };

  const handleAccessChange = async (
    memberId,
    accessLevel
  ) => {
    setError(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/workspaces/${workspaceId}/collaboration/members/${memberId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
          body: JSON.stringify({
            accessLevel,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to update collaboration permissions."
        );
      }

      setMembers((current) =>
        current.map((member) =>
          member.id === memberId
            ? {
                ...member,
                accessLevel,
              }
            : member
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update permissions."
      );
    }
  };

  if (loading) {
    return (
      <section className="workspace-collaboration">
        <div className="workspace-collaboration__loading">
          Loading collaboration workspace...
        </div>
      </section>
    );
  }

  return (
    <section className="workspace-collaboration">
      <header className="workspace-collaboration__header">
        <div>
          <span className="workspace-collaboration__eyebrow">
            Collaboration
          </span>

          <h2>
            {workspaceName}
          </h2>

          <p>
            Manage team activity and
            workspace collaboration.
          </p>
        </div>

        <div className="workspace-collaboration__presence">
          <span className="workspace-collaboration__presence-dot" />

          {onlineCount} online
        </div>
      </header>

      {error && (
        <div
          className="workspace-collaboration__error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="workspace-collaboration__layout">
        <section className="workspace-collaboration__members">
          <div className="workspace-collaboration__section-header">
            <div>
              <h3>
                Team Members
              </h3>

              <p>
                {activeMembers.length} active
                collaborators
              </p>
            </div>

            <button
              type="button"
              onClick={
                loadCollaborationData
              }
            >
              Refresh
            </button>
          </div>

          <div className="workspace-collaboration__member-list">
            {members.length === 0 ? (
              <div className="workspace-collaboration__empty">
                No collaborators found.
              </div>
            ) : (
              members.map(
                (member) => {
                  const isCurrentUser =
                    member.id ===
                    currentUserId;

                  return (
                    <article
                      key={member.id}
                      className={`workspace-collaboration__member ${
                        selectedMember?.id ===
                        member.id
                          ? "is-selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleMemberSelect(
                          member
                        )
                      }
                    >
                      <div className="workspace-collaboration__avatar">
                        {(
                          member.name ||
                          member.email ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}

                        <span
                          className={`workspace-collaboration__status workspace-collaboration__status--${member.status}`}
                        />
                      </div>

                      <div className="workspace-collaboration__member-info">
                        <strong>
                          {member.name ||
                            member.email}
                          {isCurrentUser &&
                            " (You)"}
                        </strong>

                        {member.name && (
                          <span>
                            {member.email}
                          </span>
                        )}

                        <small>
                          {member.status ||
                            "offline"}
                        </small>
                      </div>

                      <select
                        value={
                          member.accessLevel ||
                          ACCESS_LEVELS.VIEWER
                        }
                        onChange={(
                          event
                        ) => {
                          event.stopPropagation();

                          handleAccessChange(
                            member.id,
                            event.target
                              .value
                          );
                        }}
                        onClick={(
                          event
                        ) =>
                          event.stopPropagation()
                        }
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
                    </article>
                  );
                }
              )
            )}
          </div>
        </section>

        <aside className="workspace-collaboration__activity">
          <div className="workspace-collaboration__section-header">
            <div>
              <h3>
                Recent Activity
              </h3>

              <p>
                Latest workspace events
              </p>
            </div>
          </div>

          {activities.length === 0 ? (
            <div className="workspace-collaboration__empty">
              No recent activity.
            </div>
          ) : (
            <div className="workspace-collaboration__activity-list">
              {activities
                .slice(0, 20)
                .map((activity) => (
                  <div
                    key={activity.id}
                    className="workspace-collaboration__activity-item"
                  >
                    <div className="workspace-collaboration__activity-avatar">
                      {(
                        activity.userName ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p>
                        <strong>
                          {activity.userName ||
                            "A user"}
                        </strong>{" "}
                        {activity.description ||
                          activity.action}
                      </p>

                      <time>
                        {activity.createdAt
                          ? new Date(
                              activity.createdAt
                            ).toLocaleString()
                          : "Recently"}
                      </time>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </aside>
      </div>

      {selectedMember && (
        <section className="workspace-collaboration__selected">
          <div>
            <span>
              Selected Collaborator
            </span>

            <strong>
              {selectedMember.name ||
                selectedMember.email}
            </strong>
          </div>

          <div>
            <span>
              Access
            </span>

            <strong>
              {selectedMember.accessLevel ||
                ACCESS_LEVELS.VIEWER}
            </strong>
          </div>

          <div>
            <span>
              Status
            </span>

            <strong>
              {selectedMember.status ||
                COLLABORATION_STATUS.OFFLINE}
            </strong>
          </div>

          <button
            type="button"
            onClick={() =>
              setSelectedMember(null)
            }
          >
            Clear
          </button>
        </section>
      )}
    </section>
  );
};

export default WorkspaceCollaboration;