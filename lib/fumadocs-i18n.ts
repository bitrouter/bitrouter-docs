import { defineI18n } from "fumadocs-core/i18n";
import { defineI18nUI } from "fumadocs-ui/i18n";

export const i18n = defineI18n({
  defaultLanguage: "en",
  languages: ["en", "zh"],
  hideLocale: "default-locale",
});

export const i18nUI = defineI18nUI(i18n, {
  translations: {
    en: {
      displayName: "English",
    },
    zh: {
      displayName: "Chinese",
      search: "Search",
      searchNoResult: "No results found",
      toc: "On this page",
      tocNoHeadings: "No headings",
      lastUpdate: "Last updated on",
      chooseLanguage: "Choose language",
      nextPage: "Next",
      previousPage: "Previous",
      chooseTheme: "Theme",
      editOnGithub: "Edit on GitHub",
    },
  },
});
