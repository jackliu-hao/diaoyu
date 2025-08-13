PROJECT=phishing-training
DOCKER_COMPOSE=docker-compose
HTPASSWD_FILE=nginx/.htpasswd

.PHONY: all build up down logs restart htpasswd clean

all: build up

build:
	$(DOCKER_COMPOSE) build --no-cache

up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

logs:
	$(DOCKER_COMPOSE) logs -f --tail=200

restart: down up

# Usage: make htpasswd USER=admin PASS=secret
htpasswd:
	@mkdir -p nginx
	@docker run --rm --entrypoint sh httpd:2.4-alpine -c "htpasswd -nbB \"$(USER)\" \"$(PASS)\"" > $(HTPASSWD_FILE)
	@echo "Created $(HTPASSWD_FILE) for user $(USER)"

clean: down
	@docker volume rm $$(docker volume ls -qf name=${PROJECT}_app_logs) 2>/dev/null || true
	@rm -f $(HTPASSWD_FILE)