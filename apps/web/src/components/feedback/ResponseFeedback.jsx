export default function ResponseFeedback() {
  return (
    <div className="flex gap-3">
      <button className="rounded border px-3 py-2 hover:bg-gray-100">
        👍 Like
      </button>

      <button className="rounded border px-3 py-2 hover:bg-gray-100">
        👎 Dislike
      </button>
    </div>
  );
}