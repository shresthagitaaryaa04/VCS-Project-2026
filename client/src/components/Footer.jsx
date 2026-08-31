const Footer = () => {
  return (
    <footer className="bg-[#0a1f14] text-gray-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/trek sathi logo.png" alt="Trek Sathi" className="h-7 w-auto object-contain opacity-80" />
          <span className="font-bold text-white text-sm">Trek Sathi</span>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Find Your Trail. Find Your Sathi. &nbsp;·&nbsp; &copy; {new Date().getFullYear()} Trek Sathi. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;