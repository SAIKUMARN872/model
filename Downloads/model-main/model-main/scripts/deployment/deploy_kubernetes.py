"""
deployment/deploy_kubernetes.py

Deploy Kubernetes resources using kubectl.
"""

from __future__ import annotations

import subprocess
from pathlib import Path

from loguru import logger


class KubernetesDeploymentError(Exception):
    """Raised when Kubernetes deployment fails."""


class KubernetesDeployer:
    """
    Deploy Kubernetes manifests.

    Example:
        deployer = KubernetesDeployer("k8s")
        deployer.deploy()
    """

    def __init__(self, manifests_path: str | Path):
        self.manifests_path = Path(manifests_path)

    def deploy(self) -> None:
        """
        Apply Kubernetes manifests.
        """

        if not self.manifests_path.exists():
            raise KubernetesDeploymentError(
                f"Manifest path not found: {self.manifests_path}"
            )

        logger.info("Applying Kubernetes manifests...")

        try:
            subprocess.run(
                [
                    "kubectl",
                    "apply",
                    "-f",
                    str(self.manifests_path),
                ],
                check=True,
            )

            logger.success("Kubernetes resources applied successfully.")

        except subprocess.CalledProcessError as exc:
            logger.exception("Failed to deploy Kubernetes resources.")
            raise KubernetesDeploymentError(
                "kubectl apply failed."
            ) from exc

    def rollout_status(
        self,
        deployment_name: str,
        namespace: str = "default",
    ) -> None:
        """
        Wait until deployment is ready.
        """

        logger.info(
            f"Waiting for deployment '{deployment_name}' rollout..."
        )

        try:
            subprocess.run(
                [
                    "kubectl",
                    "rollout",
                    "status",
                    f"deployment/{deployment_name}",
                    "-n",
                    namespace,
                ],
                check=True,
            )

            logger.success(
                f"Deployment '{deployment_name}' is ready."
            )

        except subprocess.CalledProcessError as exc:
            logger.exception("Rollout failed.")
            raise KubernetesDeploymentError(
                "Deployment rollout failed."
            ) from exc


def deploy(
    manifest_directory: str = "k8s",
    deployment_name: str = "ai-service",
    namespace: str = "default",
) -> None:
    """
    Deploy application to Kubernetes.
    """

    deployer = KubernetesDeployer(manifest_directory)

    deployer.deploy()
    deployer.rollout_status(
        deployment_name=deployment_name,
        namespace=namespace,
    )


if __name__ == "__main__":
    deploy()