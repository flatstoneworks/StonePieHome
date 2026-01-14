interface WallpaperBackgroundProps {
  wallpaperUrl?: string
}

export function WallpaperBackground({ wallpaperUrl }: WallpaperBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10">
      {wallpaperUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{ backgroundImage: `url(${wallpaperUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      )}
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  )
}
