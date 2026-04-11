"use client";

import { DIcons } from "dicons";
import { useTheme } from "next-themes";
import Link from "next/link";

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });
}

const ThemeToogle = () => {
  const { setTheme } = useTheme();

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center rounded-full border border-dotted">
        <button
          onClick={() => setTheme("light")}
          className="bg-primary mr-3 rounded-full p-2 text-primary-foreground dark:bg-background dark:text-foreground"
        >
          <DIcons.Sun className="h-5 w-5" strokeWidth={1} />
          <span className="sr-only">Light</span>
        </button>

        <button type="button" onClick={handleScrollTop}>
          <DIcons.ArrowUp className="h-4 w-4" />
          <span className="sr-only">Top</span>
        </button>

        <button
          onClick={() => setTheme("dark")}
          className="dark:bg-primary ml-3 rounded-full p-2 text-foreground dark:text-primary-foreground"
        >
          <DIcons.Moon className="h-5 w-5" strokeWidth={1} />
          <span className="sr-only">Dark</span>
        </button>
      </div>
    </div>
  );
};

const navigation = {
  categories: [
    {
      id: "platform",
      name: "Platform",
      sections: [
        {
          id: "learn",
          name: "Learn",
          items: [
            { name: "Browse Topics", href: "#" },
            { name: "How it Works", href: "#" },
            { name: "Pricing", href: "#" },
          ],
        },
        {
          id: "teach",
          name: "Teach",
          items: [
            { name: "Become a Tutor", href: "#" },
            { name: "Tutor Guidelines", href: "#" },
          ],
        },
        {
          id: "company",
          name: "Company",
          items: [
            { name: "About Us", href: "#" },
            { name: "Contact", href: "#" },
            { name: "Privacy Policy", href: "#" },
            { name: "Terms of Service", href: "#" }
          ],
        },
      ],
    },
  ],
};

const Underline = `hover:-translate-y-1 border border-dotted rounded-xl p-2.5 transition-transform `;

export function HeroFooter() {
  return (
    <footer className="border-border/50 mx-auto w-full border-t bg-background/50 backdrop-blur-md px-2">
      <div className="relative mx-auto grid max-w-7xl items-center justify-center gap-6 p-10 pb-0 md:flex ">
        <Link href="/">
          <p className="flex items-center justify-center rounded-full font-headline font-bold text-2xl text-primary gap-2">
            <DIcons.Shapes className="w-8 text-primary" />
            PeerGig
          </p>
        </Link>
        <p className="bg-transparent text-center text-sm leading-6 text-foreground/60 md:text-left">
          PeerGig is the leading student-focused peer-to-peer learning platform.
          Our mission is to empower students to learn only what they need, paying only for the topics they want help with.
          Join thousands of other students today.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="border-b border-border/50 border-dotted"> </div>
        <div className="py-10">
          {navigation.categories.map((category) => (
            <div
              key={category.name}
              className="grid grid-cols-3 flex-row justify-between gap-6 leading-6 md:flex"
            >
              {category.sections.map((section) => (
                <div key={section.name}>
                  <ul
                    role="list"
                    aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                    className="flex flex-col space-y-2"
                  >
                    {section.items.map((item) => (
                      <li key={item.name} className="flow-root">
                        <Link
                          href={item.href}
                          className="text-sm font-body text-foreground/60 hover:text-primary transition-colors"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-b border-border/50 border-dotted"> </div>
      </div>

      <div className="flex flex-wrap items-center justify-between mx-auto max-w-7xl px-6 pb-10">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link aria-label="Logo" href="#" className={Underline}>
            <DIcons.X className="h-5 w-5" />
          </Link>
          <Link aria-label="Logo" href="#" className={Underline}>
            <DIcons.Instagram className="h-5 w-5" />
          </Link>
          <Link aria-label="Logo" href="#" className={Underline}>
            <DIcons.LinkedIn className="h-5 w-5" />
          </Link>
        </div>
        <ThemeToogle />
      </div>

      <div className="mx-auto mb-10 flex flex-col justify-between text-center text-xs md:max-w-7xl mt-4">
        <div className="flex flex-row items-center justify-center gap-1 text-foreground/50">
          <span> © {new Date().getFullYear()} PeerGig. All rights reserved. </span>
        </div>
      </div>
    </footer>
  );
}
