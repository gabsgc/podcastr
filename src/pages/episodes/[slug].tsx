import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { convertDurationToTimeString } from '../../utils/convertDurationToTImeString';

import { api } from '../../services/api';
import { usePlayer } from '../../contexts/PlayerContext';

import styles from './episode.module.scss';


type Episode = {
    id: string;
    title: string;
    thumbnail: string;
    members: string;
    duration: number;
    description: string;
    durationAsString: string;
    publishedAt: string;
    url: string;
}

type EpisodeProps = {
    episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
    const { play } = usePlayer();

    return (
        <div className={styles.episodeContainer}>
            <div className={styles.episode}>
                <Head>
                    <title>{episode.title}</title>
                </Head>
                <div className={styles.thumbnailContainer}>
                    <Link href="/">
                        <button type="button">
                            <img src="/arrow-left.svg" alt="Voltar" />
                        </button>
                    </Link>
                    <Image
                        width={700}
                        height={160}
                        src={episode.thumbnail}
                        objectFit="cover"
                    />
                    <button type="button" onClick={() => play(episode)}>
                        <img src="/play.svg" alt="Tocar episódio" />
                    </button>
                </div>
                <header>
                    <h1>{episode.title}</h1>
                    <span>{episode.members}</span>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                </header>
                <div
                    className={styles.description}
                    dangerouslySetInnerHTML={{ __html: episode.description }}
                />
            </div>
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const { data } = await api.get('episodes', {
        params: {
            _limit: 2,
            _sort: 'published_at',
            _order: 'desc'
        }
    })

    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })

    return {
        paths,
        fallback: 'blocking'
        //increment static regeneration (gerar página no momento que as pessoas acessam)
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
    const { slug } = ctx.params; //nome da const igual nome do arquivo

    const { data } = await api.get(`/episodes/${slug}`)

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        description: data.description,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        url: data.file.url,
    }

    return {
        props: {
            episode,
        },
        revalidate: 60 * 60 * 24 //24 horas
    }

}
