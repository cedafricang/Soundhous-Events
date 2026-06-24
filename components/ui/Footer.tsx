export default function Footer() {
  return (
    <footer className="border-t border-sand bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div>
            <div className="font-serif italic text-lg text-ink mb-2">
              soundhous <span className="text-copper">· reserve</span>
            </div>
            <p className="text-sm text-smoke leading-relaxed max-w-xs">
              17 Adeyemo Alakija Street, Victoria Island, Lagos.
            </p>
            <p className="text-xs text-smoke mt-1 font-mono">Monday – Saturday · 9am – 6pm WAT</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-copper tracking-widest uppercase mb-2">Contact</span>
            <a
              href="https://wa.me/2349027549690"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-smoke hover:text-ink transition-colors"
            >
              WhatsApp Concierge
            </a>
            <a href="mailto:reserve@soundhous.com" className="text-sm text-smoke hover:text-ink transition-colors">
              reserve@soundhous.com
            </a>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-copper tracking-widest uppercase mb-2">Platform</span>
            <a href="https://soundhous.com" target="_blank" rel="noopener noreferrer" className="text-sm text-smoke hover:text-ink transition-colors">
              soundhous.com
            </a>
          </div>
        </div>
        <div className="border-t border-stone mt-8 pt-4 flex justify-between items-center">
          <p className="text-xs text-smoke font-mono">© 2026 Soundhous. All rights reserved.</p>
          <p className="text-xs text-smoke font-mono">reserve.soundhous.com</p>
        </div>
      </div>
    </footer>
  )
}
