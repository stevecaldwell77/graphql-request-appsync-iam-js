# graphql-request-appsync-iam

Extension of [graphql-request](https://github.com/prisma-labs/graphql-request) that can be used to make calls to an AppSync API using IAM authorization.

## Rationale

AWS AppSync provides the ability to authenticate GraphQl requests using IAM
credentials. However, to do so you need to calculate a special signature and
include it in the request headers. This library provides a function to give you
a [graphql-request](https://github.com/prisma-labs/graphql-request) client that
will calculate and include the proper signature at request time.

## Installation

```
npm install graphql-request-appsync-iam
```

## Usage

```ts
import { getGraphQLClient } from 'graphql-request-appsync-iam';

const url =
    'https://wvMQY3gdydNyvEJaJisxLymPbb.appsync-api.us-east-1.amazonaws.com/graphql';

// client is an instance of graphql-request's GraphQLClient
const client = getGraphQLClient(url);

const query = `
    query getMovie {
        Movie(title: "Inception") {
            releaseDate
            actors {
                name
            }
        }
    }
`;
const data = await graphQLClient.request(query);
```

## Configuration

By default, the library uses the credentials and region specified in the global
`AWS.config` object. You can override these settings via the `awsCredentials`
and `awsRegion` options. You can also pass in any other options to
`GraphQLClient`'s constructor, except for `fetch`. Putting that all together:

```ts
import { getGraphQLClient } from 'graphql-request-appsync-iam';

const url =
    'https://wvMQY3gdydNyvEJaJisxLymPbb.appsync-api.us-east-1.amazonaws.com/graphql';
const client = getGraphQLClient(url, {
    awsCredentials: {
        accessKeyId: 'asdfasdfd',
        secretAccessKey: 'asdfasdfd',
        sessionToken: 'asdfasdf',
    },
    awsRegion: 'us-east-1',
    timeout: 60,
});
```
## Testing

See [HowTo: Live test of getGraphQLClient()](./test-stack/README.md).
