"""
Web-page metadata extraction.
"""

from __future__ import annotations

from typing import Any


class MetadataExtractor:
    """Extract metadata from a web page."""

    def __init__(
        self,
        page: Any,
    ) -> None:

        if page is None:

            raise ValueError(
                "page is required."
            )

        self.page = page

    async def extract(
        self,
    ) -> dict[str, Any]:

        return await self.page.evaluate(
            """
            () => {
                const getMeta = (name) => {
                    const element =
                        document.querySelector(
                            `meta[name="${name}"]`
                        );

                    return element
                        ? element.content || ""
                        : "";
                };

                const getProperty = (name) => {
                    const element =
                        document.querySelector(
                            `meta[property="${name}"]`
                        );

                    return element
                        ? element.content || ""
                        : "";
                };

                return {
                    title: document.title || "",
                    description:
                        getMeta("description"),
                    keywords:
                        getMeta("keywords"),
                    author:
                        getMeta("author"),
                    robots:
                        getMeta("robots"),
                    canonical:
                        document.querySelector(
                            "link[rel='canonical']"
                        )?.href || "",
                    language:
                        document.documentElement
                            ?.lang || "",
                    charset:
                        document.characterSet || "",
                    viewport:
                        getMeta("viewport"),

                    og_title:
                        getProperty("og:title"),
                    og_description:
                        getProperty(
                            "og:description"
                        ),
                    og_image:
                        getProperty("og:image"),
                    og_url:
                        getProperty("og:url"),
                    og_type:
                        getProperty("og:type"),

                    twitter_card:
                        getMeta("twitter:card"),
                    twitter_title:
                        getMeta("twitter:title"),
                    twitter_description:
                        getMeta(
                            "twitter:description"
                        ),
                    twitter_image:
                        getMeta("twitter:image"),

                    url: location.href,
                };
            }
            """
        )

    async def title(
        self,
    ) -> str:

        return await self.page.title()

    async def canonical(
        self,
    ) -> str:

        return await self.page.evaluate(
            """
            () =>
                document.querySelector(
                    "link[rel='canonical']"
                )?.href || ""
            """
        )

    async def description(
        self,
    ) -> str:

        return await self.page.evaluate(
            """
            () =>
                document.querySelector(
                    "meta[name='description']"
                )?.content || ""
            """
        )