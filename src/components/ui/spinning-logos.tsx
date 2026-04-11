"use client";

import React from 'react';
import { 
  BookOpen, 
  PenTool, 
  Calculator, 
  Code, 
  Microscope, 
  Database,
  Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const SpinningLogos: React.FC = () => {
  const radiusToCenterOfIcons = 180;
  const iconWrapperWidth = 60;
  const ringPadding = 40;

  const toRadians = (degrees: number): number => (Math.PI / 180) * degrees;

  const logos = [
    { Icon: Code, className: 'bg-purple-600 text-white', name: 'Programming' },
    { Icon: BookOpen, className: 'bg-red-600 text-white', name: 'Literature' },
    { Icon: Calculator, className: 'bg-orange-600 text-white', name: 'Math' },
    { Icon: Database, className: 'bg-blue-600 text-white', name: 'Data Structures' },
    { Icon: Microscope, className: 'bg-indigo-600 text-white', name: 'Science' },
    { Icon: PenTool, className: 'bg-blue-500 text-white', name: 'Design' },
    { Icon: Pencil, className: 'bg-red-500 text-white', name: 'Writing' },
  ];

  return (
    <div className="flex justify-center items-center py-20 bg-background overflow-hidden relative">
      <div
        style={{
          width: radiusToCenterOfIcons * 2 + iconWrapperWidth + ringPadding,
          height: radiusToCenterOfIcons * 2 + iconWrapperWidth + ringPadding,
        }}
        className="relative rounded-full bg-muted/20 shadow-sm border border-border"
      >
        <div className="absolute inset-0 animate-spin-slow">
          {logos.map((logo, index) => {
            const angle = (360 / logos.length) * index;
            return (
              <div
                key={index}
                style={{
                  top: `calc(50% - ${iconWrapperWidth / 2}px + ${radiusToCenterOfIcons * Math.sin(toRadians(angle))}px)`,
                  left: `calc(50% - ${iconWrapperWidth / 2}px + ${radiusToCenterOfIcons * Math.cos(toRadians(angle))}px)`,
                  width: iconWrapperWidth,
                  height: iconWrapperWidth,
                }}
                className={cn(
                  "absolute flex items-center justify-center rounded-full shadow-md border-2 border-background animate-spin-reverse",
                  logo.className
                )}
                aria-label={`${logo.name} logo`}
              >
                <logo.Icon className="w-6 h-6" />
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background rounded-full w-3/4 h-3/4 flex items-center justify-center shadow-inner border border-border text-center flex-col gap-2 p-4">
             <h3 className="text-xl font-bold font-headline text-foreground">Top Students</h3>
             <p className="text-sm text-foreground/60">Trusted by thousands from IITs/NITs</p>
          </div>
        </div>
      </div>
    </div>
  );
};
