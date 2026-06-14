'use client';
/* eslint-disable react-doctor/iframe-missing-sandbox */
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import WindowsTab from '../../../components/ui/WindowsTab';
import WindowsManager from '../../../components/ui/WindowsManager';
import { HOME_FALLBACK_IMAGES } from '../../../lib/constants';
import client from '../../../lib/sanity.client';
import { useSanityImages } from '../../../lib/hooks';
import {
  extractIdYoutube,
  calculateAge,
  portableTextToPlain,
} from '../../../lib/utils';
import { buildSanityImageUrl } from '../../../lib/imageUtils';

export async function getGlobalLastUpdate() {
  try {
    const query = `*[!(_id in path("_.**"))] | order(_updatedAt desc)[0]._updatedAt`;
    const lastUpdateDate = await client.fetch(query);

    if (!lastUpdateDate) return null;

    const date = new Date(lastUpdateDate);
    return new Intl.DateTimeFormat('en-EN', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
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

export default function TestPage() {
  const { locale = 'fr' } = useParams();
  const [lastSeen, setLastSeen] = useState('...');
  const [windows, setWindows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const windowsData = await client.fetch(`
          *[_type == "homePage"][0].windows[]{
            ...,
            windowColor->{
              hex 
            }
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

  const teamColorsFALLBACK = ['#BB3430', '#44724B', '#FED52A', '#FFFFFF'];

  const renderWindow = (win, index) => {
    const titre = localizeField(win.title, locale, 'Fenêtre');
    const couleur = win.windowColor?.hex || teamColorsFALLBACK[index % 4];
    const id = win._key || `tab${index}`;

    // ==========================================
    // 📍 CALCUL DE LA POSITION (GRILLE AUTO-ADAPTATIVE)
    // ==========================================
    const totalWindows = windows.length;

    // 1. Calcul du nombre de colonnes et lignes idéal (ex: 4 fenêtres = 2x2, 6 = 3x2)
    const cols = Math.ceil(Math.sqrt(totalWindows));
    const rows = Math.ceil(totalWindows / cols);

    // 2. On trouve la position de la fenêtre actuelle dans cette grille
    const col = index % cols;
    const row = Math.floor(index / cols);

    // 3. On répartit sur 90vw et 80vh (pour laisser 5% de marge sur les bords)
    const leftPos = `${col * (90 / cols) + 5}vw`;
    const topPos = `${row * (80 / rows) + 5}vh`;

    const initialPosition = { top: topPos, left: leftPos };
    // ==========================================

    // 1. Définir une valeur de base selon la taille
    let baseWidth = 30; // Valeur par défaut pour 'medium'

    if (win.windowSize === 'small') baseWidth = 20;
    if (win.windowSize === 'large') baseWidth = 40;

    // 2. Calculer la largeur et la hauteur finales selon l'orientation
    let width = `${baseWidth}vw`;
    let height = `${baseWidth * 0.66}vw`; // Par défaut: paysage (ratio 3:2)

    if (win.windowOrientation === 'portrait') {
      width = `${baseWidth * 0.66}vw`;
      height = `${baseWidth}vw`;
    } else if (win.windowOrientation === 'square') {
      width = `${baseWidth * 0.8}vw`;
      height = `${baseWidth * 0.8}vw`;
    }

    const windowStyle = {
      top: topPos,
      left: leftPos,
    };
    switch (win._type) {
      case 'windowBio': {
        const occupation = localizeField(
          win.occupation,
          locale,
          'Soccer / Photographer'
        );
        return (
          <WindowsTab
            key={id}
            id={id}
            titre={titre}
            couleur={couleur}
            style={windowStyle}
            contenu={
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  justifyContent: 'between',
                  gap: '1rem',
                  width: '45vw',
                  zIndex: '100  !important',
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
                    <li>
                      Location : {win.location || 'Augsbourg / Paris '} 📌
                    </li>
                    <li>Occupation : {occupation}</li>
                    <li>Last seen : {lastSeen}</li>
                  </ul>
                </div>
              </div>
            }
          />
        );
      }

      case 'windowMusic': {
        const rawUrl =
          win.spotifyUrl ||
          'https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl';
        let finalUrl = rawUrl;

        try {
          const parsed = new URL(rawUrl);
          const match = parsed.pathname.match(
            /(track|album|playlist|artist|show|episode)\/([a-zA-Z0-9]+)/
          );

          if (match && !rawUrl.includes('/embed/')) {
            const type = match[1];
            const id = match[2];
            // Format d'URL corrigé avec le $ manquant pour l'intégration
            finalUrl = `https://open.spotify.com/embed/${type}/${id}`;
          }
        } catch (e) {
          console.error('Lien Spotify invalide');
        }

        return (
          <WindowsTab
            key={id}
            id={id}
            titre={titre}
            couleur={couleur}
            style={windowStyle}
            contenu={
              <iframe
                className="w-[30vw] h-[152px] rounded-md"
                src={finalUrl}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify music player"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              ></iframe>
            }
          />
        );
      }

      case 'windowVideo': {
        const videoId = extractIdYoutube(win.content);

        return (
          <WindowsTab
            key={id}
            id={id}
            titre={titre}
            couleur={couleur}
            style={windowStyle} // <-- Ici c'est parfait
            contenu={
              videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  style={{
                    width: '26vw',
                    height: '15vw',
                    borderRadius: '0.375rem ',
                  }}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
                ></iframe>
              ) : (
                <div className="w-[26vw] h-[15vw] flex items-center justify-center bg-gray-200">
                  Vidéo indisponible
                </div>
              )
            }
          />
        );
      }

      case 'windowText': {
        const rawBlocks = localizeField(win.content, locale, []);
        const plainText = portableTextToPlain(rawBlocks);

        return (
          <WindowsTab
            key={id}
            id={id}
            titre={titre}
            couleur={couleur}
            style={windowStyle}
            contenu={
              <p className="w-[30vw] h-[20vw] bg-current/15 overflow-scroll-y whitespace-pre-line font-liberation italic leading-[1.3] text-blackCustom text-[18px] md:text-[16px] lg:text-[16px] xl:text-[18px] 2xl:text-[20px]">
                {plainText}
              </p>
            }
          />
        );
      }

      case 'windowImage': {
        const imageUrl = win.photo ? buildSanityImageUrl(win.photo) : heroImage;
        const imageComponent = imageUrl ? (
          <Image
            src={imageUrl}
            alt={titre}
            width={800} // Grande taille pour éviter le pixelisé
            height={800}
            // L'image prend 100% de la div parente (qui elle, a la taille dynamique)
            className="w-full h-full object-cover rounded-md block"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-black rounded-md">
            Image indisponible
          </div>
        );

        return (
          <WindowsTab
            key={id}
            id={id}
            titre={titre}
            couleur={couleur}
            style={windowStyle} // 👈 On utilise le style fusionné !
            contenu={
              // ICI LA MAGIE : La div prend les dimensions dynamiques calculées !
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
            }
          />
        );
      }
      default:
        return null;
    }
  };

  if (!windows || windows.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center text-white bg-blackCustom">
        Chargement des fenêtres...
      </div>
    );
  }

  return (
    <WindowsManager>
      {windows.map((win, index) => renderWindow(win, index))}
    </WindowsManager>
  );
}
