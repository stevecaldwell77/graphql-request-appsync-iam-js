# graphql-request-appsync-iam

Extension of graphql-request that can be used to make calls to an AppSync API using IAM authorization.

## Rationale

AWS AppSync provides the ability to authenticate GraphQl request using IAM
credentials. However, to do so you need to calculate a request signature and
include it in the headers of the request. This library enhances the
[graphql-request](https://github.com/prisma-labs/graphql-request) library to
include the proper signature.

## Installation

```
npm install graphql-request-appsync-iam
```

## Usage

```ts
import { getGraphQLClient } from 'graphql-request-appsync-iam'

const url = 'https://wvMQY3gdydNyvEJaJisxLymPbb.appsync-api.us-east-1.amazonaws.com/graphql';

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
`
const data = await graphQLClient.request(query)
```

## Configuration

By default, the library uses the credentials and region specified in the global
`AWS.config` object. You can override via the `awsCredentials` and `awsRegion`
options. You can also pass in any other options to `GraphQLClient`'s
constructor, except for `fetch`. Putting that all together:

```ts
import { GraphQLClient } from 'graphql-request-appsync-iam'

const url = 'https://wvMQY3gdydNyvEJaJisxLymPbb.appsync-api.us-east-1.amazonaws.com/graphql';
const client = getGraphQLClient(url, {
    awsCredentials: {
        /* spell-checker: disable */
        accessKeyId: 'asdfasdfd',
        secretAccessKey: 'asdfasdfd',
        sessionToken: 'asdfasdf',
        /* spell-checker: enable */
    },
    awsRegion: 'us-east-1',
    timeout: 60,
});
