import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-12 border-t bg-background">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto">
        <div className="mb-8 md:mb-0">
          <div className="text-xl font-black text-foreground mb-2 font-headline">PeerGig</div>
          <p className="text-sm tracking-wide text-muted-foreground">© 2024 PeerGig. The Digital Atelier for Academic Growth.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-sm tracking-wide">
          <Link className="text-muted-foreground hover:text-primary transition-colors" href="#">Terms of Service</Link>
          <Link className="text-muted-foreground hover:text-primary transition-colors" href="#">Privacy Policy</Link>
          <Link className="text-muted-foreground hover:text-primary transition-colors" href="#">Student Guarantee</Link>
          <Link className="text-muted-foreground hover:text-primary transition-colors" href="#">Support</Link>
        </div>
      </div>
    </footer>
  );
}
