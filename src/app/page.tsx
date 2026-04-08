import { gql } from "@apollo/client";
import { query } from "@/lib/apollo-client";

const GET_POSTS = gql`
  query GetPosts {
    posts(first: 5) {
      nodes {
        id
        title
        slug
        date
        excerpt
      }
    }
  }
`;

type Post = {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
};

export default async function Home() {
  const { data } = await query<{ posts: { nodes: Post[] } }>({
    query: GET_POSTS,
  });

  const posts = data?.posts.nodes ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-8">最新投稿</h1>
      <ul className="flex flex-col gap-6">
        {posts.map((post) => (
          <li key={post.id} className="border-b pb-6">
            <p className="text-sm text-zinc-400 mb-1">
              {new Date(post.date).toLocaleDateString("ja-JP")}
            </p>
            <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
            <div
              className="text-zinc-600 text-sm"
              dangerouslySetInnerHTML={{ __html: post.excerpt }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
