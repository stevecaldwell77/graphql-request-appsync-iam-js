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
