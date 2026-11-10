import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Workflow } from "lucide-react";

export default function AgentsPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState("");

  function submit(event) {
    event.preventDefault();
    setNotice("Draft validated locally. Connect the authenticated agents API to save or deploy this agent.");
  }

  return (
    <main className="mn-dashboard mn-page">
      <Link to="/" className="mn-back-link"><ArrowLeft size={16} /> Dashboard</Link>
      <header className="mn-page__header">
        <span className="mn-resource__icon"><Workflow size={22} /></span>
        <div><h1>Agents &amp; Workflows API</h1><p className="mn-muted">Create an agent draft and design business workflows. Saving and deployment require the authenticated ModelNow API.</p></div>
      </header>
      <form className="mn-panel mn-agent-form" onSubmit={submit}>
        <label>Agent name<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Support assistant" /></label>
        <label>Description<textarea maxLength={2000} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the agent's purpose and boundaries." /></label>
        <button className="mn-action mn-action--primary" type="submit">Validate agent draft</button>
        {notice ? <p role="status" className="mn-notice">{notice}</p> : null}
      </form>
      <p className="mn-dashboard__note">This validates a local draft only. It does not claim to persist or deploy an agent until the real agents API is connected.</p>
    </main>
  );
}
