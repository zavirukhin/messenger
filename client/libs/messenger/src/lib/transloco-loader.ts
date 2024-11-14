type LanguageLoader = {
  [key: string]: () => Promise<Record<string, string>>
};

export const loader: LanguageLoader = ['en', 'ru'].reduce((acc: LanguageLoader, lang: string) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {});