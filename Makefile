# Configuration
PROJECT_ID := epsx-449804
REGION := asia-southeast1
IMAGE_NAME := epsx-backend
REGISTRY := $(REGION)-docker.pkg.dev/$(PROJECT_ID)/epsx/$(IMAGE_NAME)
VERSION := latest

# Colors for terminal output
GREEN := \033[0;32m
NC := \033[0m # No Color

.PHONY: help build push deploy run-local clean

help: ## Display this help
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

build: ## Build the Docker image
	@echo "$(GREEN)Building Docker image...$(NC)"
	docker build --platform linux/amd64 -t $(REGISTRY):$(VERSION) .

push: ## Push the Docker image to Container Registry
	@echo "$(GREEN)Pushing image to Container Registry...$(NC)"
	docker push $(REGISTRY):$(VERSION)

build-push: build push ## Build and push the Docker image

deploy: ## Deploy to Cloud Run
	@echo "$(GREEN)Deploying to Cloud Run...$(NC)"
	gcloud run deploy $(IMAGE_NAME) \
		--image $(REGISTRY):$(VERSION) \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated

run-local: ## Run the container locally
	@echo "$(GREEN)Running container locally...$(NC)"
	docker run -p 8080:8080 \
		--env-file .env.production \
		$(REGISTRY):$(VERSION)

clean: ## Clean up local Docker images
	@echo "$(GREEN)Cleaning up local Docker images...$(NC)"
	docker rmi $(REGISTRY):$(VERSION) || true

# Future Features/TODO:
# - Add support for different environments (dev, staging, prod)
# - Add database migration commands
# - Add automated testing before deployment
# - Add rollback functionality
# - Add health check verification after deployment
# - Add monitoring and logging setup
# - Add SSL certificate configuration
# - Add CI/CD pipeline integration
