publish-patch: patch publish

minor:
	npm version minor

patch:
	npm version patch

push-tags:
	git push origin --tags

push: push-tags
	git push origin

publish: push
	npm publish
