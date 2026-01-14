import { useEffect, useState } from 'react'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

interface GreetingProps {
  userName: string
}

export function Greeting({ userName }: GreetingProps) {
  const [greeting, setGreeting] = useState(getGreeting())

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting())
    }, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-center py-6">
      <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
        {greeting}, {userName}.
      </h1>
    </div>
  )
}
