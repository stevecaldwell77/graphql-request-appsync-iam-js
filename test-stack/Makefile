.PHONY: deploy-stack get-api-url destroy-stack

STACK_NAME=graphql-request-appsync-iam-test-stack

deploy-stack:
	@aws cloudformation deploy \
		--stack-name $(STACK_NAME) \
		--template-file ./cfn.yml \
		--capabilities CAPABILITY_NAMED_IAM

get-api-url:
	@aws cloudformation describe-stacks \
		--stack-name $(STACK_NAME) \
		--query "Stacks[0].Outputs[?OutputKey=='GraphQLApiUrl'].OutputValue" \
		--output text

destroy-stack:
	@aws cloudformation delete-stack \
		--stack-name $(STACK_NAME)
	@aws cloudformation wait stack-delete-complete \
		--stack-name $(STACK_NAME)
