import unittest

from ai.browser_automation.crawler import (
    BrowserCrawler,
    CrawlQueue,
    CrawlQueueItem,
    CrawlerManager,
)
from ai.browser_automation.crawler.utils import normalize_url, resolve_url, same_origin
from ai.browser_automation.exceptions import BrowserActionError


class FakeLocator:
    def __init__(self, page, selector):
        self.page = page
        self.selector = selector

    async def inner_text(self, **kwargs):
        return "Example page text"

    async def evaluate_all(self, expression):
        return list(self.page.links)


class FakePage:
    def __init__(self):
        self.url = ""
        self.links = []
        self.events = []

    async def goto(self, url, **kwargs):
        self.url = url
        self.events.append(("goto", url))
        if url.endswith("/bad"):
            raise RuntimeError("navigation failed")
        if url.endswith("/"):
            self.links = [
                "https://example.com/one",
                "https://example.com/two",
                "https://other.example/tres",
                "file:///C:/secret.txt",
            ]
        else:
            self.links = []

    async def title(self):
        return "Example"

    def locator(self, selector):
        return FakeLocator(self, selector)


class CrawlQueueTests(unittest.TestCase):
    def test_fifo_queue(self):
        queue = CrawlQueue()
        queue.enqueue("https://example.com/one")
        queue.enqueue("https://example.com/two")
        self.assertEqual(queue.dequeue().url, "https://example.com/one")
        self.assertEqual(queue.dequeue().url, "https://example.com/two")
        self.assertIsNone(queue.dequeue())

    def test_deduplicates_urls(self):
        queue = CrawlQueue()
        self.assertTrue(queue.enqueue("https://example.com"))
        self.assertFalse(queue.enqueue("https://example.com"))
        self.assertEqual(len(queue), 1)

    def test_rejects_unsafe_url(self):
        queue = CrawlQueue()
        with self.assertRaises(Exception):
            queue.enqueue("http://localhost")

    def test_queue_size_limit(self):
        queue = CrawlQueue(max_size=1)
        queue.enqueue("https://example.com/one")
        with self.assertRaises(OverflowError):
            queue.enqueue("https://example.com/two")

    def test_item_rejects_negative_depth(self):
        with self.assertRaises(ValueError):
            CrawlQueueItem("https://example.com", depth=-1)


class CrawlerUtilsTests(unittest.TestCase):
    def test_normalize_removes_fragment(self):
        self.assertEqual(
            normalize_url("https://example.com/page#section"),
            "https://example.com/page",
        )

    def test_resolve_relative_link(self):
        self.assertEqual(
            resolve_url("https://example.com/a/", "../b"),
            "https://example.com/b",
        )

    def test_rejects_unsafe_link(self):
        self.assertIsNone(resolve_url("https://example.com", "file:///secret"))

    def test_same_origin(self):
        self.assertTrue(
            same_origin("https://example.com/a", "https://example.com/b")
        )
        self.assertFalse(
            same_origin("https://example.com", "https://other.example")
        )


class BrowserCrawlerTests(unittest.IsolatedAsyncioTestCase):
    async def test_crawl_page_extracts_title_text_and_safe_links(self):
        page = FakePage()
        crawler = BrowserCrawler(page)
        result = await crawler.crawl_page("https://example.com/")

        self.assertEqual(result.title, "Example")
        self.assertEqual(result.text, "Example page text")
        self.assertIn("https://example.com/one", result.links)
        self.assertNotIn("file:///C:/secret.txt", result.links)

    async def test_crawl_stays_on_start_host_and_obeys_limit(self):
        page = FakePage()
        crawler = BrowserCrawler(page, max_pages=2)
        results = await crawler.crawl("https://example.com/")

        self.assertEqual(len(results), 2)
        self.assertTrue(all("example.com" in result.url for result in results))

    async def test_crawl_page_wraps_navigation_error(self):
        page = FakePage()
        crawler = BrowserCrawler(page)
        with self.assertRaises(BrowserActionError):
            await crawler.crawl_page("https://example.com/bad")

    async def test_requires_page(self):
        with self.assertRaises(ValueError):
            BrowserCrawler(None)


class CrawlerManagerTests(unittest.IsolatedAsyncioTestCase):
    async def test_run_and_get_results(self):
        manager = CrawlerManager(FakePage())
        results = await manager.run("job-1", "https://example.com/")
        self.assertTrue(results)
        self.assertEqual(manager.get_results("job-1"), results)

    async def test_rejects_duplicate_job(self):
        manager = CrawlerManager(FakePage())
        await manager.run("job-1", "https://example.com/")
        with self.assertRaises(ValueError):
            await manager.run("job-1", "https://example.com/")

    async def test_remove_job(self):
        manager = CrawlerManager(FakePage())
        await manager.run("job-1", "https://example.com/")
        self.assertTrue(manager.remove("job-1"))
        self.assertFalse(manager.remove("job-1"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
