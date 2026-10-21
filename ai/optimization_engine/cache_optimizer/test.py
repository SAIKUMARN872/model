from decimal import Decimal
import time
import unittest

from ai.optimization_engine.cache_optimizer.manager import (
    CacheEntry,
    CacheManager,
    CacheStatistics,
)
from ai.optimization_engine.cache_optimizer.optimizer import (
    CacheOptimizationRequest,
    CacheOptimizationResult,
    CacheOptimizer,
    create_cache_optimizer,
)
from ai.optimization_engine.cache_optimizer.strategy import (
    CacheDecision,
    CachePolicy,
    CacheRequestContext,
    CacheStrategy,
    CacheStrategyManager,
    create_strategy_manager,
)
from ai.optimization_engine.cache_optimizer.utils import (
    calculate_hit_rate,
    calculate_savings,
    cacheable_response,
    clamp_decimal,
    make_cache_key,
    make_text_cache_key,
    normalize_text,
    stable_serialize,
    to_decimal,
    validate_key,
    validate_ttl,
)


class CacheOptimizerUtilsTest(unittest.TestCase):

    def test_to_decimal(self):
        self.assertEqual(
            to_decimal("1.25"),
            Decimal("1.25"),
        )

    def test_normalize_text(self):
        self.assertEqual(
            normalize_text(
                "  hello   world \n test  "
            ),
            "hello world test",
        )

    def test_validate_key(self):
        self.assertEqual(
            validate_key(" test-key "),
            "test-key",
        )

    def test_validate_ttl(self):
        self.assertEqual(
            validate_ttl(60),
            Decimal("60"),
        )

    def test_stable_serialize(self):
        self.assertEqual(
            stable_serialize(
                {"b": 2, "a": 1}
            ),
            stable_serialize(
                {"a": 1, "b": 2}
            ),
        )

    def test_cache_key_deterministic(self):
        key_a = make_cache_key(
            {"prompt": "hello"},
            namespace="test",
        )

        key_b = make_cache_key(
            {"prompt": "hello"},
            namespace="test",
        )

        self.assertEqual(key_a, key_b)
        self.assertTrue(key_a.startswith("test:"))

    def test_text_cache_key_normalization(self):
        key_a = make_text_cache_key(
            "  hello   world  ",
            namespace="test",
        )

        key_b = make_text_cache_key(
            "hello world",
            namespace="test",
        )

        self.assertEqual(key_a, key_b)

    def test_hit_rate(self):
        self.assertEqual(
            calculate_hit_rate(8, 2),
            Decimal("0.8"),
        )

    def test_savings(self):
        self.assertEqual(
            calculate_savings(
                10,
                Decimal("0.002"),
            ),
            Decimal("0.020"),
        )

    def test_clamp_decimal(self):
        self.assertEqual(
            clamp_decimal(
                Decimal("15"),
                Decimal("0"),
                Decimal("10"),
            ),
            Decimal("10"),
        )

    def test_cacheable_response(self):
        self.assertTrue(
            cacheable_response("hello")
        )

        self.assertTrue(
            cacheable_response(
                {"answer": "ok"}
            )
        )

        self.assertFalse(
            cacheable_response("")
        )

        self.assertFalse(
            cacheable_response(None)
        )


