"""Conversation subsystem tests."""

from __future__ import annotations

import threading
import unittest
from dataclasses import replace

from ..exceptions import (
    MemoryConflictError,
    MemoryNotFoundError,
    MemoryValidationError,
)
from .manager import ConversationManager, InMemoryConversationRepository
from .summarizer import ConversationSummarizer
from .utils import ConversationMessage


class ConversationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.repo = InMemoryConversationRepository()
        self.manager = ConversationManager(
            self.repo, tenant_id="tenant-a", user_id="user-a"
        )
        self.conversation = self.manager.create(title="Project planning")

    def test_create_and_append_message(self) -> None:
        message = self.manager.append(
            self.conversation.conversation_id,
            role="user",
            content="  Hello ModelNow  ",
        )
        self.assertEqual(message.content, "Hello ModelNow")
        self.assertEqual(message.sequence, 1)
        self.assertEqual(self.manager.get(self.conversation.conversation_id).version, 2)

    def test_history_is_chronological_and_paginated(self) -> None:
        cid = self.conversation.conversation_id
        for content in ("one", "two", "three"):
            self.manager.append(cid, role="user", content=content)
        page = self.manager.list_messages(cid, limit=2)
        self.assertEqual([m.content for m in page.messages], ["two", "three"])
        self.assertTrue(page.has_more)
        older = self.manager.list_messages(
            cid, limit=2, before_sequence=page.next_before_sequence
        )
        self.assertEqual([m.content for m in older.messages], ["one"])

    def test_tenant_user_scope_hides_other_users(self) -> None:
        other = ConversationManager(
            self.repo, tenant_id="tenant-a", user_id="user-b"
        )
        with self.assertRaises(MemoryNotFoundError):
            other.get(self.conversation.conversation_id)

    def test_duplicate_conversation_id_is_rejected(self) -> None:
        with self.assertRaises(MemoryConflictError):
            self.manager.create(
                title="Duplicate",
                conversation_id=self.conversation.conversation_id,
            )

    def test_optimistic_version_conflict(self) -> None:
        cid = self.conversation.conversation_id
        self.manager.rename(cid, "Renamed", expected_version=1)
        with self.assertRaises(MemoryConflictError):
            self.manager.rename(cid, "Stale update", expected_version=1)

    def test_idempotent_append(self) -> None:
        cid = self.conversation.conversation_id
        first = self.manager.append(
            cid, role="user", content="submit once", idempotency_key="request-1"
        )
        second = self.manager.append(
            cid, role="user", content="submit once", idempotency_key="request-1"
        )
        self.assertEqual(first.message_id, second.message_id)
        self.assertEqual(len(self.manager.list_messages(cid, limit=10).messages), 1)

    def test_archived_conversation_rejects_append(self) -> None:
        cid = self.conversation.conversation_id
        self.manager.archive(cid)
        with self.assertRaises(MemoryConflictError):
            self.manager.append(cid, role="user", content="too late")

    def test_rename_and_summary(self) -> None:
        cid = self.conversation.conversation_id
        renamed = self.manager.rename(cid, "Release planning")
        self.assertEqual(renamed.title, "Release planning")
        summarized = self.manager.update_summary(cid, "Decided to ship in stages.")
        self.assertIn("stages", summarized.summary)

    def test_delete_is_scoped_and_idempotent(self) -> None:
        cid = self.conversation.conversation_id
        other = ConversationManager(
            self.repo, tenant_id="tenant-a", user_id="user-b"
        )
        self.assertFalse(other.delete(cid))
        self.assertTrue(self.manager.delete(cid))
        self.assertFalse(self.manager.delete(cid))

    def test_invalid_role_and_empty_content_are_rejected(self) -> None:
        with self.assertRaises(MemoryValidationError):
            self.manager.append(
                self.conversation.conversation_id, role="root", content="invalid"
            )
        with self.assertRaises(MemoryValidationError):
            self.manager.append(
                self.conversation.conversation_id, role="user", content="   "
            )

    def test_history_limit_validation(self) -> None:
        with self.assertRaises(MemoryValidationError):
            self.manager.list_messages(self.conversation.conversation_id, limit=0)

    def test_metadata_must_be_json_safe(self) -> None:
        with self.assertRaises(MemoryValidationError):
            self.manager.append(
                self.conversation.conversation_id,
                role="user",
                content="hello",
                metadata={"not_json": object()},
            )

    def test_message_rejects_naive_datetime(self) -> None:
        from datetime import datetime
        with self.assertRaises(MemoryValidationError):
            ConversationMessage.create(
                conversation_id="c",
                tenant_id="t",
                user_id="u",
                role="user",
                content="hello",
                sequence=1,
                created_at=datetime(2026, 1, 1),
            )

    def test_concurrent_appends_do_not_duplicate_sequences(self) -> None:
        cid = self.conversation.conversation_id
        barrier = threading.Barrier(2)
        outcomes: list[str] = []

        def append_message(content: str) -> None:
            barrier.wait()
            try:
                self.manager.append(cid, role="user", content=content)
                outcomes.append("ok")
            except MemoryConflictError:
                outcomes.append("conflict")

        threads = [
            threading.Thread(target=append_message, args=("A",)),
            threading.Thread(target=append_message, args=("B",)),
        ]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join(timeout=3)

        self.assertTrue(all(not thread.is_alive() for thread in threads))
        messages = self.manager.list_messages(cid, limit=10).messages
        sequences = [message.sequence for message in messages]
        self.assertEqual(len(sequences), len(set(sequences)))
        self.assertEqual(len(messages), 2)
        self.assertEqual(outcomes.count("ok"), 2)

    def test_summary_provider_and_budget_validation(self) -> None:
        cid = self.conversation.conversation_id
        self.manager.append(cid, role="user", content="Plan a safe deployment.")
        messages = self.manager.list_messages(cid, limit=10).messages
        summarizer = ConversationSummarizer(
            lambda transcript, budget: "Deployment must be staged.",
            max_output_tokens=100,
        )
        result = summarizer.summarize(messages, max_output_tokens=20)
        self.assertEqual(result.source_message_count, 1)
        self.assertIn("staged", result.text)

        too_long = ConversationSummarizer(
            lambda transcript, budget: "word " * 100,
            max_output_tokens=100,
        )
        with self.assertRaises(MemoryValidationError):
            too_long.summarize(messages, max_output_tokens=2)

    def test_summarizer_rejects_mixed_conversations(self) -> None:
        a = ConversationMessage.create(
            conversation_id="c1", tenant_id="t", user_id="u",
            role="user", content="first", sequence=1,
        )
        b = ConversationMessage.create(
            conversation_id="c2", tenant_id="t", user_id="u",
            role="user", content="second", sequence=1,
        )
        summarizer = ConversationSummarizer(
            lambda transcript, budget: "summary", max_output_tokens=100
        )
        with self.assertRaises(MemoryValidationError):
            summarizer.summarize([a, b])


if __name__ == "__main__":
    unittest.main(verbosity=2)
