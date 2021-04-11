import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import Header from '../../components/Header';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div>
        <h1>Carregando...</h1>
      </div>
    );
  }

  function getReadingTime() {
    //Reading time
    const words = post?.data?.content.reduce((acc, item) => {
      const heading = item.heading ?? '';

      const body = RichText.asText(item.body)
        .replace(/^\w|\s]/g, '')
        .split(' ');

      acc.push(...heading.split(' '));
      acc.push(...body);

      return acc;
    }, []);

    //humans can read in average 200 words per minutes
    const reading_time = Math.ceil(words.length / 200); // in minutes

    return reading_time;
  }

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>
      <Header />
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </div>
      <main className={commonStyles.container}>
        <article className={styles.postContainer}>
          <header>
            <h1>{post.data.title}</h1>
            <div>
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
              <div className={commonStyles.info}>
                <FiClock />
                <p>{`${getReadingTime()} min`}</p>
              </div>
            </div>
          </header>

          <div className={styles.postContent}>
            {post?.data?.content.map(content => (
              <div key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 100,
    }
  );

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: response.data,
  };

  return { props: { post }, revalidate: 60 * 30 };
};
