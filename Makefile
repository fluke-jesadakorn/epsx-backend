# Image configuration
IMAGE_NAME=epsx-backend
VERSION?=latest
DOCKER_REGISTRY?=us-central1-docker.pkg.dev
GCP_PROJECT?=epsx-449804
REGION?=us-central1

# Service names
SERVICES=gateway stock financial exchange ai-service

# Colors for pretty printing
COLOR_RESET=\033[0m
COLOR_BLUE=\033[1;34m
COLOR_GREEN=\033[1;32m

# Default target
.PHONY: all
all: help

# Help documentation
.PHONY: help
help:
	@echo "$(COLOR_BLUE)EPSX Backend Build System$(COLOR_RESET)"
	@echo "Available targets:"
	@echo "  $(COLOR_GREEN)make build$(COLOR_RESET)              - Build all services"
	@echo "  $(COLOR_GREEN)make build-dev$(COLOR_RESET)          - Build all services in development mode"
	@echo "  $(COLOR_GREEN)make build-SERVICE$(COLOR_RESET)      - Build specific service (e.g., make build-gateway)"
	@echo "  $(COLOR_GREEN)make push$(COLOR_RESET)               - Push all images to registry"
	@echo "  $(COLOR_GREEN)make deploy$(COLOR_RESET)             - Deploy to Google Cloud Run"
	@echo "  $(COLOR_GREEN)make clean$(COLOR_RESET)              - Clean up Docker images"
	@echo "  $(COLOR_GREEN)make version$(COLOR_RESET)            - Set version for images"
	@echo ""
	@echo "Environment variables:"
	@echo "  VERSION             - Image version tag (default: latest)"
	@echo "  DOCKER_REGISTRY     - Docker registry URL (default: gcr.io)"
	@echo "  GCP_PROJECT         - Google Cloud project ID"
	@echo "  REGION             - Google Cloud region (default: asia-southeast1)"

# Build all services for production
.PHONY: build
build:
	@echo "$(COLOR_BLUE)Building all services for production...$(COLOR_RESET)"
	docker build -t $(IMAGE_NAME):$(VERSION) \
	--build-arg NODE_ENV=production .

# Build all services for development
.PHONY: build-dev
build-dev:
@echo "$(COLOR_BLUE)Building all services for development...$(COLOR_RESET)"
docker build -t $(IMAGE_NAME):$(VERSION)-dev \
--build-arg NODE_ENV=development .

# Individual service builds
define make-service-target
.PHONY: build-$(1)
build-$(1):
@echo "$(COLOR_BLUE)Building $(1) service...$(COLOR_RESET)"
docker build -t $(IMAGE_NAME)-$(1):$(VERSION) \
--build-arg SERVICE=$(1) \
--target builder .
endef

$(foreach service,$(SERVICES),$(eval $(call make-service-target,$(service))))

# Push images to registry
.PHONY: push
push:
@echo "$(COLOR_BLUE)Pushing images to registry...$(COLOR_RESET)"
docker tag $(IMAGE_NAME):$(VERSION) $(DOCKER_REGISTRY)/$(GCP_PROJECT)/$(IMAGE_NAME):$(VERSION)
docker push $(DOCKER_REGISTRY)/$(GCP_PROJECT)/$(IMAGE_NAME):$(VERSION)
@echo "$(COLOR_GREEN)Successfully pushed images$(COLOR_RESET)"

# Deploy to Google Cloud Run
.PHONY: deploy
deploy:
@echo "$(COLOR_BLUE)Deploying to Google Cloud Run...$(COLOR_RESET)"
gcloud run deploy $(IMAGE_NAME) \
  --image $(DOCKER_REGISTRY)/$(GCP_PROJECT)/$(IMAGE_NAME):$(VERSION) \
  --project $(GCP_PROJECT) \
  --region $(REGION) \
  --platform managed \
  --allow-unauthenticated
@echo "$(COLOR_GREEN)Successfully deployed to Cloud Run$(COLOR_RESET)"

# Clean up
.PHONY: clean
clean:
	@echo "$(COLOR_BLUE)Cleaning up Docker images...$(COLOR_RESET)"
	-docker rmi $(IMAGE_NAME):$(VERSION)
	-docker rmi $(DOCKER_REGISTRY)/$(GCP_PROJECT)/$(IMAGE_NAME):$(VERSION)
	-docker rmi $(IMAGE_NAME):$(VERSION)-dev
	-docker rmi $(DOCKER_REGISTRY)/$(GCP_PROJECT)/$(IMAGE_NAME):$(VERSION)-dev
	$(foreach service,$(SERVICES),\
	-docker rmi $(DOCKER_REGISTRY)/$(GCP_PROJECT)/$(IMAGE_NAME)-$(service):$(VERSION);)
	@echo "$(COLOR_GREEN)Cleanup complete$(COLOR_RESET)"

# Set version
.PHONY: version
version:
	@if [ "$(VERSION)" = "latest" ]; then \
	echo "$(COLOR_BLUE)Current version: latest$(COLOR_RESET)"; \
	else \
	echo "$(COLOR_BLUE)Current version: $(VERSION)$(COLOR_RESET)"; \
	fi

# TODO: Future Features
# 1. Add support for multi-arch builds
# 2. Implement caching optimization
# 3. Add testing targets
# 4. Add vulnerability scanning
# 5. Implement CI/CD pipeline integration
# 6. Add support for different environments (staging, prod)
# 7. Add Docker Compose integration for local development
# 8. Implement build arguments for service-specific configurations
# 9. Add support for custom base images per service
# 10. Implement parallel builds for faster compilation
