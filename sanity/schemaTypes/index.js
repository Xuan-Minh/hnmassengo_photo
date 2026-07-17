import { eventType } from './eventType';
import { projectType } from './projectType';
import shopItem from './shopItem';
import { loadingImageType } from './loadingImageType';
import { loadingImageMobileType } from './loadingImageMobileType';
import { newsletterSubscriber } from './newsletterSubscriber';
import { newsletterCampaign } from './newsletterCampaign';
import homePage from './homePage';
import windowBio from './objects/windowBio';
import windowMusic from './objects/windowMusic';
import windowMusicFolder from './objects/windowMusicFolder';
import windowecommandation from './objects/windowRecommandation';
import windowText from './objects/windowText';
import windowVideo from './objects/windowVideo';
import teamColor from './teamColor';
import windowImage from './objects/windowImage';
import windowImageFolder from './objects/windowImageFolder';

export const schema = {
  types: [
    eventType,
    projectType,
    shopItem,
    loadingImageType,
    loadingImageMobileType,
    homePage,
    windowBio,
    windowMusic,
    windowMusicFolder,
    windowText,
    windowVideo,
    newsletterSubscriber,
    newsletterCampaign,
    teamColor,
    windowImage,
    windowImageFolder,
  ],
};
