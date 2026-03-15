import { eventType } from './eventType';
import { projectType } from './projectType';
import shopItem from './shopItem';
import { loadingImageType } from './loadingImageType';
import { loadingImageMobileType } from './loadingImageMobileType';
import { homeSectionImageType } from './homeSectionImageType';
import { homePresentationType } from './homePresentationType';
import { newsletterSubscriber } from './newsletterSubscriber';
import { newsletterCampaign } from './newsletterCampaign';

export const schema = {
  types: [
    eventType,
    projectType,
    shopItem,
    loadingImageType,
    loadingImageMobileType,
    homeSectionImageType,
    homePresentationType,
    newsletterSubscriber,
    newsletterCampaign,
  ],
};
