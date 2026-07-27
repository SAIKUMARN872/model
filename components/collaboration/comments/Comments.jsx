import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const Comments = ({
  apiBaseUrl = "/api",
  workspaceId,
  resourceId,
  resourceType = "workspace",
  currentUser,
}) => {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [replyTo, setReplyTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingMessage, setEditingMessage] = useState("");

  const loadComments = useCallback(async () => {
    if (!workspaceId || !resourceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        workspaceId,
        resourceId,
        resourceType,
      });

      const response = await fetch(
        `${apiBaseUrl}/comments?${params.toString()}`,
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
          `Failed to load comments: ${response.status}`
        );
      }

      const data = await response.json();

      setComments(
        Array.isArray(data.comments)
          ? data.comments
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load comments."
      );
    } finally {
      setLoading(false);
    }
  }, [
    apiBaseUrl,
    workspaceId,
    resourceId,
    resourceType,
  ]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const createComment = async (
    event,
    parentCommentId = null
  ) => {
    event.preventDefault();

    const content = parentCommentId
      ? replyMessage.trim()
      : message.trim();

    if (!content) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(
        `${apiBaseUrl}/comments`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            workspaceId,
            resourceId,
            resourceType,
            content,
            parentCommentId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to create comment."
        );
      }

      const data = await response.json();

      if (data.comment) {
        setComments((current) => [
          ...current,
          data.comment,
        ]);
      } else {
        await loadComments();
      }

      if (parentCommentId) {
        setReplyMessage("");
        setReplyTo(null);
      } else {
        setMessage("");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create comment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateComment = async (
    commentId
  ) => {
    const content =
      editingMessage.trim();

    if (!content) return;

    try {
      setSubmitting(true);

      const response = await fetch(
        `${apiBaseUrl}/comments/${commentId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update comment."
        );
      }

      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                content,
                updatedAt:
                  new Date().toISOString(),
              }
            : comment
        )
      );

      setEditingId(null);
      setEditingMessage("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update comment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (
    commentId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${apiBaseUrl}/comments/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete comment."
        );
      }

      setComments((current) =>
        current.filter(
          (comment) =>
            comment.id !== commentId &&
            comment.parentCommentId !==
              commentId
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete comment."
      );
    }
  };

  const toggleReaction = async (
    commentId
  ) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/comments/${commentId}/reactions`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            reaction: "like",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update reaction."
        );
      }

      const data = await response.json();

      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                reactions:
                  data.reactions ||
                  comment.reactions,
              }
            : comment
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update reaction."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Intl.DateTimeFormat(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date(date));
  };

  const filteredComments = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return comments;
    }

    return comments.filter((comment) =>
      [
        comment.content,
        comment.author?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [comments, search]);

  const rootComments =
    filteredComments.filter(
      (comment) =>
        !comment.parentCommentId
    );

  const getReplies = (commentId) =>
    filteredComments.filter(
      (comment) =>
        comment.parentCommentId ===
        commentId
    );

  if (loading) {
    return (
      <section className="comments">
        <p>Loading comments...</p>
      </section>
    );
  }

  return (
    <section className="comments">
      <header className="comments__header">
        <div>
          <h2>Comments</h2>
          <span>
            {comments.length} comments
          </span>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search comments..."
        />
      </header>

      {error && (
        <div
          className="comments__error"
          role="alert"
        >
          {error}
        </div>
      )}

      <form
        className="comments__composer"
        onSubmit={createComment}
      >
        <div className="comments__avatar">
          {currentUser?.name
            ?.charAt(0)
            ?.toUpperCase() || "U"}
        </div>

        <div>
          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="Write a comment..."
            rows={3}
            maxLength={5000}
          />

          <button
            type="submit"
            disabled={
              submitting ||
              !message.trim()
            }
          >
            {submitting
              ? "Posting..."
              : "Post Comment"}
          </button>
        </div>
      </form>

      <div className="comments__list">
        {rootComments.length === 0 ? (
          <div className="comments__empty">
            <strong>
              No comments yet
            </strong>

            <p>
              Start the conversation by
              adding the first comment.
            </p>
          </div>
        ) : (
          rootComments.map((comment) => {
            const replies = getReplies(
              comment.id
            );

            const isOwner =
              currentUser?.id ===
              comment.author?.id;

            return (
              <article
                key={comment.id}
                className="comments__item"
              >
                <div className="comments__avatar">
                  {comment.author?.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

                <div className="comments__body">
                  <header>
                    <strong>
                      {comment.author?.name ||
                        "Unknown User"}
                    </strong>

                    <span>
                      {formatDate(
                        comment.createdAt
                      )}
                    </span>
                  </header>

                  {editingId ===
                  comment.id ? (
                    <div>
                      <textarea
                        value={
                          editingMessage
                        }
                        onChange={(event) =>
                          setEditingMessage(
                            event.target.value
                          )
                        }
                        rows={3}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          updateComment(
                            comment.id
                          )
                        }
                        disabled={
                          submitting
                        }
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(
                            null
                          );
                          setEditingMessage(
                            ""
                          );
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p>
                      {comment.content}
                    </p>
                  )}

                  <div className="comments__actions">
                    <button
                      type="button"
                      onClick={() =>
                        toggleReaction(
                          comment.id
                        )
                      }
                    >
                      👍{" "}
                      {comment.reactions
                        ?.like || 0}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setReplyTo(
                          comment.id
                        )
                      }
                    >
                      Reply
                    </button>

                    {isOwner && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(
                              comment.id
                            );

                            setEditingMessage(
                              comment.content
                            );
                          }}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteComment(
                              comment.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                  {replyTo ===
                    comment.id && (
                    <form
                      className="comments__reply"
                      onSubmit={(event) =>
                        createComment(
                          event,
                          comment.id
                        )
                      }
                    >
                      <textarea
                        value={replyMessage}
                        onChange={(event) =>
                          setReplyMessage(
                            event.target.value
                          )
                        }
                        placeholder="Write a reply..."
                        rows={2}
                      />

                      <button
                        type="submit"
                        disabled={
                          submitting ||
                          !replyMessage.trim()
                        }
                      >
                        Reply
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReplyTo(null);
                          setReplyMessage("");
                        }}
                      >
                        Cancel
                      </button>
                    </form>
                  )}

                  {replies.length > 0 && (
                    <div className="comments__replies">
                      {replies.map(
                        (reply) => (
                          <div
                            key={reply.id}
                            className="comments__reply-item"
                          >
                            <strong>
                              {reply.author
                                ?.name ||
                                "Unknown User"}
                            </strong>

                            <span>
                              {formatDate(
                                reply.createdAt
                              )}
                            </span>

                            <p>
                              {
                                reply.content
                              }
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

export default Comments;