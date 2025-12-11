'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Grid3x3, Lightbulb, FolderKanban } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  {
    href: '/matrix',
    label: 'Matrix',
    icon: Grid3x3,
  },
  {
    href: '/ideas',
    label: 'Ideas',
    icon: Lightbulb,
  },
  {
    href: '/categories',
    label: 'Categories',
    icon: FolderKanban,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-8">
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Impact Matrix</span>
          </div>

          <div className="flex gap-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
