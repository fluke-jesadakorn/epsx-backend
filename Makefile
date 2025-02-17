# Default service (can be overridden via command line)
SERVICE ?= gateway

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf apps/*/dist
	rm -rf libs/*/dist

# Build common library
build-common:
	cd libs/common && bun run build

# Build specific service
build-service:
	bun run build:$(SERVICE)

# Build all services
build-all: clean build-common
	bun run build:ai
	bun run build:exchange
	bun run build:financial
	bun run build:gateway
	bun run build:stock

# Docker build command with service argument
docker-build:
	docker build --build-arg SERVICE=$(SERVICE) -t epsx-$(SERVICE):latest .

# Docker push command (adjust registry as needed)
docker-push:
	docker push epsx-$(SERVICE):latest

# Full build and push workflow
deploy: clean build-service docker-build docker-push

.PHONY: clean build-common build-service build-all docker-build docker-push deploy
