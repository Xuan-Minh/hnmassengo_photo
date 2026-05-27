import { eventType } from './eventType';
import { projectType } from './projectType';
import shopItem from './shopItem';
import { loadingImageType } from './loadingImageType';
import { loadingImageMobileType } from './loadingImageMobileType';
import { homeSectionImageType } from './homeSectionImageType';
import { homeBioType } from './homeBioType';
import { newsletterSubscriber } from './newsletterSubscriber';
import { newsletterCampaign } from './newsletterCampaign';
import { homeSection } from './homeSection';
import windowBio from './objects/windowBio.js';
import windowMusic from './objects/windowMusic';
import windowRecommendation from './objects/windowRecommendation.js';
import windowText from './objects/windowText';
import windowCustom from './objects/windowCustom';

export const schema = {
  types: [
    eventType,
    projectType,
    shopItem,
    loadingImageType,
    loadingImageMobileType,
    homeSectionImageType,
    homeBioType,
    homeSection,
    windowBio,
    windowMusic,
    windowRecommendation,
    windowText,
    windowCustom,
    newsletterSubscriber,
    newsletterCampaign,
  ],
};
