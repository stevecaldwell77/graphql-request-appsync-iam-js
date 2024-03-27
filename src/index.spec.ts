import test from 'ava';

import { getGraphQLClient } from './';

test('getGraphQLClient()', (t) => {
    const client = getGraphQLClient('https://foo.com', {
        awsCredentials: {
            /* spell-checker: disable */
            accessKeyId: 'asdfasdfafds',
            secretAccessKey: 'asdfasdfafds',
            /* spell-checker: enable */
        },
        awsRegion: 'us-east-1',
    });

    t.truthy(client, 'client returned');
});

test('test live API', async (t) => {
    const apiUrl = process.env.TEST_GRAPHQL_URL;
    if (!apiUrl) {
        t.log(
            'No TEST_GRAPHQL_URL environment variable set, skipping test',
        );
        t.pass();
        return;
    }

    const query = /* GraphQL */ `query { hello }`;

    const client = getGraphQLClient(apiUrl);

    const response = await client.request(query);
    t.deepEqual(response, { hello: 'Hello, world!' }, 'response matches expected');
});
