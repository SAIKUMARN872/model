<#
===============================================================================
kubernetes_apply.ps1

Apply Kubernetes manifests to a cluster.

Usage:
    .\kubernetes_apply.ps1

Examples:
    .\kubernetes_apply.ps1
    .\kubernetes_apply.ps1 -ManifestPath ".\k8s"
    .\kubernetes_apply.ps1 -Namespace "production"
===============================================================================
#>

param(
    [string]$ManifestPath = ".\k8s",
    [string]$Namespace = "default"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Kubernetes Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

try {

    # Verify kubectl exists
    kubectl version --client | Out-Null

    if (-not (Test-Path $ManifestPath)) {
        throw "Manifest directory not found: $ManifestPath"
    }

    Write-Host "Applying manifests..."
    Write-Host "Directory : $ManifestPath"
    Write-Host "Namespace : $Namespace"
    Write-Host ""

    kubectl apply `
        -f $ManifestPath `
        -n $Namespace

    if ($LASTEXITCODE -ne 0) {
        throw "kubectl apply failed."
    }

    Write-Host ""
    Write-Host "Kubernetes manifests applied successfully." -ForegroundColor Green

}
catch {

    Write-Host ""
    Write-Host "Deployment failed." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}