class CacheStrategyTest(unittest.TestCase):

    def test_default_strategy(self):
        manager = CacheStrategyManager()

        self.assertEqual(
            manager.strategy,
            CacheStrategy.BALANCED,
        )

    def test_eligible_request(self):
        manager = CacheStrategyManager()

        decision = manager.decide(
            CacheRequestContext(
                confidence=Decimal("0.95"),
                successful=True,
                response_size=100,
            )
        )

        self.assertIsInstance(
            decision,
            CacheDecision,
        )

        self.assertTrue(
            decision.should_cache
        )

        self.assertEqual(
            decision.reason,
            "eligible",
        )

    def test_confidence_filter(self):
        manager = CacheStrategyManager()

        decision = manager.decide(
            CacheRequestContext(
                confidence=Decimal("0.50"),
                successful=True,
                response_size=100,
            )
        )

        self.assertFalse(
            decision.should_cache
        )

        self.assertEqual(
            decision.reason,
            "confidence_below_threshold",
        )

    def test_success_filter(self):
        manager = CacheStrategyManager()

        decision = manager.decide(
            CacheRequestContext(
                confidence=Decimal("1"),
                successful=False,
                response_size=100,
            )
        )

        self.assertFalse(
            decision.should_cache
        )

        self.assertEqual(
            decision.reason,
            "unsuccessful_response",
        )

    def test_streaming_filter(self):
        manager = CacheStrategyManager()

        decision = manager.decide(
            CacheRequestContext(
                confidence=Decimal("1"),
                successful=True,
                streaming=True,
                response_size=100,
            )
        )

        self.assertFalse(
            decision.should_cache
        )

        self.assertEqual(
            decision.reason,
            "streaming_response",
        )

    def test_tools_filter(self):
        manager = CacheStrategyManager()

        decision = manager.decide(
            CacheRequestContext(
                confidence=Decimal("1"),
                successful=True,
                uses_tools=True,
                response_size=100,
            )
        )

        self.assertFalse(
            decision.should_cache
        )

        self.assertEqual(
            decision.reason,
            "tool_execution",
        )

    def test_dynamic_context_filter(self):
        manager = CacheStrategyManager()

        decision = manager.decide(
            CacheRequestContext(
                confidence=Decimal("1"),
                successful=True,
                dynamic_context=True,
                response_size=100,
            )
        )

        self.assertFalse(
            decision.should_cache
        )

        self.assertEqual(
            decision.reason,
            "dynamic_context",
        )

    def test_conservative_strategy(self):
        manager = CacheStrategyManager(
            strategy=CacheStrategy.CONSERVATIVE
        )

        self.assertEqual(
            manager.policy.ttl_seconds,
            Decimal("900"),
        )

        self.assertEqual(
            manager.policy.min_confidence,
            Decimal("0.98"),
        )

    def test_aggressive_strategy(self):
        manager = CacheStrategyManager(
            strategy=CacheStrategy.AGGRESSIVE
        )

        self.assertEqual(
            manager.policy.ttl_seconds,
            Decimal("21600"),
        )

        self.assertEqual(
            manager.policy.min_confidence,
            Decimal("0.75"),
        )

    def test_custom_policy(self):
        policy = CachePolicy(
            ttl_seconds=Decimal("600"),
            min_confidence=Decimal("0.95"),
            min_response_size=10,
        )

        manager = CacheStrategyManager()

        manager.update_policy(policy)

        self.assertEqual(
            manager.policy.ttl_seconds,
            Decimal("600"),
        )

        self.assertEqual(
            manager.policy.min_confidence,
            Decimal("0.95"),
        )

        self.assertEqual(
            manager.policy.min_response_size,
            10,
        )

    def test_factory(self):
        manager = create_strategy_manager()

        self.assertIsInstance(
            manager,
            CacheStrategyManager,
        )


