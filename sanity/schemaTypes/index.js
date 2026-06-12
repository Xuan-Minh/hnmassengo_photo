import { eventType } from './eventType';
import { projectType } from './projectType';
import shopItem from './shopItem';
import { loadingImageType } from './loadingImageType';
import { loadingImageMobileType } from './loadingImageMobileType';
import { homeBioType } from './homeBioType';
import { newsletterSubscriber } from './newsletterSubscriber';
import { newsletterCampaign } from './newsletterCampaign';
import homePage from './homePage';
import windowBio from './objects/windowBio';
import windowMusic from './objects/windowMusic';
import windowRecommendation from './objects/windowRecommendation';
import windowText from './objects/windowText';
import windowVideo from './objects/windowVideo';
import teamColor from './teamColor';
import windowImage from './objects/windowImage';

export const schema = {
  types: [
    eventType,
    projectType,
    shopItem,
    loadingImageType,
    loadingImageMobileType,
    homeBioType,
    homePage,
    windowBio,
    windowMusic,
    windowRecommendation,
    windowText,
    windowVideo,
    newsletterSubscriber,
    newsletterCampaign,
    teamColor,
    windowImage,
  ],
};
