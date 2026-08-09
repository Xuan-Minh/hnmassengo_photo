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
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full p-4 flex items-center justify-center text-blackCustom rounded-md bg-gray-200">
        Aucune image disponible
      </div>
    );
  }

  const handleTouchStart = e => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = e => {
    if (touchStartX === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Si on a glissé de plus de 50 pixels vers la gauche
    if (diff > 50) {
      setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }
    // Si on a glissé de plus de 50 pixels vers la droite
    else if (diff < -50) {
      setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    }

    setTouchStartX(null); // On réinitialise
  };

  const openLightbox = (idx, e) => {
    e.stopPropagation();
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <>
      <div
        className="relative w-full h-full rounded-md overflow-hidden group bg-blackCustom/5"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex w-full h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((img, idx) => {
            const imageUrl = img ? buildSanityImageUrl(img) : heroImage;

            return (
              <div
                key={idx}
                className="w-full h-full shrink-0 relative cursor-pointer"
                onClick={e => openLightbox(idx, e)}
              >
                <Image
                  src={imageUrl}
                  alt={`${titre} - Image ${idx + 1}`}
                  fill
                  className="object-cover hover:opacity-50 transition-opacity active:cursor-pointing"
                />
              </div>
            );
          })}
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-none">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ease-in-out ${
                  idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {mounted &&
        createPortal(
          <CustomLightbox
            open={lightboxOpen}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
            images={images}
            project={{ name: titre }}
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
    <div className="relative sm:w-full md:w-[40vw] lg:w-[20vw] group rounded-md overflow-hidden bg-blackCustom/5">
      <div
        className="flex w-full h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {finalUrls.map((url, idx) => (
          <div key={idx} className="w-full shrink-0 h-full">
            <iframe
              className="w-full h-[152px]"
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

      {finalUrls.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-blackCustom/30 backdrop-blur-md text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/80 transition-all duration-300 ease-in-out opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-10 shadow-md cursor-pointer active:cursor-pointing"
          >
            <ArrowLeft />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-blackCustom/30 backdrop-blur-md text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/80 transition-all duration-300 ease-in-out opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-10 shadow-md cursor-pointer active:cursor-pointing"
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
  textWin,
  onOpenLightbox,
  ...props
}) {
  const originalIndex = win._originalIndex || index;
  const titre = localizeField(win.title, locale, 'Fenêtre');
  const couleur =
    win.windowColor?.colorValue?.hex || teamColorsFALLBACK[originalIndex % 4];
  const id = win._key || `tab${originalIndex}`;

  // -- Calcul des Positions --
  const cols = Math.ceil(Math.sqrt(totalWindows));
  const rows = Math.ceil(totalWindows / cols);
  const col = index % cols;
  const row = Math.floor(index / cols);

  const baseLeft =
    typeof win.positionX === 'number' ? win.positionX : col * (90 / cols) + 5;

  const baseTop =
    typeof win.positionY === 'number' ? win.positionY : row * (80 / rows) + 5;

  const finalLeft = baseLeft + (win.offsetX || 0);
  const finalTop = baseTop + (win.offsetY || 0);

  const windowStyle = useMemo(
    () => ({ top: `${finalTop}vh`, left: `${finalLeft}vw` }),
    [finalTop, finalLeft]
  );

  // -- Calcul des Dimensions --
  let baseWidth = 25;
  if (win.windowSize === 'small') baseWidth = 18.25;
  if (win.windowSize === 'large') baseWidth = 35;

  let width = `clamp(180px, ${baseWidth}vw, 500px)`;
  let aspectRatio = '1 / 0.66';

  if (win.windowOrientation === 'portrait') {
    width = `clamp(140px, ${baseWidth * 0.66}vw, 350px)`;
    aspectRatio = '0.66 / 1';
  } else if (win.windowOrientation === 'square') {
    width = `clamp(200px, ${baseWidth * 0.8}vw, 400px)`;
    aspectRatio = '1 / 1';
  }
  if (win._type === 'windowImageFolderItem') {
    width = `clamp(90px, ${baseWidth / 2}vw, 250px)`;
  }
  const windowContent = useMemo(() => {
    switch (win._type) {
      case 'windowBio': {
        return (
          <div className="p-4 overflow-y-auto scrollbar-hide text-blackCustom w-[85vw] md:w-[35vw] lg:w-[35vw] xl:w-[40vw] lg:h-[50vw] xl:h-[47.5vw] 2xl:h-[40vw]">
            <div className="float-left w-[35%] mr-4 mb-2">
              <Image
                src={win.photo ? buildSanityImageUrl(win.photo) : heroImage}
                alt="Portrait Bio"
                width={400}
                height={400}
                className="w-full h-auto object-cover rounded-md shadow-sm"
              />
            </div>

            {textWin && (
              <div className="md:text-sm lg:text-[15px] 2xl:text-base leading-relaxed text-justify preserve-lines whitespace-pre-line font-liberation italic">
                {portableTextToPlain(
                  localizeField(textWin.content, locale, [])
                )}
              </div>
            )}

            <div className="clear-both"></div>
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
            finalUrl = `https://open.spotify.com/embed/${type}/${idTrack}`;
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
          <div className="bg-background overflow-y-auto p-4 whitespace-pre-line font-liberation italic leading-[1.3] text-blackCustom text-[16px] 2xl:text-[18px] w-[85vw] md:w-[35vw] lg:w-[35vw] xl:w-[40vw] h-[30vh] lg:h-[35vw] xl:h-[30vw] 2xl:h-[25vw]">
            {plainText}
          </div>
        );
      }

      case 'windowRecommandation': {
        const reco = win.recommandation || [];
        return (
          <div className="flex flex-col gap-2 w-[85vw] md:w-[40vw] lg:w-[40vw] xl:w-[35vw]">
            <ul className="list-disc list-inside text-[14px] 2xl:text-[16px] text-blackCustom">
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
            className={`w-full h-auto rounded-md block ${interactiveImageClasses}`}
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
              height: 'auto',
              minWidth: '100%',
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

      case 'windowImageFolderItem': {
        const imageUrl = win.photo ? buildSanityImageUrl(win.photo) : heroImage;

        return (
          <div
            className="flex items-center justify-center p-0 m-0 w-full cursor-pointer hover:opacity-90 transition-opacity active:cursor-pointing"
            style={{ width, height: 'auto', minWidth: '100%' }}
            onClick={() =>
              onOpenLightbox(
                win.fullFolder || win.imageFolder,
                win.imageIndex,
                titre
              )
            }
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={titre}
                width={400}
                height={400}
                className="w-full h-auto rounded-md block"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-black">
                Image indisponible
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  }, [
    win,
    locale,
    heroImage,
    width,
    aspectRatio,
    titre,
    textWin,
    onOpenLightbox,
  ]);

  return (
    <WindowsTab
      id={id}
      titre={titre}
      couleur={couleur}
      style={windowStyle}
      contenu={windowContent}
      subtitle={win._type === 'windowBio' ? `Last seen: ${lastSeen}` : null}
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

  const [desktopLightbox, setDesktopLightbox] = useState({
    open: false,
    images: [],
    index: 0,
    title: '',
  });

  const [recoModalOpen, setRecoModalOpen] = useState(false);

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

  const windowsWithIndex = useMemo(() => {
    return windows.map((w, i) => ({ ...w, _originalIndex: i }));
  }, [windows]);

  const orderedWindows = useMemo(() => {
    return windowsWithIndex.toSorted((a, b) => {
      const aPriority = a.startsOnTop ? 1 : 0;
      const bPriority = b.startsOnTop ? 1 : 0;
      return aPriority - bPriority;
    });
  }, [windowsWithIndex]);

  const expandedWindows = useMemo(() => {
    if (isMobile) return orderedWindows;

    return orderedWindows.flatMap(win => {
      if (win._type === 'windowImageFolder' && win.imageFolder?.length > 0) {
        return win.imageFolder.map((img, idx) => ({
          ...win,
          _type: 'windowImageFolderItem',
          photo: img,
          imageIndex: idx,
          fullFolder: win.imageFolder,
          _key: `${win._key || win._id}-img-${idx}`,
          offsetX: idx * 3,
          offsetY: idx * 4,
        }));
      }
      return win;
    });
  }, [orderedWindows, isMobile]);

  if (!windows || windows.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center text-whiteCustom bg-blackCustom">
        Chargement des fenêtres...
      </div>
    );
  }

  // ==========================================
  // EXTRACTION DES DONNÉES
  // ==========================================

  const bioWin = expandedWindows.find(w => w._type === 'windowBio');
  const allTextWindows = expandedWindows.filter(w => w._type === 'windowText');
  const textWin = allTextWindows[0];
  const extraTextWindows = allTextWindows.slice(1);

  const imageWindows = expandedWindows.filter(
    w =>
      w._type === 'windowImage' ||
      w._type === 'windowImageFolder' ||
      w._type === 'windowImageFolderItem'
  );

  const musicWin = expandedWindows.find(
    w => w._type === 'windowMusic' || w._type === 'windowMusicPlaylist'
  );
  const recoWin = expandedWindows.find(w => w._type === 'windowRecommandation');

  const desktopWindows = expandedWindows.filter(w => w._key !== textWin?._key);

  const getTabColor = win => {
    if (!win) return '#000000';
    return (
      win.windowColor?.colorValue?.hex ||
      teamColorsFALLBACK[win._originalIndex % 4]
    );
  };

  // ==========================================
  // RENDU MOBILE
  // ==========================================

  if (isMobile) {
    return (
      <section
        id="home"
        className="grid grid-cols-2 place-content-around h-screen p-2 gap-2 md:gap-4 lg:gap-6 w-screen bg-background overflow-y-auto"
      >
        {/* --- CARTE 1 : BIO --- */}
        {bioWin && (
          <div className="flex col-span-2 w-full h-fit flex-col text-white gap-1 shadow-lg">
            <div
              className="flex items-center justify-between border border-blackCustom gap-2 p-2 rounded-t-md"
              style={{ backgroundColor: getTabColor(bioWin) }}
            >
              <div className="flex flex-col">
                <h3 className="text-md font-bold px-2">
                  {localizeField(bioWin.title, locale, 'about me')}
                </h3>
                <div className="text-[10px] text-gray-300 px-2">
                  Last seen: {lastSeen}
                </div>
              </div>
            </div>

            <div className="border border-blackCustom bg-background rounded-b-md overflow-hidden">
              <div className="p-4 h-[35vh] overflow-y-auto scrollbar-hide">
                <div className="float-left w-[40%] mr-4 mb-2">
                  <Image
                    src={
                      bioWin.photo
                        ? buildSanityImageUrl(bioWin.photo)
                        : heroImage
                    }
                    alt="Portrait"
                    width={400}
                    height={400}
                    className="w-full h-auto rounded-md"
                  />
                </div>

                {textWin && (
                  <div className="text-blackCustom text-sm leading-relaxed text-justify preserve-lines whitespace-pre-line font-liberation italic">
                    {portableTextToPlain(
                      localizeField(textWin.content, locale, [])
                    )}
                  </div>
                )}
                <div className="clear-both"></div>
              </div>
            </div>
          </div>
        )}

        {/* --- CARTES IMAGES MULTIPLES --- */}
        {imageWindows.map((imgWin, idx) => (
          <div
            key={`img-mob-${idx}`}
            className="flex col-span-1 w-full h-full flex-col text-white gap-1 shadow-lg"
          >
            <div
              className="flex items-center justify-between border border-blackCustom gap-2 p-2 rounded-t-md"
              style={{ backgroundColor: getTabColor(imgWin) }}
            >
              <h3 className="text-sm font-bold px-2 truncate">
                {localizeField(imgWin.title, locale, 'Galerie')}
                {imgWin._type === 'windowImageFolderItem'
                  ? ` (${imgWin.imageIndex + 1})`
                  : ''}
              </h3>
            </div>
            <div className="p-2 border border-blackCustom bg-background rounded-b-md w-full flex-1">
              <div className="w-full aspect-square relative rounded-sm overflow-hidden">
                {imgWin._type === 'windowImageFolder' ? (
                  <ImageFolderCarousel
                    images={imgWin.imageFolder}
                    titre={localizeField(imgWin.title, locale, 'Galerie')}
                    heroImage={heroImage}
                  />
                ) : (
                  <Image
                    src={
                      imgWin.photo
                        ? buildSanityImageUrl(imgWin.photo)
                        : heroImage
                    }
                    alt="Image mobile"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        {/* --- CARTE RECOMMANDATION --- */}
        {recoWin && (
          <>
            <div
              className="flex col-span-1 w-full h-full flex-col text-white gap-1 shadow-lg cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setRecoModalOpen(true)}
            >
              <div
                className="flex items-center justify-between border border-blackCustom gap-2 p-2 rounded-t-md"
                style={{ backgroundColor: getTabColor(recoWin) }}
              >
                <h3 className="text-sm font-bold px-2 truncate">
                  {localizeField(recoWin.title, locale, 'Recommandation')}
                </h3>
              </div>

              <div className="p-2 border border-blackCustom bg-background rounded-b-md w-full flex-1">
                <div className="w-full aspect-square relative rounded-sm overflow-hidden p-1">
                  <ul className="text-sm text-blackCustom w-full flex flex-col gap-1.5 h-full relative z-10">
                    {recoWin.recommandation &&
                    recoWin.recommandation.length > 0 ? (
                      recoWin.recommandation.map((rec, idx) => (
                        <li key={idx} className="truncate shrink-0">
                          {rec.title || rec.url}
                        </li>
                      ))
                    ) : (
                      <p className="text-blackCustom">
                        Aucune recommandation disponible.
                      </p>
                    )}
                  </ul>
                  {/* Le dégradé reste par-dessus (z-20) */}
                  <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {recoModalOpen && (
                <m.div
                  className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-blackCustom/40 backdrop-blur-sm gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setRecoModalOpen(false)}
                >
                  <m.div
                    // 1. Le conteneur parent devient transparent, on lui donne juste le gap-1
                    className="w-full max-w-sm max-h-[70vh] flex flex-col gap-1 shadow-2xl"
                    initial={{ y: 20, scale: 0.95 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={e => e.stopPropagation()}
                  >
                    {/* 2. Le Header (avec ses propres bordures et son rounded-t-md) */}
                    <div
                      className="flex items-center justify-between border border-blackCustom gap-2 p-2 rounded-t-md shrink-0"
                      style={{ backgroundColor: getTabColor(recoWin) }}
                    >
                      <h3 className="text-[12px] font-bold px-2 text-white">
                        {localizeField(recoWin.title, locale, 'Recommandation')}
                      </h3>
                      <button
                        onClick={() => setRecoModalOpen(false)}
                        className="text-white hover:opacity-70 px-2 font-bold text-lg leading-none"
                      >
                        close
                      </button>
                    </div>

                    {/* 3. Le Contenu (avec ses propres bordures, son fond, et son rounded-b-md) */}
                    <div className="p-4 overflow-y-auto border border-blackCustom bg-background rounded-b-md">
                      <ul className="list-disc list-inside text-[14px] text-blackCustom flex flex-col gap-4">
                        {recoWin.recommandation &&
                        recoWin.recommandation.length > 0 ? (
                          recoWin.recommandation.map((rec, idx) => (
                            <li key={idx}>
                              <a
                                href={rec.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:no-underline underline-offset-2 break-all active:text-gray-500"
                              >
                                {rec.title || rec.url}
                              </a>
                            </li>
                          ))
                        ) : (
                          <p className="text-blackCustom">
                            Aucune recommandation disponible.
                          </p>
                        )}
                      </ul>
                    </div>
                  </m.div>
                </m.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* --- CARTE MUSIQUE --- */}
        {musicWin && (
          <div className="flex col-span-2 w-full h-auto flex-col text-white gap-1 shadow-lg">
            <div
              className="flex items-center justify-between border border-blackCustom gap-2 p-2 rounded-t-md"
              style={{ backgroundColor: getTabColor(musicWin) }}
            >
              <h3 className="text-sm font-bold px-2 truncate">
                {localizeField(musicWin.title, locale, 'Musique')}
              </h3>
            </div>
            <div className="p-2 border border-blackCustom bg-background flex rounded-b-md h-auto items-center justify-center">
              <MusicPlaylistCarousel rawUrls={musicWin.spotifyUrlFolder} />
            </div>
          </div>
        )}

        {/* --- CARTES AUTRES TEXTES --- */}
        {extraTextWindows.map((extraText, idx) => (
          <div
            key={`extra-text-mobile-${idx}`}
            className="flex col-span-2 w-full h-full flex-col text-white gap-1 shadow-lg"
          >
            <div
              className="flex items-center justify-between border border-blackCustom gap-2 p-2 rounded-t-md"
              style={{ backgroundColor: getTabColor(extraText) }}
            >
              <h3 className="text-sm font-bold px-2 truncate">
                {localizeField(extraText.title, locale, 'Texte')}
              </h3>
            </div>
            <div className="p-4 border border-blackCustom bg-background rounded-b-md overflow-y-auto h-[25vh]">
              <div className="text-blackCustom text-sm leading-relaxed whitespace-pre-line font-liberation italic">
                {portableTextToPlain(
                  localizeField(extraText.content, locale, [])
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  // ==========================================
  // RENDU DESKTOP
  // ==========================================

  return (
    <>
      <WindowsManager>
        {desktopWindows.map((win, index) => (
          <WindowItem
            key={win._key || `tab${win._originalIndex}-${index}`}
            win={win}
            index={index}
            totalWindows={desktopWindows.length}
            locale={locale}
            lastSeen={lastSeen}
            heroImage={heroImage}
            textWin={textWin}
            onOpenLightbox={(images, idx, title) =>
              setDesktopLightbox({ open: true, images, index: idx, title })
            }
          />
        ))}
      </WindowsManager>

      <CustomLightbox
        open={desktopLightbox.open}
        initialIndex={desktopLightbox.index}
        onClose={() => setDesktopLightbox(prev => ({ ...prev, open: false }))}
        images={desktopLightbox.images}
        project={{ name: desktopLightbox.title }}
      />
    </>
  );
}
