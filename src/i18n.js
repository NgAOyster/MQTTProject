import { createI18n } from 'vue-i18n';

import en from './Language/EN.js';
import cn from './Language/CN.js';

const messages = {
  en,
  cn,
};

const i18n = createI18n({
  locale: 'cn',
  messages,
});

export default i18n;