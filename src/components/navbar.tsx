import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-black text-foreground tracking-tighter font-headline">
          PeerGig
        </div>
        <div className="hidden md:flex items-center space-x-8 font-headline font-semibold tracking-tight">
          <Link className="text-muted-foreground hover:text-foreground transition-colors" href="#">Marketplace</Link>
          <Link className="text-muted-foreground hover:text-foreground transition-colors" href="#">How it Works</Link>
          <Link className="text-muted-foreground hover:text-foreground transition-colors" href="#">Benefits</Link>
        </div>
        <div className="flex items-center space-x-6">
          <button className="text-muted-foreground font-semibold hover:text-foreground transition-colors">Log In</button>
          <Button variant="default" className="rounded-xl font-bold bg-[#904d00] hover:bg-[#ff8c00] text-white">
            Register
          </Button>
        </div>
      </div>
    </nav>
  );
}
