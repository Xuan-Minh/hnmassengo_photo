'use client';
/* eslint-disable react-doctor/iframe-missing-sandbox */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import WindowsTab from './WindowsTab';
import WindowsManager from './WindowsManager';
import { HOME_FALLBACK_IMAGES } from '../../lib/constants';
import client from '../../lib/sanity.client';
import { useSanityImages, useIsMobile } from '../../lib/hooks';
import {
  extractIdYoutube,
  calculateAge,
  portableTextToPlain,
} from '../../lib/utils';
import { buildSanityImageUrl } from '../../lib/imageUtils';

// ==========================================
// VARIABLES GLOBALES & UTILITAIRES
// ==========================================

const dateFormatter = new Intl.DateTimeFormat('en-EN', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const teamColorsFALLBACK = ['#BB3430', '#44724B', '#FED52A', '#FFFFFF'];

async function getGlobalLastUpdate() {
  try {
    const query = `*[!(_id in path("_.**"))] | order(_updatedAt desc)[0]._updatedAt`;
    const lastUpdateDate = await client.fetch(query);

    if (!lastUpdateDate) return null;

    const date = new Date(lastUpdateDate);
    return dateFormatter.format(date);
  } catch (error) {
    console.error('Erreur lors de la récupération de la date:', error);
    return null;
  }
}

function localizeField(value, locale, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value?.[locale] || value?.fr || value?.en || value?.de || fallback;
}

// ==========================================
// SOUS-COMPOSANT : GESTION D'UNE FENÊTRE
// ==========================================

function WindowItem({ win, index, totalWindows, locale, lastSeen, heroImage }) {
  const originalIndex = win._originalIndex;
  const titre = localizeField(win.title, locale, 'Fenêtre');
  const couleur =
    win.windowColor?.colorValue?.hex || teamColorsFALLBACK[originalIndex % 4];
  const id = win._key || `tab${originalIndex}`;

  // -- Calcul des Positions --
  const cols = Math.ceil(Math.sqrt(totalWindows));
  const rows = Math.ceil(totalWindows / cols);
  const col = index % cols;
  const row = Math.floor(index / cols);

  const leftPos =
    typeof win.positionX === 'number'
      ? `${win.positionX}vw`
      : `${col * (90 / cols) + 5}vw`;

  const topPos =
    typeof win.positionY === 'number'
      ? `${win.positionY}vh`
      : `${row * (80 / rows) + 5}vh`;

  const windowStyle = useMemo(
    () => ({ top: topPos, left: leftPos }),
    [topPos, leftPos]
  );

  // -- Calcul des Dimensions --
  let baseWidth = 30;
  if (win.windowSize === 'small') baseWidth = 20;
  if (win.windowSize === 'large') baseWidth = 40;

  let width = `${baseWidth}vw`;
  let height = `${baseWidth * 0.66}vw`;

  if (win.windowOrientation === 'portrait') {
    width = `${baseWidth * 0.66}vw`;
    height = `${baseWidth}vw`;
  } else if (win.windowOrientation === 'square') {
    width = `${baseWidth * 0.8}vw`;
    height = `${baseWidth * 0.8}vw`;
  }

  // -- Rendu du contenu via useMemo (corrige le re-render massif des props JSX) --
  const windowContent = useMemo(() => {
    switch (win._type) {
      case 'windowBio': {
        const occupation = localizeField(
          win.occupation,
          locale,
          'Soccer / Photographer'
        );
        return (
          <div
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              justifyContent: 'space-between',
              gap: '1rem',
              width: '45vw',
              zIndex: '50',
            }}
          >
            <div className="w-[38%] h-auto inline-block">
              {win.photo ? (
                <Image
                  src={buildSanityImageUrl(win.photo)}
                  alt="Portrait Bio"
                  width={400}
                  height={400}
                  className="w-full h-auto object-cover rounded-md"
                />
              ) : (
                heroImage && (
                  <Image
                    src={heroImage}
                    alt="Portrait par défaut"
                    width={400}
                    height={400}
                    className="w-full h-auto object-cover rounded-md"
                  />
                )
              )}
            </div>
            <div className="p-4 w-[60%] h-auto flex">
              <ul className="list-disc list-inside flex justify-around flex-col text-[18px] md:text-[16px] lg:text-[16px] xl:text-[18px] 2xl:text-[20px] font-bold">
                <li>Name : {win.name || 'Han-Noah MASSENGO'}</li>
                <li>Age : {calculateAge()} ans</li>
                <li>Location : {win.location || 'Augsbourg / Paris '} 📌</li>
                <li>Occupation : {occupation}</li>
                <li>Last seen : {lastSeen}</li>
              </ul>
            </div>
          </div>
        );
      }

      case 'windowMusic': {
        const rawUrl =
          win.spotifyUrl ||
          'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M';
        let finalUrl = rawUrl;

        try {
          const parsed = new URL(rawUrl);
          const match = parsed.pathname.match(
            /(track|album|playlist|artist|show|episode)\/([a-zA-Z0-9]+)/
          );

          if (match && !rawUrl.includes('/embed/')) {
            const type = match[1];
            const idTrack = match[2];
            finalUrl = `https://open.spotify.com/embed/${type}/${idTrack}`; // Lien Spotify corrigé et propre
          }
        } catch (e) {
          console.error('Lien Spotify invalide');
        }

        return (
          <iframe
            className="w-[30vw] h-[152px] rounded-md"
            src={finalUrl}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify music player"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          ></iframe>
        );
      }

      case 'windowVideo': {
        const videoId = extractIdYoutube(win.content);
        return videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            style={{ width: '26vw', height: '15vw', borderRadius: '0.375rem' }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
          ></iframe>
        ) : (
          <div className="w-[26vw] h-[15vw] flex items-center justify-center bg-gray-200">
            Vidéo indisponible
          </div>
        );
      }

      case 'windowText': {
        const rawBlocks = localizeField(win.content, locale, []);
        const plainText = portableTextToPlain(rawBlocks);

        return (
          <p className="w-[30vw] h-[20vw] bg-current/15 overflow-scroll-y whitespace-pre-line font-liberation italic leading-[1.3] text-blackCustom text-[18px] md:text-[16px] lg:text-[16px] xl:text-[18px] 2xl:text-[20px]">
            {plainText}
          </p>
        );
      }

      case 'windowImage': {
        const imageUrl = win.photo ? buildSanityImageUrl(win.photo) : heroImage;
        const imageComponent = imageUrl ? (
          <Image
            src={imageUrl}
            alt={titre}
            width={800}
            height={800}
            className="w-full h-full object-cover rounded-md block"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-black rounded-md">
            Image indisponible
          </div>
        );

        return (
          <div
            className="flex items-center justify-center p-0 m-0"
            style={{ width, height }}
          >
            {win.externalLink ? (
              <a
                href={win.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full block hover:opacity-90 transition-opacity"
              >
                {imageComponent}
              </a>
            ) : (
              <div className="w-full h-full block">{imageComponent}</div>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  }, [win, locale, lastSeen, heroImage, width, height, titre]);

  return (
    <WindowsTab
      id={id}
      titre={titre}
      couleur={couleur}
      style={windowStyle}
      contenu={windowContent}
    />
  );
}

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

export default function HomePageTabs() {
  const { locale = 'fr' } = useParams();
  const [lastSeen, setLastSeen] = useState('...');
  const [windows, setWindows] = useState([]);
  const isMobile = useIsMobile(1024);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const windowsData = await client.fetch(`
          *[_type == "homePage"][0].windows[]{
            ...,
            windowColor->
          }
        `);
        if (!cancelled && windowsData) {
          setWindows(windowsData);
        }
      } catch (err) {
        console.error('Erreur de fetch', err);
      }

      const dateFormatee = await getGlobalLastUpdate();
      if (!cancelled && dateFormatee) {
        setLastSeen(dateFormatee);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const isProduction = process.env.NODE_ENV === 'production';
  const homeImages = useSanityImages('homeSectionImage', HOME_FALLBACK_IMAGES, {
    width: isProduction ? 900 : 1200,
    quality: isProduction ? 55 : 70,
    dpr: 1,
  });
  const heroImage = homeImages[0] || '';

  // Sauvegarde l'index original avant de trier
  const windowsWithIndex = useMemo(() => {
    return windows.map((w, i) => ({ ...w, _originalIndex: i }));
  }, [windows]);

  // Utilisation de .toSorted() optimisé
  const orderedWindows = useMemo(() => {
    return windowsWithIndex.toSorted((a, b) => {
      const aPriority = a.startsOnTop ? 1 : 0;
      const bPriority = b.startsOnTop ? 1 : 0;
      return aPriority - bPriority;
    });
  }, [windowsWithIndex]);

  if (!windows || windows.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center text-white bg-blackCustom">
        Chargement des fenêtres...
      </div>
    );
  }
  if (isMobile) {
    return (
      <section className="w-full h-full flex flex-col gap-4 p-4 mt-20 bg-red-900"></section> // {orderedWindows.map(win => (<MobileWindowCard key={win._id} win={win} ))}/>
    );
  }

  return (
    <WindowsManager>
      {orderedWindows.map((win, index) => (
        <WindowItem
          key={win._key || `tab${win._originalIndex}`}
          win={win}
          index={index}
          totalWindows={windows.length}
          locale={locale}
          lastSeen={lastSeen}
          heroImage={heroImage}
        />
      ))}
    </WindowsManager>
  );
}
