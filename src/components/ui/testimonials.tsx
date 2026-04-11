"use client";

import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Aarav Sharma",
    role: "Engineering Student",
    content: "PeerGig completely changed how I prepare for exams. Instead of buying full courses, I only pay 49 rupees for specific doubts. It's incredibly affordable!",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    name: "Priya Patel",
    role: "Medical Student",
    content: "The tutors are all verified peers who actually know our curriculum. It feels less like formal tuition and more like studying with a smart senior.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    name: "Rohan Gupta",
    role: "Computer Science",
    content: "I started as a student, but after mastering Data Structures, I became a tutor here. Now I earn enough to cover my own college expenses!",
    rating: 4,
    avatar: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-muted overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Trusted by thousands of students
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed font-body">
            Don't just take our word for it. See what our community of learners and tutors have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="bg-background rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Star className="w-24 h-24 stroke-primary fill-primary" />
              </div>
              <div className="flex gap-1 mb-6 text-accent">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i < testimonial.rating ? "fill-accent" : "fill-transparent"
                    )}
                  />
                ))}
              </div>
              <p className="text-foreground/80 leading-relaxed mb-8 italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-primary/20"
                />
                <div>
                  <h4 className="font-headline font-bold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-foreground/60">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
