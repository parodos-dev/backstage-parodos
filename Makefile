DOCKER ?= docker

ORG=quay.io/parodos-dev/
IMAGE=backstage-parodos

GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD | sed s,^main$$,latest,g)
GIT_HASH := $(shell git rev-parse HEAD)

build-image:
	./scripts/build-image.sh
	$(DOCKER) tag backstage:latest  $(ORG)$(IMAGE):$(GIT_BRANCH)
	$(DOCKER) tag backstage:latest  $(ORG)$(IMAGE):$(GIT_HASH)

build-image-openshift:
	$(DOCKER) build -t backstage:latest-openshift -f Dockerfile-openshift .
	$(DOCKER) tag backstage:latest-openshift  $(ORG)$(IMAGE):$(GIT_BRANCH)-openshift
	$(DOCKER) tag backstage:latest-openshift  $(ORG)$(IMAGE):$(GIT_HASH)-openshift


push-image:
	$(DOCKER) push $(ORG)$(IMAGE):$(GIT_HASH)
	$(DOCKER) push $(ORG)$(IMAGE):$(GIT_BRANCH)

push-image-openshift:
	$(DOCKER) push $(ORG)$(IMAGE):$(GIT_HASH)-openshift
	$(DOCKER) push $(ORG)$(IMAGE):$(GIT_BRANCH)-openshift
