'use client';
/* eslint-disable react-doctor/iframe-missing-sandbox */
import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
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
import { buildSanityImageUrl } from '../../../lib/imageUtils'; // Importation de la fonction utilitaire pour construire l'URL de l'image

export async function getGlobalLastUpdate() {
  try {
    const query = `*[!(_id in path("_.**"))] | order(_updatedAt desc)[0]._updatedAt`;
    const lastUpdateDate = await client.fetch(query);

    if (!lastUpdateDate) return null;

    const date = new Date(lastUpdateDate);
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
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
  const t = useTranslations();
  const [lastSeen, setLastSeen] = useState('...');
  const [windows, setWindows] = useState([]); // <-- Nouvel état pour les fenêtres

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        // 2. Fetch dynamique de TOUTES les fenêtres depuis le document principal
        const windowsData = await client.fetch(`
          *[_type == "homePage"][0].windows[]{
            ...,
            windowColor->{
              hex // On résout la référence pour récupérer le code couleur
            }
          }
        `);
        if (!cancelled && windowsData) {
          setWindows(windowsData);
        }
      } catch (err) {
        console.error('Erreur de fetch', err);
      }

      // 3. Fetch de la date
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

  // Fonction de rendu dynamique
  const renderWindow = (win, index) => {
    const titre = localizeField(win.title, locale, 'Fenêtre');

    const couleur = win.windowColor?.hex || teamColorsFALLBACK[index % 4];
    const id = win._key || `tab${index}`;

    switch (win._type) {
      case 'windowBio': {
        const occupation = localizeField(
          win.occupation,
          locale,
          'Augsbourg / Paris 📌'
        );
        return (
          <WindowsTab
            key={id}
            id={id}
            titre={titre}
            couleur={couleur}
            contenu={
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  justifyContent: 'between',
                  gap: '1rem',
                  width: '45vw',
                }}
              >
                <div className="w-[38%] h-auto inline-block">
                  {/* On utilise win.photo avec votre fonction utilitaire */}
                  {win.photo ? (
                    <Image
                      src={buildSanityImageUrl(win.photo)}
                      alt="Portrait Bio"
                      width={400}
                      height={400}
                      className="w-full h-auto object-cover rounded-md"
                    />
                  ) : (
                    /* Si le client n'a pas encore mis de photo dans Sanity, on affiche heroImage en secours */
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
          'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT';
        let finalUrl = rawUrl;

        try {
          const parsed = new URL(rawUrl);
          const match = parsed.pathname.match(
            /(track|album|playlist|artist|show|episode)\/([a-zA-Z0-9]+)/
          );

          if (match && !rawUrl.includes('/embed/')) {
            const type = match[1];
            const id = match[2];
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
        // 1. On récupère les blocs dans la bonne langue (fr, en, ou de)
        const rawBlocks = localizeField(win.content, locale, []);
        // 2. On transforme ces blocs complexes en texte simple
        const plainText = portableTextToPlain(rawBlocks);

        return (
          <WindowsTab
            key={id}
            id={id}
            titre={titre}
            couleur={couleur}
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
            width={600}
            height={600}
            className="w-full h-full object-cover rounded-sm"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-black">
            Image indisponible
          </div>
        );

        return (
          <WindowsTab
            key={id}
            id={id}
            titre={titre}
            couleur={couleur}
            contenu={
              <div className="w-[30vw] h-[20vw] flex items-center justify-center">
                {/* 3. On rend l'image cliquable SI le client a mis un lien dans Sanity */}
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
        // Si le type n'est pas reconnu, on peut retourner null ou un template par défaut
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

  // 2. Si on a des fenêtres, on rend le manager qui ne contiendra QUE des WindowsTab
  return (
    <WindowsManager>
      {windows.map((win, index) => renderWindow(win, index))}
    </WindowsManager>
  );
}
