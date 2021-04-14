import { useEffect, useRef } from 'react';

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const commentsElement = useRef(null);

  useEffect(() => {
    const isRendered = commentsElement.current.querySelector('.utterances');

    if (isRendered) isRendered.remove();

    const script = document.createElement('script');

    script.src = 'https://utteranc.es/client.js';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.setAttribute('repo', 'monteiroVitor/ignite-chapter-III-challenge');
    script.setAttribute('issue-term', 'title');
    script.setAttribute('theme', 'github-dark');

    commentsElement.current?.appendChild(script);
  }, [postId]);

  return <section ref={commentsElement} />;
}
