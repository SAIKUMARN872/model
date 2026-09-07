export interface LinkOptions {
  newTab?: boolean;
  external?: boolean;
  replace?: boolean;
}

export class LinkHandler {
  public open(
    url: string,
    options: LinkOptions = {}
  ): void {
    if (!url.trim()) {
      throw new Error("URL is required.");
    }

    if (typeof window === "undefined") {
      return;
    }

    const {
      newTab = false,
      external = false,
      replace = false,
    } = options;

    if (external || newTab) {
      window.open(
        url,
        newTab ? "_blank" : "_self",
        newTab
          ? "noopener,noreferrer"
          : undefined
      );

      return;
    }

    if (replace) {
      window.location.replace(url);
      return;
    }

    window.location.href = url;
  }

  public openExternal(
    url: string
  ): void {
    this.open(url, {
      external: true,
      newTab: true,
    });
  }

  public openInternal(
    path: string
  ): void {
    this.open(path);
  }

  public isExternal(
    url: string
  ): boolean {
    try {
      if (typeof window === "undefined") {
        return false;
      }

      const linkUrl = new URL(
        url,
        window.location.origin
      );

      return (
        linkUrl.origin !==
        window.location.origin
      );
    } catch {
      return false;
    }
  }
}

const linkHandler =
  new LinkHandler();

export default linkHandler;