class CacheManagerTest(unittest.TestCase):

    def setUp(self):
        self.cache = CacheManager(
            max_entries=2,
            default_ttl_seconds=3600,
            average_request_cost=Decimal("0.01"),
        )

    def test_set_and_get(self):
        entry = self.cache.set(
            "key-1",
            "value-1",
            model="model-a",
            provider="provider-a",
        )

        self.assertIsInstance(
            entry,
            CacheEntry,
        )

        self.assertEqual(
            self.cache.get("key-1"),
            "value-1",
        )

    def test_hit_miss_tracking(self):
        self.cache.set(
            "key-1",
            "value-1",
        )

        self.assertEqual(
            self.cache.get("key-1"),
            "value-1",
        )

        self.assertIsNone(
            self.cache.get("missing")
        )

        stats = self.cache.statistics()

        self.assertEqual(stats.hits, 1)
        self.assertEqual(stats.misses, 1)
        self.assertEqual(
            stats.hit_rate,
            Decimal("0.5"),
        )

    def test_contains(self):
        self.cache.set(
            "key-1",
            "value-1",
        )

        self.assertTrue(
            self.cache.contains("key-1")
        )

        self.assertFalse(
            self.cache.contains("missing")
        )

    def test_delete(self):
        self.cache.set(
            "key-1",
            "value-1",
        )

        self.assertTrue(
            self.cache.delete("key-1")
        )

        self.assertFalse(
            self.cache.contains("key-1")
        )

        self.assertFalse(
            self.cache.delete("key-1")
        )

    def test_invalidate(self):
        self.cache.set(
            "key-1",
            "value-1",
        )

        self.assertTrue(
            self.cache.invalidate("key-1")
        )

        self.assertFalse(
            self.cache.contains("key-1")
        )

    def test_lru_eviction(self):
        self.cache.set("a", 1)
        self.cache.set("b", 2)

        self.assertEqual(
            self.cache.get("a"),
            1,
        )

        self.cache.set("c", 3)

        self.assertTrue(
            self.cache.contains("a")
        )

        self.assertFalse(
            self.cache.contains("b")
        )

        self.assertTrue(
            self.cache.contains("c")
        )

        self.assertEqual(
            self.cache.statistics().evictions,
            1,
        )

    def test_ttl_expiration(self):
        self.cache.set(
            "ttl-key",
            "temporary",
            ttl_seconds=0.01,
        )

        self.assertEqual(
            self.cache.get("ttl-key"),
            "temporary",
        )

        time.sleep(0.03)

        self.assertIsNone(
            self.cache.get("ttl-key")
        )

        self.assertGreaterEqual(
            self.cache.statistics().expirations,
            1,
        )

    def test_request_cache(self):
        request = {
            "prompt": "Explain RAG",
            "model": "test-model",
        }

        self.cache.set_for_request(
            request,
            "RAG explanation",
            namespace="test",
        )

        self.assertEqual(
            self.cache.get_for_request(
                request,
                namespace="test",
            ),
            "RAG explanation",
        )

    def test_clear(self):
        self.cache.set("a", 1)
        self.cache.set("b", 2)

        self.cache.clear()

        self.assertEqual(
            self.cache.size(),
            0,
        )

    def test_statistics(self):
        self.cache.set(
            "key",
            "value",
        )

        self.cache.get("key")

        stats = self.cache.statistics()

        self.assertIsInstance(
            stats,
            CacheStatistics,
        )

        self.assertEqual(
            stats.entries,
            1,
        )

        self.assertEqual(
            stats.estimated_savings,
            Decimal("0.01"),
        )

    def test_clear_statistics(self):
        self.cache.set(
            "key",
            "value",
        )

        self.cache.get("key")
        self.cache.get("missing")

        self.cache.clear_statistics()

        stats = self.cache.statistics()

        self.assertEqual(stats.hits, 0)
        self.assertEqual(stats.misses, 0)
        self.assertEqual(stats.evictions, 0)

    def test_factory(self):
        from ai.optimization_engine.cache_optimizer.manager import (
            create_cache_manager,
        )

        manager = create_cache_manager()

        self.assertIsInstance(
            manager,
            CacheManager,
        )


