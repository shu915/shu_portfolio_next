import { HttpLink } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from "@apollo/client-integration-nextjs";

const wordpressGraphqlUrl = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;

if (!wordpressGraphqlUrl) {
  throw new Error(
    "NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL が環境変数に設定されていません"
  );
}

/**
 * Server Components 向けのシングルトン Apollo Client
 * registerApolloClient により、RSC ごとにリクエストスコープが分離される
 */
export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: wordpressGraphqlUrl,
    }),
  });
});
