#!/usr/bin/env bash
set -e

echo "🧪 Running Backend Tests..."
cd backend
pytest ../tests -v --cov=app --cov-report=term-missing

echo "✨ All tests passed successfully!"
