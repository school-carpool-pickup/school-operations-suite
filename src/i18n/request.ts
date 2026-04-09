import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // Hardcoded to 'en' for "Without Routing" structure 
  // Can be easily switched via a Zustand store or Cookie later.
  const locale = 'en';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
