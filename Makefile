publish-patch: patch publish

patch:
	npm version patch

push-tags:
	git push origin --tags

push: push-tags
	git push origin

publish: push
	npm publish
