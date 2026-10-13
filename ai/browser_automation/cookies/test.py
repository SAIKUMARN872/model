import tempfile
import unittest
from pathlib import Path

from ai.browser_automation.cookies.security import validate_cookie_data
from ai.browser_automation.cookies.storage import CookieStorage
from ai.browser_automation.cookies.manager import CookieManager


class FakeContext:
    def __init__(self):
        self.cookies_data = []
        self.events = []

    async def cookies(self, urls=None):
        self.events.append(("cookies", urls))
        return list(self.cookies_data)

    async def add_cookies(self, cookies):
        self.events.append(("add_cookies", cookies))
        self.cookies_data.extend(cookies)

    async def clear_cookies(self):
        self.events.append(("clear_cookies",))
        self.cookies_data.clear()


class CookieSecurityTests(unittest.TestCase):
    def test_valid_cookie(self):
        cookie = validate_cookie_data({
            "name": "session",
            "value": "abc123",
            "domain": "example.com",
            "path": "/",
            "secure": True,
            "httpOnly": True,
        })
        self.assertEqual(cookie["name"], "session")
        self.assertTrue(cookie["secure"])
        self.assertTrue(cookie["httpOnly"])

    def test_rejects_non_dictionary(self):
        with self.assertRaises(ValueError):
            validate_cookie_data("session=abc123")

    def test_rejects_missing_name(self):
        with self.assertRaises(ValueError):
            validate_cookie_data({
                "value": "abc123",
                "domain": "example.com",
            })

    def test_rejects_localhost_domain(self):
        with self.assertRaises(ValueError):
            validate_cookie_data({
                "name": "session",
                "value": "abc123",
                "domain": "localhost",
            })

    def test_rejects_invalid_path(self):
        with self.assertRaises(ValueError):
            validate_cookie_data({
                "name": "session",
                "value": "abc123",
                "domain": "example.com",
                "path": "relative",
            })


class CookieStorageTests(unittest.TestCase):
    def test_save_and_load(self):
        with tempfile.TemporaryDirectory() as directory:
            storage = CookieStorage(Path(directory) / "cookies.json")
            cookies = [{
                "name": "session",
                "value": "abc123",
                "domain": "example.com",
                "path": "/",
                "secure": True,
            }]
            storage.save(cookies)
            self.assertEqual(storage.load()[0]["name"], "session")

    def test_missing_storage_returns_empty_list(self):
        with tempfile.TemporaryDirectory() as directory:
            storage = CookieStorage(Path(directory) / "missing.json")
            self.assertEqual(storage.load(), [])

    def test_delete_storage(self):
        with tempfile.TemporaryDirectory() as directory:
            storage = CookieStorage(Path(directory) / "cookies.json")
            storage.save([])
            self.assertTrue(storage.delete())
            self.assertFalse(storage.delete())


class CookieManagerTests(unittest.IsolatedAsyncioTestCase):
    async def test_get_cookies(self):
        context = FakeContext()
        context.cookies_data = [{
            "name": "session",
            "value": "abc123",
            "domain": "example.com",
            "path": "/",
            "secure": True,
        }]
        manager = CookieManager(context)
        cookies = await manager.get_cookies()
        self.assertEqual(cookies[0]["name"], "session")

    async def test_add_cookies(self):
        context = FakeContext()
        manager = CookieManager(context)
        await manager.add_cookies([{
            "name": "session",
            "value": "abc123",
            "domain": "example.com",
            "path": "/",
        }])
        self.assertEqual(len(context.cookies_data), 1)

    async def test_clear_cookies(self):
        context = FakeContext()
        manager = CookieManager(context)
        await manager.add_cookies([{
            "name": "session",
            "value": "abc123",
            "domain": "example.com",
            "path": "/",
        }])
        await manager.clear_cookies()
        self.assertEqual(context.cookies_data, [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
