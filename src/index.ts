import type { AwsCredentialIdentity } from '@aws-sdk/types';
import { createSignedFetch } from '@scaldwell77/aws-signed-fetch';
import { GraphQLClient } from 'graphql-request';
import { omit } from 'lodash-es';

type Options = Omit<
    RequestInit & {
        awsCredentials?: AwsCredentialIdentity;
        awsRegion?: string;
    },
    'fetch'
>;

// graphql-request is stricter about typing than fetch
const transformMethod = (method?: string): 'GET' | 'POST' | undefined => {
    if (method === 'GET' || method === 'get') return 'GET';
    if (method === 'POST' || method === 'post') return 'POST';
    return undefined;
};

export const getGraphQLClient = (
    url: string,
    options?: Options
): GraphQLClient => {
    const clientOptions = omit(options, ['awsCredentials', 'awsRegion']);
    const fetch = createSignedFetch({
        service: 'appsync',
        awsCredentials: options?.awsCredentials,
        awsRegion: options?.awsRegion,
    });

    const client = new GraphQLClient(url, {
        ...clientOptions,
        method: transformMethod(clientOptions.method),
        fetch,
    });

    return client;
};
