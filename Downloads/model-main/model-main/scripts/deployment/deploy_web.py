"""
deployment/deploy_web.py

Utility for deploying the web application.

Supports deployment through a shell command (for example:
Vercel, Netlify, Render CLI, or any custom deployment script).
"""

from __future__ import annotations

import shlex
import subprocess

from loguru import logger


class WebDeploymentError(Exception):
    """Raised when web deployment fails."""


class WebDeployer:
    """
    Deploy a web application.

    Example:
        deployer = WebDeployer("npm run deploy")
        deployer.deploy()
    """

    def __init__(self, deploy_command: str) -> None:
        self.deploy_command = deploy_command

    def deploy(self) -> None:
        """Execute the deployment command."""

        logger.info("Starting web deployment...")

        try:
            subprocess.run(
                shlex.split(self.deploy_command),
                check=True,
            )

            logger.success("Web application deployed successfully.")

        except subprocess.CalledProcessError as exc:
            logger.exception("Web deployment failed.")

            raise WebDeploymentError(
                "Failed to deploy web application."
            ) from exc


def deploy(
    command: str = "npm run deploy",
) -> None:
    """
    Deploy the frontend application.

    Args:
        command: Deployment command.
    """

    deployer = WebDeployer(command)
    deployer.deploy()


if __name__ == "__main__":
    deploy()