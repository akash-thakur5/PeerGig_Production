"use client";

import React from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "./button";

export function ChatbotLayout() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-medium">
            Have a doubt?
          </span>
        </button>
      ) : (
        <div className="bg-background rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden border border-border/50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">PeerGig Support</h4>
                <p className="text-xs text-primary-foreground/70">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-black/10 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-primary-foreground/80" />
            </button>
          </div>
          <div className="h-[300px] p-4 flex flex-col gap-4 overflow-y-auto bg-muted/30">
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted p-3 text-sm text-foreground shadow-sm">
                Hi! Need help finding the right topic or booking a session?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary/10 text-foreground p-3 text-sm shadow-sm">
                I'm looking for help with recursive functions.
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-border/50 bg-background flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-muted px-4 py-2 rounded-full text-sm outline-none focus:ring-1 focus:ring-primary/50 transition-all font-body text-foreground"
            />
            <Button size="icon" className="rounded-full shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
