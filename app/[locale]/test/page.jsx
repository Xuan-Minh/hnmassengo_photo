'use client';
import WindowsTab from '../../../components/ui/WindowsTab';
import WindowsManager from '../../../components/ui/WindowsManager';
import { useEffect } from 'react';
import client from '../../../lib/sanity.client';
import { extractIdYoutube } from '../../../lib/utils';

export default function TestPage() {
  return (
    <WindowsManager>
      <WindowsTab
        id="tab1"
        titre="about me."
        contenu="Contenu de la première fenêtre."
        couleur="#58003D"
        fontColor="#F4F3F2"
      />
      <WindowsTab
        id="tab2"
        titre="in my ears."
        contenu={
          <iframe
            src="https://open.spotify.com/embed/track/0vJxo7x6jnFKbtFgtihMvJ?utm_source=generator&theme=0"
            style={{ width: '100%' }}
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
