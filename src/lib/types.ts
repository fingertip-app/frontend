export type Experience = {
  id: string;
  title: string;
  category: string;
  region: string;
  price: number;
  artisanName: string;
};

export type CardNews = {
  id: string;
  title: string;
  linkedExperienceId: string;
};
