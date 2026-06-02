'use client';
import WindowsTab from '../../../components/ui/WindowsTab';
import WindowsManager from '../../../components/ui/WindowsManager';
import { useEffect } from 'react';
import client from '../../../lib/sanity.client';
import Image from 'next/image';
import { useSanityImages } from '../../../lib/hooks';

export default function TestPage() {
  const homeImages = useSanityImages('homeSectionImage', [], {
    width: 900,
    quality: 55,
    dpr: 1,
  });
  const heroImage = homeImages[0] || '';

  return (
    <WindowsManager>
      <WindowsTab
        id="tab1"
        titre="about me."
        contenu={
          <div
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              justifyContent: 'between',
              gap: '1rem',
              width: '50vw',
            }}
          >
            <div className="w-[38%] h-auto inline-block">
              <Image
                src={heroImage}
                alt="Portrait"
                width={400}
                height={400}
                className="w-full h-auto object-fill"
              />
            </div>
            <div className="p-4 w-[60%] h-auto flex">
              <ul className="list-disc list-inside flex justify-around flex-col ">
                <li>Name : Han-Noah MASSENGO</li>
                <li>Age : 23 ans</li>
                <li>Location : Augsbourg / Paris 📌</li>
                <li>Occupation : Soccer / Photographer</li>
                <li>Last seen : 2 hours ago</li>
              </ul>
            </div>
          </div>
        }
        couleur="#58003D"
        fontColor="#F4F3F2"
      />
      <WindowsTab
        id="tab2"
        titre="in my ears."
        contenu={
          <iframe
            style={{
              borderRadius: '0.375rem (6px)', // arrondir les coins de l'iframe
              width: '30vw',
              height: '152px',
            }}
            src="https://open.spotify.com/embed/track/0vJxo7x6jnFKbtFgtihMvJ?utm_source=generator&theme=0"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        }
        couleur="#44724B"
        fontColor="#F4F3F2"
      />
      <WindowsTab
        id="tab3"
        titre="and in my eyes."
        contenu={
          <iframe
            src="https://www.youtube.com/embed/ZIdBrvu7buE"
            title="YouTube video player"
            style={{ width: '30vw', height: '20vw', borderRadius: '0.375rem ' }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        }
        couleur="#004DA3"
        fontColor="#F4F3F2"
      />
      <WindowsTab
        id="tab4"
        titre="and in my heart."
        contenu="Contenu de la quatrième fenêtre."
        couleur="#E2131E"
        fontColor="#F4F3F2"
      />
    </WindowsManager>
  );
}
