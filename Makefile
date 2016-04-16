publish-major: major publish
publish-minor: minor publish
publish-patch: patch publish

major:
	npm version major

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
