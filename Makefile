tnp: publish

push-tags:
	git push origin --tags

push: push-tags
	git push origin

publish: push
	npm publish
