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

function WindowItem({
  win,
  index,
  totalWindows,
  locale,
  lastSeen,
  heroImage,
  ...props
}) {
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
  let baseWidth = 25;
  if (win.windowSize === 'small') baseWidth = 18;
  if (win.windowSize === 'large') baseWidth = 35;

  let width = `clamp(180px, ${baseWidth}vw, 500px)`;
  let aspectRatio = '1 / 0.66'; // Ratio Paysage par défaut

  if (win.windowOrientation === 'portrait') {
    width = `clamp(140px, ${baseWidth * 0.66}vw, 350px)`;
    aspectRatio = '0.66 / 1'; // Ratio Portrait
  } else if (win.windowOrientation === 'square') {
    width = `clamp(200px, ${baseWidth * 0.8}vw, 400px)`;
    aspectRatio = '1 / 1'; // Ratio Carré parfait
  }

  const windowContent = useMemo(() => {
    switch (win._type) {
      case 'windowBio': {
        const occupation = localizeField(
          win.occupation,
          locale,
          'Soccer / Photographer'
        );
        return (
          <div className="z-50 flex flex-nowrap justify-between gap-4 w-[90vw] md:w-[50vw] lg:w-[45vw]">
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
            className="h-[152px] rounded-md w-[35vw] md:w-[40vw] lg:w-[30vw]"
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
            style={{ borderRadius: '0.375rem' }}
            className="rounded-md w-[85vw] md:w-[40vw] lg:w-[26vw] aspect-video"
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
          <p className="bg-current/15 overflow-scroll-y whitespace-pre-line font-liberation italic leading-[1.3] text-blackCustom text-[18px] 2xl:text-[20px] w-[85vw] md:w-[35vw] lg:w-[30vw] h-[30vh] lg:h-[20vw]">
            {plainText}
          </p>
        );
      }

      case 'windowImage': {
        const imageUrl = win.photo ? buildSanityImageUrl(win.photo) : heroImage;
        const interactiveImageClasses = win.externalLink
          ? 'cursor-pointer hover:opacity-90 transition-opacity active:cursor-pointer'
          : '';
        const imageComponent = imageUrl ? (
          <Image
            src={imageUrl}
            alt={titre}
            width={800}
            height={800}
            className={`w-full h-full object-cover rounded-md block ${interactiveImageClasses}`}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-black rounded-md">
            Image indisponible
          </div>
        );

        return (
          <div
            className="flex items-center justify-center p-0 m-0 w-full"
            style={{
              width: width,
              height: 'auto', // Laisse le ratio calculer la hauteur
              aspectRatio: aspectRatio, // Maintient la forme (carré, portrait, etc.)
              minWidth: '100%', // Force l'image à remplir l'espace si le titre est très long
            }}
          >
            {win.externalLink ? (
              <a
                href={win.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full block hover:opacity-90 transition-opacity cursor-pointer active:cursor-pointer"
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
  }, [win, locale, lastSeen, heroImage, width, aspectRatio, titre]);

  return (
    <WindowsTab
      id={id}
      titre={titre}
      couleur={couleur}
      style={windowStyle}
      contenu={windowContent}
      {...props}
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
  const isMobile = useIsMobile(768);

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
      <div className="flex h-screen w-screen items-center justify-center text-whiteCustom bg-blackCustom">
        Chargement des fenêtres...
      </div>
    );
  }
  if (isMobile) {
    // 1. Extraction des fenêtres spécifiques
    const bioWin = orderedWindows.find(w => w._type === 'windowBio');
    const textWin = orderedWindows.find(w => w._type === 'windowText');
    const imageWin = orderedWindows.find(w => w._type === 'windowImage');
    const videoWin = orderedWindows.find(w => w._type === 'windowVideo'); // <-- Remplacement ici

    // 2. Fonction utilitaire pour récupérer la bonne couleur (Sanity ou Fallback)
    const getTabColor = win => {
      if (!win) return '#000000';
      return (
        win.windowColor?.colorValue?.hex ||
        teamColorsFALLBACK[win._originalIndex % 4]
      );
    };

    return (
      <section
        id="home"
        className="grid grid-cols-2 place-content-center h-screen p-2 gap-2 md:gap-4 lg:gap-6 w-screen bg-background"
      >
        {/* --- CARTE 1 : BIO --- */}
        {bioWin && (
          <div className="flex col-span-2 w-full h-fit flex-col text-white gap-1 shadow-lg">
            <div
              className="flex items-center justify-between border border-black gap-2 p-2 cursor-grab active:cursor-grabbing rounded-t-md"
              style={{ backgroundColor: getTabColor(bioWin) }}
            >
              <h3 className="text-md font-bold px-2">
                {bioWin.name || 'Han-Noah MASSENGO'}
              </h3>
            </div>

            <div className="border border-black bg-background flex rounded-b-md overflow-hidden">
              <div className="w-[40%] flex-shrink-0 border-r border-blackCustom/20 flex items-center">
                <Image
                  src={
                    bioWin.photo ? buildSanityImageUrl(bioWin.photo) : heroImage
                  }
                  alt="Portrait"
                  width={400}
                  height={400}
                  className="w-full h-auto rounded-bl-md"
                />
              </div>

              {/* Colonne Texte */}
              <div className="text-blackCustom p-3 flex flex-col justify-center w-[60%]">
                <ul className="flex flex-col gap-2 text-[14px] ">
                  <li>Age : {calculateAge()} ans</li>
                  <li className="truncate">{bioWin.location || 'Paris'} 📌</li>
                  <li className="break-words leading-snug">
                    {' '}
                    {localizeField(bioWin.occupation, locale, 'Soccer')}
                  </li>
                  <li>Last seen : {lastSeen}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* --- CARTE 2 : TEXTE --- */}
        {textWin && (
          <div className="flex col-span-2 w-full h-[25vh] flex-col text-white gap-1 shadow-lg">
            <div
              className="flex items-center justify-between border border-black gap-2 p-2 cursor-grab active:cursor-grabbing rounded-t-md"
              style={{ backgroundColor: getTabColor(textWin) }}
            >
              <h3 className="text-md font-bold px-2">
                {localizeField(textWin.title, locale, 'Histoire')}
              </h3>
            </div>
            <div className="p-2 border border-black bg-background flex rounded-b-md overflow-scroll preserve-lines whitespace-pre-line">
              <p className="text-blackCustom text-sm">
                {portableTextToPlain(
                  localizeField(textWin.content, locale, [])
                )}
              </p>
            </div>
          </div>
        )}

        {/* --- CARTE 3 : IMAGE --- */}
        {imageWin && (
          <div className="flex col-span-1 w-full h-full flex-col text-white gap-1 shadow-lg">
            <div
              className="flex items-center justify-between border border-black gap-2 p-2 cursor-grab active:cursor-grabbing rounded-t-md"
              style={{ backgroundColor: getTabColor(imageWin) }}
            >
              <h3 className="text-sm font-bold px-2 truncate">
                {localizeField(imageWin.title, locale, 'Galerie')}
              </h3>
            </div>
            <div className="p-2 border border-black bg-background flex rounded-b-md h-full">
              <Image
                src={
                  imageWin.photo
                    ? buildSanityImageUrl(imageWin.photo)
                    : heroImage
                }
                alt="Image mobile"
                width={400}
                height={400}
                className="w-full h-full object-cover aspect-square"
              />
            </div>
          </div>
        )}

        {/* --- CARTE 4 : VIDEO (YOUTUBE) --- */}
        {videoWin && (
          <div className="flex col-span-1 w-full h-full flex-col text-white gap-1 shadow-lg">
            <div
              className="flex items-center justify-between border border-black gap-2 p-2 cursor-grab active:cursor-grabbing rounded-t-md"
              style={{ backgroundColor: getTabColor(videoWin) }}
            >
              <h3 className="text-sm font-bold px-2 truncate">
                {localizeField(videoWin.title, locale, 'Vidéo')}
              </h3>
            </div>
            <div className="p-2 border border-black bg-background flex rounded-b-md h-full items-center justify-center aspect-square">
              {extractIdYoutube(videoWin.content) ? (
                <iframe
                  className="w-full aspect-square rounded-sm"
                  src={`https://www.youtube.com/embed/${extractIdYoutube(videoWin.content)}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
                ></iframe>
              ) : (
                <div className="text-blackCustom text-xs text-center w-full">
                  Vidéo indisponible
                </div>
              )}
            </div>
          </div>
        )}
      </section>
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
