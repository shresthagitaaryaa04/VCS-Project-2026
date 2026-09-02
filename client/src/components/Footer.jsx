const Footer = () => {
  return (
    <footer className="bg-card text-muted-foreground py-8 mt-auto border-t border-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/trek sathi logo.png" alt="Trek Sathi" className="h-7 w-auto object-contain opacity-80" />
          <span className="font-bold text-foreground text-sm">Trek Sathi</span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Find Your Trail. Find Your Sathi. &nbsp;·&nbsp; &copy; {new Date().getFullYear()} Trek Sathi. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;