class CacheOptimizerIntegrationTest(unittest.TestCase):

    def setUp(self):
        self.manager = CacheManager(
            max_entries=100,
            default_ttl_seconds=3600,
        )

        self.strategy = CacheStrategyManager(
            strategy=CacheStrategy.BALANCED
        )

        self.optimizer = CacheOptimizer(
            manager=self.manager,
            strategy_manager=self.strategy,
        )

        self.request = CacheOptimizationRequest(
            request={
                "prompt": "Explain retrieval augmented generation",
                "temperature": 0,
            },
            namespace="test",
            model="test-model",
            provider="test-provider",
            confidence=Decimal("0.99"),
        )

        self.execution_count = {
            "value": 0
        }

    def executor(self):
        self.execution_count["value"] += 1

        return (
            "RAG combines retrieval "
            "with generation."
        )

    def test_request_key(self):
        key = self.optimizer.build_key(
            self.request
        )

        self.assertTrue(
            key.startswith("test:")
        )

    def test_cache_miss(self):
        result = self.optimizer.execute(
            self.request,
            self.executor,
        )

        self.assertIsInstance(
            result,
            CacheOptimizationResult,
        )

        self.assertFalse(
            result.cache_hit
        )

        self.assertTrue(
            result.cache_stored
        )

        self.assertEqual(
            self.execution_count["value"],
            1,
        )

    def test_cache_hit(self):
        first = self.optimizer.execute(
            self.request,
            self.executor,
        )

        second = self.optimizer.execute(
            self.request,
            self.executor,
        )

        self.assertFalse(
            first.cache_hit
        )

        self.assertTrue(
            first.cache_stored
        )

        self.assertTrue(
            second.cache_hit
        )

        self.assertFalse(
            second.cache_stored
        )

        self.assertEqual(
            self.execution_count["value"],
            1,
        )

    def test_executor_deduplication(self):
        self.optimizer.execute(
            self.request,
            self.executor,
        )

        self.optimizer.execute(
            self.request,
            self.executor,
        )

        self.optimizer.execute(
            self.request,
            self.executor,
        )

        self.assertEqual(
            self.execution_count["value"],
            1,
        )

    def test_optimized_property(self):
        first = self.optimizer.execute(
            self.request,
            self.executor,
        )

        second = self.optimizer.execute(
            self.request,
            self.executor,
        )

        self.assertTrue(
            first.optimized
        )

        self.assertTrue(
            second.optimized
        )

    def test_serialization(self):
        self.optimizer.execute(
            self.request,
            self.executor,
        )

        result = self.optimizer.execute(
            self.request,
            self.executor,
        )

        data = result.as_dict()

        self.assertTrue(
            data["cache_hit"]
        )

        self.assertFalse(
            data["cache_stored"]
        )

        self.assertTrue(
            data["optimized"]
        )

        self.assertTrue(
            data["decision"]["should_cache"]
        )

    def test_invalidation(self):
        self.optimizer.execute(
            self.request,
            self.executor,
        )

        self.assertTrue(
            self.optimizer.invalidate(
                self.request
            )
        )

        self.assertIsNone(
            self.optimizer.lookup(
                self.request
            )
        )

    def test_streaming_bypass(self):
        request = CacheOptimizationRequest(
            request={
                "prompt": "stream response"
            },
            namespace="test",
            streaming=True,
        )

        result = self.optimizer.execute(
            request,
            lambda: "streamed",
        )

        self.assertFalse(
            result.cache_stored
        )

        self.assertEqual(
            result.decision.reason,
            "streaming_response",
        )

    def test_confidence_bypass(self):
        request = CacheOptimizationRequest(
            request={
                "prompt": "uncertain"
            },
            namespace="test",
            confidence=Decimal("0.20"),
        )

        result = self.optimizer.execute(
            request,
            lambda: "uncertain result",
        )

        self.assertFalse(
            result.cache_stored
        )

        self.assertEqual(
            result.decision.reason,
            "confidence_below_threshold",
        )

    def test_tools_bypass(self):
        request = CacheOptimizationRequest(
            request={
                "prompt": "use tool"
            },
            namespace="test",
            uses_tools=True,
        )

        result = self.optimizer.execute(
            request,
            lambda: "tool result",
        )

        self.assertFalse(
            result.cache_stored
        )

        self.assertEqual(
            result.decision.reason,
            "tool_execution",
        )

    def test_dynamic_context_bypass(self):
        request = CacheOptimizationRequest(
            request={
                "prompt": "dynamic data"
            },
            namespace="test",
            dynamic_context=True,
        )

        result = self.optimizer.execute(
            request,
            lambda: "dynamic result",
        )

        self.assertFalse(
            result.cache_stored
        )

        self.assertEqual(
            result.decision.reason,
            "dynamic_context",
        )

    def test_failed_response_bypass(self):
        request = CacheOptimizationRequest(
            request={
                "prompt": "failed request"
            },
            namespace="test",
        )

        result = self.optimizer.execute(
            request,
            lambda: "failed response",
            successful=False,
        )

        self.assertFalse(
            result.cache_stored
        )

        self.assertEqual(
            result.decision.reason,
            "unsuccessful_response",
        )

    def test_strategy_switch(self):
        self.optimizer.set_strategy(
            CacheStrategy.CONSERVATIVE
        )

        self.assertEqual(
            self.optimizer.strategy_manager.strategy,
            CacheStrategy.CONSERVATIVE,
        )

        self.optimizer.set_strategy(
            CacheStrategy.AGGRESSIVE
        )

        self.assertEqual(
            self.optimizer.strategy_manager.strategy,
            CacheStrategy.AGGRESSIVE,
        )

    def test_statistics(self):
        self.optimizer.execute(
            self.request,
            self.executor,
        )

        self.optimizer.execute(
            self.request,
            self.executor,
        )

        stats = self.optimizer.statistics()

        self.assertEqual(
            stats.hits,
            1,
        )

        self.assertEqual(
            stats.misses,
            1,
        )

    def test_clear(self):
        self.optimizer.execute(
            self.request,
            self.executor,
        )

        self.optimizer.clear()

        self.assertEqual(
            self.optimizer.statistics().entries,
            0,
        )

    def test_factory(self):
        optimizer = create_cache_optimizer()

        self.assertIsInstance(
            optimizer,
            CacheOptimizer,
        )


if __name__ == "__main__":
    unittest.main()
