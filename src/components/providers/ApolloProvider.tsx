"use client";

import { HttpLink } from "@apollo/client";
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";

const wordpressGraphqlUrl = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;

if (!wordpressGraphqlUrl) {
  throw new Error(
    "NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL が環境変数に設定されていません"
  );
}
function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: wordpressGraphqlUrl,
    }),
  });
}

/**
 * Client Components で Apollo hooks（useQuery等）を使うための Provider
 * layout.tsx で全体をラップする
 */
export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
