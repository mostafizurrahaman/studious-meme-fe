import { TCategory } from './category';

export type TNews = {
  _id: string;
  owner: string;

  category: TCategory;
  issueDate: Date;

  heading: string;
  slug: string;
  body: string;

  primaryPicture: string;
  primaryPictureCaption: string;

  secondaryPicture?: string;
  secondaryPictureCaption?: string;

  pictureAlignment: PictureAlignment;
  reporter: string;
  // video: string | null;

  isBreakingNews: boolean;
  isTopNews: boolean;
  isTrendingNow: boolean;
  isBottomSlider: boolean;

  // metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  metaTags: string[];

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
};

export enum PictureAlignment {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}
