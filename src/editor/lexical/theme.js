// src/editor/theme.js

export const editorTheme = {
  paragraph: 'ts-paragraph',
  heading: {
    h1: 'ts-heading-1',
    h2: 'ts-heading-2',
    h3: 'ts-heading-3',
  },
  list: {
    ul: 'ts-ul',
    ol: 'ts-ol',
    listitem: 'ts-li',
  },
  link: 'ts-link',
  horizontalRule: 'ts-hr',

  // Custom callout kinds
  callout: {
    base: 'callout',
    note: 'callout note',
    warning: 'callout warning',
    example: 'callout example-block',
    blockquote: 'callout blockquote',
    code: 'callout code',
  },

  // Inline semantic spans
  userInput: 'user-input',
  variable: 'variable',
  caption: 'caption', // if you decide to treat it specially
};
