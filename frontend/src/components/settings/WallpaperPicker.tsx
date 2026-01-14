import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WallpaperInfo } from '@/api/client'

interface WallpaperPickerProps {
  wallpapers: WallpaperInfo[]
  selectedId: string
  onSelect: (id: string) => void
  onUpload: (file: File) => void
  isUploading?: boolean
}

export function WallpaperPicker({
  wallpapers,
  selectedId,
  onSelect,
  onUpload,
  isUploading = false,
}: WallpaperPickerProps) {
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
      e.target.value = '' // Reset input
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Wallpaper</CardTitle>
        <Button variant="outline" size="sm" asChild disabled={isUploading}>
          <label className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {wallpapers.map((wallpaper) => (
            <button
              key={wallpaper.id}
              onClick={() => onSelect(wallpaper.id)}
              className={cn(
                'relative aspect-video rounded-lg overflow-hidden border-2 transition-all',
                'hover:ring-2 hover:ring-primary/50',
                selectedId === wallpaper.id
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent'
              )}
            >
              <img
                src={wallpaper.thumbnail_url}
                alt={wallpaper.name}
                className="w-full h-full object-cover"
              />
              {selectedId === wallpaper.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="bg-primary rounded-full p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
