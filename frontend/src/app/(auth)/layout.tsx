export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-mountain-900 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85')` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-brand-900/60" />
        <div className="relative z-10 p-10">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500"><span className="text-lg text-white">&#9968;</span></div>
            <span className="font-display text-xl font-bold text-white">HimYatraa</span>
          </a>
        </div>
        <div className="relative z-10 p-10">
          <blockquote className="mb-6">
            <p className="font-display text-2xl font-bold leading-snug text-white">&ldquo;The mountains are calling and I must go.&rdquo;</p>
            <footer className="mt-3 text-sm text-white/60">— John Muir</footer>
          </blockquote>
          <div className="flex gap-6">
            {[['150+', 'Curated Treks'], ['50K+', 'Happy Trekkers'], ['4.9★', 'Avg Rating']].map(([val, label]) => (
              <div key={label}><div className="font-display text-2xl font-bold text-white">{val}</div><div className="text-xs text-white/50">{label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <a href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500"><span className="text-base text-white">&#9968;</span></div>
              <span className="font-display text-lg font-bold text-foreground">HimYatraa</span>
            </a>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
