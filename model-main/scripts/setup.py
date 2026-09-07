"""
setup.py

Project packaging and installation configuration.

Usage:
    python setup.py install
    python setup.py develop
    python setup.py sdist
    python setup.py bdist_wheel
"""

from pathlib import Path

from setuptools import find_packages, setup


PROJECT_ROOT = Path(__file__).parent

README = PROJECT_ROOT / "README.md"

long_description = (
    README.read_text(encoding="utf-8")
    if README.exists()
    else ""
)


setup(
    name="ai-platform",
    version="1.0.0",
    author="Your Name",
    author_email="your.email@example.com",
    description="Production-ready AI Platform built with FastAPI.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/ai-platform",
    license="MIT",

    packages=find_packages(
        exclude=[
            "tests",
            "tests.*",
            "docs",
            "examples",
        ],
    ),

    include_package_data=True,

    python_requires=">=3.11",

    install_requires=[
        "fastapi>=0.115.0",
        "uvicorn[standard]>=0.35.0",
        "sqlalchemy>=2.0.0",
        "alembic>=1.14.0",
        "pydantic>=2.10.0",
        "pydantic-settings>=2.7.0",
        "python-dotenv>=1.0.1",
        "httpx>=0.28.0",
        "requests>=2.32.0",
        "loguru>=0.7.2",
    ],

    extras_require={
        "dev": [
            "pytest>=8.3.0",
            "pytest-asyncio>=0.25.0",
            "black>=24.10.0",
            "isort>=5.13.0",
            "flake8>=7.1.0",
            "mypy>=1.13.0",
            "bandit>=1.8.0",
            "pip-audit>=2.8.0",
        ],
        "docs": [
            "sphinx>=8.1.0",
        ],
    },

    entry_points={
        "console_scripts": [
            "ai-platform=main:main",
        ],
    },

    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Operating System :: OS Independent",
    ],

    keywords=[
        "ai",
        "fastapi",
        "machine-learning",
        "llm",
        "rag",
        "api",
        "python",
    ],

    zip_safe=False,
)