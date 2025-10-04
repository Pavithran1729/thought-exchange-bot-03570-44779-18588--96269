export interface Template {
  id: string;
  name: string;
  description: string;
  styles: {
    fontSize: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
    };
    fontFamily: {
      heading: string;
      body: string;
    };
    spacing: {
      paragraph: string;
      section: string;
    };
    colors: {
      heading: string;
      body: string;
      accent: string;
      background: string;
    };
    decoration: {
      headingUnderline: boolean;
      accentBar: boolean;
      shadow: boolean;
    };
  };
}

export const templates: Template[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Clean and modern',
    styles: {
      fontSize: {
        h1: '3xl',
        h2: 'xl',
        h3: 'lg',
        body: 'base',
      },
      fontFamily: {
        heading: 'font-sans',
        body: 'font-sans',
      },
      spacing: {
        paragraph: 'mb-4',
        section: 'mb-8',
      },
      colors: {
        heading: 'text-foreground',
        body: 'text-foreground/90',
        accent: 'text-primary',
        background: 'bg-transparent',
      },
      decoration: {
        headingUnderline: true,
        accentBar: true,
        shadow: false,
      },
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate and formal',
    styles: {
      fontSize: {
        h1: '4xl',
        h2: '2xl',
        h3: 'xl',
        body: 'base',
      },
      fontFamily: {
        heading: 'font-serif',
        body: 'font-sans',
      },
      spacing: {
        paragraph: 'mb-6',
        section: 'mb-12',
      },
      colors: {
        heading: 'text-foreground',
        body: 'text-foreground/80',
        accent: 'text-primary',
        background: 'bg-muted/30',
      },
      decoration: {
        headingUnderline: false,
        accentBar: true,
        shadow: true,
      },
    },
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Vibrant and expressive',
    styles: {
      fontSize: {
        h1: '5xl',
        h2: '3xl',
        h3: '2xl',
        body: 'lg',
      },
      fontFamily: {
        heading: 'font-sans',
        body: 'font-sans',
      },
      spacing: {
        paragraph: 'mb-3',
        section: 'mb-6',
      },
      colors: {
        heading: 'text-primary',
        body: 'text-foreground/90',
        accent: 'text-primary',
        background: 'bg-gradient-to-br from-primary/5 to-transparent',
      },
      decoration: {
        headingUnderline: true,
        accentBar: true,
        shadow: false,
      },
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant',
    styles: {
      fontSize: {
        h1: '3xl',
        h2: 'xl',
        h3: 'lg',
        body: 'sm',
      },
      fontFamily: {
        heading: 'font-sans',
        body: 'font-sans',
      },
      spacing: {
        paragraph: 'mb-3',
        section: 'mb-8',
      },
      colors: {
        heading: 'text-foreground',
        body: 'text-muted-foreground',
        accent: 'text-foreground',
        background: 'bg-transparent',
      },
      decoration: {
        headingUnderline: false,
        accentBar: false,
        shadow: false,
      },
    },
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Formal and structured',
    styles: {
      fontSize: {
        h1: '3xl',
        h2: '2xl',
        h3: 'lg',
        body: 'base',
      },
      fontFamily: {
        heading: 'font-serif',
        body: 'font-serif',
      },
      spacing: {
        paragraph: 'mb-5',
        section: 'mb-10',
      },
      colors: {
        heading: 'text-foreground',
        body: 'text-foreground/85',
        accent: 'text-foreground',
        background: 'bg-background',
      },
      decoration: {
        headingUnderline: false,
        accentBar: false,
        shadow: false,
      },
    },
  },
  {
    id: 'business',
    name: 'Business Pro',
    description: 'Executive and polished',
    styles: {
      fontSize: {
        h1: '4xl',
        h2: '2xl',
        h3: 'xl',
        body: 'base',
      },
      fontFamily: {
        heading: 'font-sans',
        body: 'font-sans',
      },
      spacing: {
        paragraph: 'mb-4',
        section: 'mb-10',
      },
      colors: {
        heading: 'text-foreground',
        body: 'text-foreground/90',
        accent: 'text-primary',
        background: 'bg-gradient-to-br from-muted/20 to-transparent',
      },
      decoration: {
        headingUnderline: true,
        accentBar: true,
        shadow: true,
      },
    },
  },
  {
    id: 'modern',
    name: 'Modern Tech',
    description: 'Contemporary and sleek',
    styles: {
      fontSize: {
        h1: '5xl',
        h2: '3xl',
        h3: 'xl',
        body: 'base',
      },
      fontFamily: {
        heading: 'font-sans',
        body: 'font-sans',
      },
      spacing: {
        paragraph: 'mb-4',
        section: 'mb-8',
      },
      colors: {
        heading: 'text-primary',
        body: 'text-foreground/95',
        accent: 'text-accent',
        background: 'bg-gradient-to-br from-primary/5 via-transparent to-accent/5',
      },
      decoration: {
        headingUnderline: false,
        accentBar: true,
        shadow: false,
      },
    },
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated and refined',
    styles: {
      fontSize: {
        h1: '4xl',
        h2: '2xl',
        h3: 'lg',
        body: 'base',
      },
      fontFamily: {
        heading: 'font-serif',
        body: 'font-serif',
      },
      spacing: {
        paragraph: 'mb-6',
        section: 'mb-12',
      },
      colors: {
        heading: 'text-foreground',
        body: 'text-foreground/85',
        accent: 'text-primary',
        background: 'bg-muted/10',
      },
      decoration: {
        headingUnderline: true,
        accentBar: false,
        shadow: true,
      },
    },
  },
];

export const getTemplate = (id: string): Template => {
  return templates.find(t => t.id === id) || templates[0];
};
