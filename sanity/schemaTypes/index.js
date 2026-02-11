import { eventType } from './eventType';
import { projectType } from './projectType';
import shopItem from './shopItem';
import { loadingImageType } from './loadingImageType';
import { homeSectionImageType } from './homeSectionImageType';
import { newsletterSubscriber } from './newsletterSubscriber';
import { newsletterCampaign } from './newsletterCampaign';

export const schema = {
  types: [
    eventType,
    projectType,
    shopItem,
    loadingImageType,
    homeSectionImageType,
    newsletterSubscriber,
    newsletterCampaign,
  ],
};
