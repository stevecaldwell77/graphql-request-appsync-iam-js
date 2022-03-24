import { Sha256 } from '@aws-crypto/sha256-js';
import {
    NODE_REGION_CONFIG_FILE_OPTIONS,
    NODE_REGION_CONFIG_OPTIONS,
} from '@aws-sdk/config-resolver';
import { defaultProvider as defaultCredentialProvider } from '@aws-sdk/credential-provider-node';
import { loadConfig } from '@aws-sdk/node-config-provider';
import { HttpRequest as AwsHttpRequest } from '@aws-sdk/protocol-http';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import type { CredentialProvider, Credentials, Provider } from '@aws-sdk/types';
import { parseUrl } from '@aws-sdk/url-parser';
import fetch, { Request } from 'cross-fetch';
import { GraphQLClient } from 'graphql-request';
import { omit } from 'lodash';

type Options = Omit<
    RequestInit & {
        awsCredentials?: Credentials;
        awsRegion?: string;
    },
    'fetch'
>;

type SignArguments = {
    regionProvider: Provider<string>;
    credentialProvider: CredentialProvider;
    date?: Date;
};

const getCredentialProvider = (credentials?: Credentials) =>
    credentials ? async () => credentials : defaultCredentialProvider();

const getRegionProvider = (region?: string) =>
    region
        ? async () => region
        : loadConfig(
              NODE_REGION_CONFIG_OPTIONS,
              NODE_REGION_CONFIG_FILE_OPTIONS
          );

const transformHeaders = (request: Request) => {
    const newHeaders: AwsHttpRequest['headers'] = {};
    const excludeHeaders = new Set(['host', 'content-type']);
    request.headers.forEach((value, key) => {
        if (excludeHeaders.has(key)) return;
        newHeaders[key] = value;
    });
    newHeaders['content-type'] = 'application/json';
    newHeaders.host = new URL(request.url).host;
    return newHeaders;
};

const buildAwsRequest = (request: Request) =>
    new AwsHttpRequest({
        ...parseUrl(request.url),
        method: 'POST',
        headers: transformHeaders(request),
        body: request.body,
    });

const signAwsRequest = async (
    request: AwsHttpRequest,
    signArgs: SignArguments
) => {
    const [region, credentials] = await Promise.all([
        signArgs.regionProvider(),
        signArgs.credentialProvider(),
    ]);
    const signer = new SignatureV4({
        service: 'appsync',
        region,
        sha256: Sha256,
        credentials,
    });
    const signedRequest = await signer.sign(request, {
        signingDate: signArgs.date,
    });
    return signedRequest;
};

const getSignedHeaders = async (request: Request, signArgs: SignArguments) => {
    const awsRequest = buildAwsRequest(request);
    const signedAwsRequest = await signAwsRequest(awsRequest, signArgs);
    return signedAwsRequest.headers;
};

export const signRequest = async (
    request: Request,
    signArgs: SignArguments
): Promise<Request> => {
    const signedHeaders = await getSignedHeaders(request, signArgs);
    const signedRequest = new Request(request.url, {
        method: request.method,
        body: request.body,
        headers: signedHeaders,
    });
    return signedRequest;
};

const signedFetch =
    (
        credentialProvider: CredentialProvider,
        regionProvider: Provider<string>
    ) =>
    async (input: RequestInfo, init?: RequestInit) => {
        const request = new Request(input, init);
        const signedRequest = await signRequest(request, {
            regionProvider,
            credentialProvider,
        });
        return fetch(signedRequest);
    };

export const getGraphQLClient = (
    url: string,
    options?: Options
): GraphQLClient => {
    const clientOptions = omit(options, ['awsCredentials', 'awsRegion']);
    const credentialProvider = getCredentialProvider(options?.awsCredentials);
    const regionProvider = getRegionProvider(options?.awsRegion);
    return new GraphQLClient(url, {
        ...clientOptions,
        fetch: signedFetch(credentialProvider, regionProvider),
    });
};
