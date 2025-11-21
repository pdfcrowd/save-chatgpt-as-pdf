# Test suite makefile for save-chatgpt-as-pdf extension

.PHONY: install test test-watch test-coverage lint clean help

# Default target
all: test

help:
	@echo "Available targets:"
	@echo "  install       - Install test dependencies"
	@echo "  test          - Run all tests"
	@echo "  test-watch    - Run tests in watch mode"
	@echo "  test-coverage - Run tests with coverage report"
	@echo "  lint          - Run linting checks"
	@echo "  clean         - Clean test artifacts"

install:
	@echo "Installing test dependencies..."
	npm install

test:
	@echo "Running tests..."
	npm test

test-watch:
	@echo "Running tests in watch mode..."
	npm run test:watch

test-coverage:
	@echo "Running tests with coverage..."
	npm run test:coverage
	@echo "Coverage report saved to coverage/"

lint:
	@echo "Checking code style..."
	npx eslint ../background.js ../common.js ../request.js --max-warnings 0 || true

clean:
	@echo "Cleaning test artifacts..."
	rm -rf coverage/
	rm -rf node_modules/
	rm -f package-lock.json
	@echo "Clean complete"

# Run specific test suites
test-unit:
	@echo "Running unit tests..."
	npx jest unit/

test-integration:
	@echo "Running integration tests..."
	npx jest integration/

# Quick test for CI
test-ci: install test-coverage
