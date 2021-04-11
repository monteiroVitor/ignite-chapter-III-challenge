import { useState } from 'react';
import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import Head from 'next/head';
import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function getNextPage() {
    const response = await fetch(nextPage).then(data => data.json());

    const newPosts = response.results.map((post: Post) => {
      return {
        uid: post.uid,
        data: post.data,
        first_publication_date: post.first_publication_date,
      };
    });

    setPosts([...posts, ...newPosts]);
    setNextPage(response.next_page);
  }

  return (
    <>
      <Head>
        <title> Home | spacetraveling</title>
      </Head>
      <Header />
      <main className={commonStyles.container}>
        {posts.map(post => (
          <div className={styles.post} key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
              </a>
            </Link>
            <p>{post.data.subtitle}</p>
            <div className={styles.infoContainer}>
              <div className={commonStyles.info}>
                <FiCalendar />
                <time>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
              </div>
              <div className={commonStyles.info}>
                <FiUser />
                <p>{post.data.author}</p>
              </div>
            </div>
          </div>
        ))}

        {nextPage && (
          <div className={styles.loadMorePosts}>
            <button type="button" onClick={getNextPage}>
              Carregar mais posts
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    { fetch: ['posts.title', 'posts.subtitle', 'posts.author'], pageSize: 1 }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: post.data,
      first_publication_date: post.first_publication_date,
    };
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
