<#
===============================================================================
setup.ps1

Project setup script for Windows.

This script:
- Verifies Python installation
- Creates a virtual environment
- Activates the virtual environment
- Upgrades pip
- Installs project dependencies
- Displays next steps

Usage:
    .\setup.ps1

Optional:
    .\setup.ps1 -Python python3
===============================================================================
#>

param(
    [string]$Python = "python"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Project Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

try {

    # Check Python
    Write-Host "Checking Python..."

    & $Python --version

    if ($LASTEXITCODE -ne 0) {
        throw "Python is not installed or not available in PATH."
    }

    # Create virtual environment
    if (-not (Test-Path ".venv")) {

        Write-Host ""
        Write-Host "Creating virtual environment..."

        & $Python -m venv .venv

        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create virtual environment."
        }
    }
    else {
        Write-Host "Virtual environment already exists."
    }

    # Activate virtual environment
    Write-Host ""
    Write-Host "Activating virtual environment..."

    & ".\.venv\Scripts\Activate.ps1"

    # Upgrade pip
    Write-Host ""
    Write-Host "Upgrading pip..."

    python -m pip install --upgrade pip

    # Install requirements
    if (Test-Path "requirements.txt") {

        Write-Host ""
        Write-Host "Installing project dependencies..."

        python -m pip install -r requirements.txt
    }
    else {
        Write-Warning "requirements.txt not found."
    }

    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host " Setup Completed Successfully!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "To activate the environment manually:"
    Write-Host ".\.venv\Scripts\Activate.ps1"
    Write-Host ""
}
catch {

    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host " Setup Failed" -ForegroundColor Red
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    exit 1
}