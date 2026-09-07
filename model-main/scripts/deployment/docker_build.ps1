<#
===============================================================================
docker_build.ps1

Build a Docker image for the application.

Usage:
    .\docker_build.ps1

Optional:
    .\docker_build.ps1 -ImageName ai-service -Tag latest
===============================================================================
#>

param(
    [string]$ImageName = "ai-service",
    [string]$Tag = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Building Docker Image" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

try {

    $Image = "$ImageName`:$Tag"

    Write-Host "Image Name : $ImageName"
    Write-Host "Tag        : $Tag"
    Write-Host ""

    docker build `
        -t $Image `
        .

    if ($LASTEXITCODE -ne 0) {
        throw "Docker build failed."
    }

    Write-Host ""
    Write-Host "Docker image built successfully!" -ForegroundColor Green
    Write-Host "Image: $Image" -ForegroundColor Green
}
catch {

    Write-Host ""
    Write-Host "Docker build failed." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}