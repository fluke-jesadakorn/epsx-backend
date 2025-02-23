IMAGE_NAME=epsx-backend
VERSION?=latest
DOCKER_REGISTRY?=us-central1-docker.pkg.dev
GCP_PROJECT?=epsx-449804
REGION?=us-central1

.PHONY: build
build:
	docker build --platform linux/amd64 -f Dockerfile.production -t $(IMAGE_NAME):$(VERSION) .

.PHONY: push
push:
	docker tag $(IMAGE_NAME):$(VERSION) $(DOCKER_REGISTRY)/$(GCP_PROJECT)/epsx/$(IMAGE_NAME):$(VERSION)
	docker push $(DOCKER_REGISTRY)/$(GCP_PROJECT)/epsx/$(IMAGE_NAME):$(VERSION)

.PHONY: deploy
deploy:
	gcloud run deploy $(IMAGE_NAME) \n	--image $(DOCKER_REGISTRY)/$(GCP_PROJECT)/epsx/$(IMAGE_NAME):$(VERSION) \n	--project $(GCP_PROJECT) \n	--region $(REGION) \n	--platform managed \n	--allow-unauthenticated

.PHONY: clean
clean:
	-docker rmi $(IMAGE_NAME):$(VERSION)
	-docker rmi $(DOCKER_REGISTRY)/$(GCP_PROJECT)/epsx/$(IMAGE_NAME):$(VERSION)
