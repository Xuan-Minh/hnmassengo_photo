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
import { AnimatePresence, m } from 'framer-motion';
import CustomLightbox from '../gallery/cartel/CustomLightbox';
import { createPortal } from 'react-dom';

// ==========================================
// VARIABLES GLOBALES & UTILITAIRES
// ==========================================

const teamColorsFALLBACK = ['#BB3430', '#44724B', '#FED52A', '#FFFFFF'];

async function getGlobalLastUpdate() {
  try {
    const query = `*[!(_id in path("_.**"))] | order(_updatedAt desc)[0]._updatedAt`;
    const lastUpdateDate = await client.fetch(query);

    if (!lastUpdateDate) return null;

    const date = new Date(lastUpdateDate);
    const utcDateOnly = date.toUTCString().split(' ').slice(0, 4).join(' ');

    return utcDateOnly;
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
// SOUS-COMPOSANTS CARROUSELS
// ==========================================

const ArrowLeft = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ArrowRight = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

function ImageFolderCarousel({ images, titre, heroImage }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Évite les erreurs côté serveur avec createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="w-[85vw] md:w-[40vw] lg:w-[25vw] p-4 flex items-center justify-center text-black rounded-md bg-gray-200">
        Aucune image disponible
      </div>
    );
  }

  const handlePrev = e => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = e => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openLightbox = (idx, e) => {
    e.stopPropagation();
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="relative w-[85vw] md:w-[40vw] lg:w-[20vw] h-auto rounded-md overflow-hidden group bg-blackCustom/5">
        <AnimatePresence initial={false} mode="wait">
          {images.map((img, idx) => {
            if (idx !== currentIndex) return null; // On ne rend que l'image active

            const imageUrl = img ? buildSanityImageUrl(img) : heroImage;

            return (
              <m.div
                key={idx} // La clé est cruciale pour que Motion détecte le changement
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }} // Durée et courbe de fluidité
                className="w-full h-auto cursor-pointer "
                onClick={e => openLightbox(idx, e)}
              >
                <Image
                  src={imageUrl}
                  alt={`${titre} - Image ${idx + 1}`}
                  width={1000}
                  height={1000}
                  className="w-full h-auto object-contain hover:opacity-50 transition-opacity active:cursor-pointing"
                />
              </m.div>
            );
          })}
        </AnimatePresence>

        {/* CONTRÔLES */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/80 transition-all duration-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-20 shadow-md cursor-pointer"
            >
              <ArrowLeft />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/80 transition-all duration-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-20 shadow-md cursor-pointer"
            >
              <ArrowRight />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ease-in-out ${
                    idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {/* LIGHTBOX EN PORTAL */}
      {mounted &&
        lightboxOpen &&
        createPortal(
          <CustomLightbox
            open={lightboxOpen}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
            images={images}
            project={{ name: titre }} // Évite les crashs si la lightbox attend "project.name"
          />,
          document.body
        )}
    </>
  );
}
function MusicPlaylistCarousel({ rawUrls }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const finalUrls = useMemo(() => {
    return (rawUrls || []).map(rawUrl => {
      let finalUrl = rawUrl;
      try {
        const parsed = new URL(rawUrl);
        const match = parsed.pathname.match(
          /(track|album|playlist|artist|show|episode)\/([a-zA-Z0-9]+)/
        );
        if (match && !rawUrl.includes('/embed/')) {
          finalUrl = `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
        }
      } catch (e) {
        console.error('Lien Spotify invalide');
      }
      return finalUrl;
    });
  }, [rawUrls]);

  if (finalUrls.length === 0) {
    return <p className="text-blackCustom">Aucune playlist disponible.</p>;
  }

  const handlePrev = e => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? finalUrls.length - 1 : prev - 1));
  };

  const handleNext = e => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === finalUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-[85vw] md:w-[40vw] lg:w-[19vw] h-[152px] group rounded-md overflow-hidden bg-blackCustom/5">
      <div
        className="flex w-full h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {finalUrls.map((url, idx) => (
          <div key={idx} className="w-full shrink-0 h-full">
            <iframe
              className="w-full h-full"
              src={url}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={`Spotify music player ${idx + 1}`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            ></iframe>
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {finalUrls.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ease-in-out ${
              idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* CONTRÔLES */}
      {finalUrls.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-md text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/80 transition-all duration-300 ease-in-out opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-10 shadow-md cursor-pointer active:cursor-pointing"
          >
            <ArrowLeft />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-md text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/80 transition-all duration-300 ease-in-out opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-10 shadow-md cursor-pointer active:cursor-pointing"
          >
            <ArrowRight />
          </button>
        </>
      )}
    </div>
  );
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
  if (win.windowSize === 'small') baseWidth = 18.25;
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
          <div className="z-50 flex flex-nowrap justify-around gap-2 w-[90vw] md:w-[40vw] lg:w-[25vw] 2xl:w-[30vw]">
            <div className="w-[30%] h-auto inline-block">
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
            <div className=" w-[60%] h-auto flex">
              <ul className=" flex justify-around flex-col text-[18px] md:text-[16px] lg:text-[13px] xl:text-[13px] 2xl:text-[14px] font-bold">
                <li>Name : {win.name || 'Han-Noah MASSENGO'}</li>
                <li>Age : {calculateAge()} ans</li>
                <li>Location : {win.location || 'Augsbourg / Paris '} 📌</li>
                <li>Occupation : {occupation}</li>
                <li>Connected : {lastSeen}</li>
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
            className="h-[152px] rounded-md w-[35vw] md:w-[40vw] lg:w-[35vw]"
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
            style={{ Radius: '0.375rem' }}
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
          <p className="bg-current/15 overflow-scroll-y whitespace-pre-line font-liberation italic leading-[1.3] text-blackCustom text-[16px] 2xl:text-[18px] w-[85vw] md:w-[35vw] lg:w-[35vw] xl:w-[40vw] h-[30vh] lg:h-[35vw] xl:h-[30vw] 2xl:h-[25vw]">
            {plainText}
          </p>
        );
      }
      case 'windowRecommandation': {
        const reco = win.recommandation || [];
        return (
          <div className="flex flex-col gap-2 w-[85vw] md:w-[40vw] lg:w-[30vw]">
            <ul className="list-disc list-inside text-[14px] 2xl:text-[18px] text-blackCustom">
              {reco.length > 0 ? (
                reco.map((rec, idx) => (
                  <a
                    key={idx}
                    href={rec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline underline-offset-2 break-all cursor-pointer active:cursor-pointing"
                  >
                    <li>{rec.title || rec.url}</li>
                  </a>
                ))
              ) : (
                <p className="text-blackCustom">
                  Aucune recommandation disponible.
                </p>
              )}
            </ul>
          </div>
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
      case 'windowMusicPlaylist': {
        return <MusicPlaylistCarousel rawUrls={win.spotifyUrlFolder} />;
      }

      case 'windowImageFolder': {
        return (
          <ImageFolderCarousel
            images={win.imageFolder}
            titre={titre}
            heroImage={heroImage}
            width={width}
            aspectRatio={aspectRatio}
          />
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
    const imageWin = orderedWindows.find(
      w => w._type === 'windowImage' || w._type === 'windowImageFolder'
    );
    const musicWin = orderedWindows.find(
      w => w._type === 'windowMusic' || w._type === 'windowMusicPlaylist'
    );
    // Puis gère l'affichage en conséquence dans ton JSX mobile.
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
              className="flex items-center justify-between  -black gap-2 p-2 cursor-grab active:cursor-grabbing rounded-t-md"
              style={{ backgroundColor: getTabColor(bioWin) }}
            >
              <h3 className="text-md font-bold px-2">
                {bioWin.name || 'Han-Noah MASSENGO'}
              </h3>
            </div>

            <div className=" -black bg-background flex rounded-b-md overflow-hidden">
              <div className="w-[40%] flex-shrink-0 -r border-blackCustom/20 flex items-center">
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
