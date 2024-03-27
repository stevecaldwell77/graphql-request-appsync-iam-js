# HowTo: Live test of getGraphQLClient()

Background: our test located in src/index.spec.ts has a test that will make live calls to a GraphQL API if the `TEST_GRAPHQL_URL` environment variable is set. This is useful for testing the library against a real AppSync API. However, it means you need to manually deploy a test stack to AWS to create the backing resource.

The below assumes you have AWS credentials loaded in your environment with admin permissions.

Deploy our test stack:

```sh
make -C test-stack deploy-stack
```

Get the API URL:

```sh
api_url=$(make -C test-stack get-api-url)
```

Test that the API works using the [awscurl](https://github.com/okigan/awscurl) tool to make a GraphQL call:

```sh
awscurl --service appsync $api_url -X POST -d '{"query": "query { hello }"}'
```

Run our test, triggering the live test by setting the `TEST_GRAPHQL_URL` environment variable:

```sh
TEST_GRAPHQL_URL=$api_url pnpm run test
```

If everything looks good, you can clean up the test stack:

```sh
make -C test-stack destroy-stack
```
