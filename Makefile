# Convenience aliases for this repository's npm commands.
.DEFAULT_GOAL := help
.PHONY: help build run dev preview test verify deploy
unexport BRANCH

help:
	@echo "build: install, build and test; dev/run: local server; preview: built site"
	@echo "test: suite; verify: shipped-output fence; deploy BRANCH=name: checked upload"

build:
	bash ./build.sh

run dev:
	npm run dev

preview:
	npm run preview

test:
	npm test

verify:
	npm run verify:dist

deploy: export COMPANYSITE_DEPLOY_BRANCH := $(value BRANCH)
deploy:
	npm run deploy -- --from-make
