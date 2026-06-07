'use client';
import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import WindowsTab from '../../../components/ui/WindowsTab';
import WindowsManager from '../../../components/ui/WindowsManager';
import { HOME_FALLBACK_IMAGES } from '../../../lib/constants';
import client from '../../../lib/sanity.client';
import { useSanityImages } from '../../../lib/hooks';

function localizeField(value, locale, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value?.[locale] || value?.fr || value?.en || value?.de || fallback;
}
export default function TestPage() {
  const { locale = 'fr' } = useParams();
  const t = useTranslations();
  const [bioDoc, setBioDoc] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchHomeBio = async () => {
      try {
        const data = await client.fetch(
          'coalesce(*[_type == "homeBio" && _id in ["homeBio", "drafts.homeBio"]][0]{ title, bio }, *[_type == "homeBio"] | order(_updatedAt desc)[0]{ title, bio })'
        );
        if (!cancelled) setBioDoc(data || null);
      } catch {
        if (!cancelled) setBioDoc(null);
      }
    };

    fetchHomeBio();

    return () => {
      cancelled = true;
    };
  }, []);

  // On garde les images du schema homeSectionImage et on affiche la premiere.
  const isProduction = process.env.NODE_ENV === 'production';
  const homeImages = useSanityImages('homeSectionImage', HOME_FALLBACK_IMAGES, {
    width: isProduction ? 900 : 1200,
    quality: isProduction ? 55 : 70,
    dpr: 1,
  });
  const heroImage = homeImages[0] || '';

  const bioTitle = useMemo(() => {
    const value = localizeField(bioDoc?.title, locale, '');
    return typeof value === 'string' ? value.trim() : '';
  }, [bioDoc, locale]);

  const bioText = useMemo(
    () => localizeField(bioDoc?.bio, locale, t('home.welcome')),
    [bioDoc, locale, t]
  );

  const teamColors = ['#BB3430', '#44724B', '#FED52A', '#FFFFFF'];
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
              width: '45vw',
            }}
          >
            <div className="w-[38%] h-auto inline-block">
              <Image
                src={heroImage}
                alt="Portrait"
                width={400}
                height={400}
                className="w-full h-auto object-fill rounded-md"
              />
            </div>
            <div className="p-4 w-[60%] h-auto flex">
              <ul className="list-disc list-inside flex justify-around flex-col text-[18px] md:text-[16px] lg:text-[16px] xl:text-[18px] 2xl:text-[20px] font-bold">
                <li>Name : Han-Noah MASSENGO</li>
                <li>Age : 23 ans</li>
                <li>Location : Augsbourg / Paris 📌</li>
                <li>Occupation : Soccer / Photographer</li>
                <li>Last seen : 2 hours ago</li>
              </ul>
            </div>
          </div>
        }
        couleur={teamColors[0]}
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
        couleur={teamColors[1]}
        fontColor="#F4F3F2"
      />
      <WindowsTab
        id="tab3"
        titre="and in my eyes."
        contenu={
          <iframe
            src="https://www.youtube.com/embed/ZIdBrvu7buE"
            title="YouTube video player"
            style={{ width: '26vw', height: '15vw', borderRadius: '0.375rem ' }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        }
        couleur={teamColors[2]}
        fontColor="#0A0A0A"
      />
      <WindowsTab
        id="tab4"
        titre="and in my heart."
        contenu={
          <p className="w-[30vw] h-[20vw] bg-current/15 overflow-scroll-y whitespace-pre-line font-liberation italic leading-[1.3] text-blackCustom text-[18px] md:text-[16px] lg:text-[16px] xl:text-[18px] 2xl:text-[20px]">
            {bioText}
          </p>
        }
        couleur={teamColors[3]}
        fontColor="#0A0A0A"
      />
      <WindowsTab
        id="tab5"
        titre="picture1.jpg"
        contenu={
          <div className="w-full h-auto inline-block">
            <Image
              src={heroImage}
              alt="Portrait"
              width={200}
              height={200}
              className="w-full h-auto object-fill"
            />
          </div>
        }
        couleur={teamColors[2]}
        fontColor="#0A0A0A"
      />
      <WindowsTab
        id="tab6"
        titre="picture2.jpg"
        contenu={
          <div className="w-full h-auto inline-block">
            <Image
              src={heroImage}
              alt="Portrait"
              width={300}
              height={300}
              className="w-full h-auto object-fill rounded-md"
            />
          </div>
        }
        couleur={teamColors[0]}
        fontColor="#F4F3F2"
      />
    </WindowsManager>
  );
}
