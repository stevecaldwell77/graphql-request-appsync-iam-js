import AWS from 'aws-sdk';
import type { CredentialsOptions } from 'aws-sdk/lib/credentials';
import fetch, { Request } from 'cross-fetch';
import { GraphQLClient } from 'graphql-request';
import { omit } from 'lodash';

type Options = Omit<RequestInit & {
    awsCredentials?: AWS.Credentials | CredentialsOptions;
    awsRegion?: string;
}, 'fetch'>;

const getDefaultCredentials = () => {
    const credentials = AWS.config.credentials;
    if (!credentials) {
        throw new Error(
            'getGraphQLClient(): Failed to get credentials from AWS.config'
        );
    }

    return credentials;
};

const getDefaultRegion = () => {
    const region = AWS.config.region;
    if (!region) {
        throw new Error(
            'getGraphQLClient(): Failed to get region from AWS.config'
        );
    }

    return region;
};

const signedFetch =
    (credentials: AWS.Credentials | CredentialsOptions, region: string) =>
    async (input: RequestInfo, init?: RequestInit) => {
        const request = new Request(input, init);

        const endpoint = new AWS.Endpoint(request.url);
        const awsRequest = new AWS.HttpRequest(endpoint, region);

        const body = request.body;
        if (!body) {
            throw new Error(
                'getGraphQLClient(): Cannot sign request, missing body'
            );
        }

        awsRequest.headers.host = endpoint.host;
        awsRequest.headers['Content-Type'] = 'application/json';
        awsRequest.method = 'POST';
        awsRequest.body = body.toString();

        const signer = new AWS.Signers.V4(awsRequest, 'appsync');
        signer.addAuthorization(credentials);

        const signedRequest = new Request(endpoint.href, {
            method: awsRequest.method,
            body: request.body,
            headers: awsRequest.headers,
        });

        return fetch(signedRequest);
    };

export const getGraphQLClient = (url: string, options?: Options) => {
    const clientOptions = omit(options, ['awsCredentials', 'awsRegion']);
    const credentials = options?.awsCredentials || getDefaultCredentials();
    const region = options?.awsRegion || getDefaultRegion();
    return new GraphQLClient(url, {
        ...clientOptions,
        fetch: signedFetch(credentials, region),
    });
};
