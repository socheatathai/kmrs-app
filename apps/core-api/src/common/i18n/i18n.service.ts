import { Injectable } from '@nestjs/common';

import { RequestContextService } from '../context/request-context.service';
import en from './locales/en.json';
import km from './locales/km.json';

const translations = { en, km } as const;

type LanguageCode = keyof typeof translations;
export type TranslationKey = keyof typeof en;

@Injectable()
export class I18nService {
  private readonly fallbackLanguage: LanguageCode = 'en';

  constructor(private readonly requestContext: RequestContextService) {}

  resolveLanguage(input?: string): LanguageCode {
    if (!input) {
      return this.fallbackLanguage;
    }

    const normalized = input.toLowerCase();

    if (normalized.startsWith('km')) {
      return 'km';
    }

    return 'en';
  }

  t(key: TranslationKey, language?: string) {
    const locale = this.resolveLanguage(
      language ?? this.requestContext.getLanguage(),
    );
    return (
      translations[locale][key] ?? translations[this.fallbackLanguage][key]
    );
  }
}
