"""
deployment/deploy.py

Unified deployment entry point.

This module can deploy different application components such as:
- API
- Web
- Kubernetes

Usage:
    python deploy.py --target api
    python deploy.py --target web
    python deploy.py --target kubernetes
"""

from __future__ import annotations

import argparse

from loguru import logger

from deployment.deploy_api import deploy as deploy_api
from deployment.deploy_kubernetes import deploy as deploy_kubernetes
from deployment.deploy_web import deploy as deploy_web


class DeploymentError(Exception):
    """Raised when deployment fails."""


def deploy(target: str) -> None:
    """
    Deploy the selected target.

    Args:
        target: api, web, or kubernetes.
    """

    logger.info("Starting deployment for '{}'.", target)

    try:
        if target == "api":
            deploy_api()

        elif target == "web":
            deploy_web()

        elif target in {"kubernetes", "k8s"}:
            deploy_kubernetes()

        else:
            raise DeploymentError(
                f"Unsupported deployment target: {target}"
            )

        logger.success("{} deployment completed successfully.", target)

    except Exception as exc:
        logger.exception("Deployment failed.")
        raise DeploymentError(str(exc)) from exc


def main() -> None:
    """CLI entry point."""

    parser = argparse.ArgumentParser(
        description="Application Deployment Utility"
    )

    parser.add_argument(
        "--target",
        choices=["api", "web", "kubernetes", "k8s"],
        required=True,
        help="Deployment target",
    )

    args = parser.parse_args()

    deploy(args.target)


if __name__ == "__main__":
    main()