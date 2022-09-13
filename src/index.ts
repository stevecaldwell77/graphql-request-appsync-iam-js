import type { Credentials } from '@aws-sdk/types';
import { createSignedFetch } from '@scaldwell77/aws-signed-fetch';
import { GraphQLClient } from 'graphql-request';
import { omit } from 'lodash';

type Options = Omit<
    RequestInit & {
        awsCredentials?: Credentials;
        awsRegion?: string;
    },
    'fetch'
>;

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
    return new GraphQLClient(url, {
        ...clientOptions,
        fetch,
    });
};
