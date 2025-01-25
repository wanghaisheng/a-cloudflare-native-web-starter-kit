import { BookOpenIcon, PuzzleIcon, WorkflowIcon, BotIcon } from 'lucide-react'

const secondaryFeatures = [
  {
    name: 'AI Story Generation',
    summary: 'Powered by Workers AI',
    description:
      'Generate AI-powered stories about users\' daily activities and create accompanying images using Cloudflare Workers AI capabilities.',
    icon: BotIcon,
  },
  {
    name: 'Example Implementation',
    summary: 'Learn by example',
    description:
      'Includes a complete example app showcasing authentication, AI processing, background jobs, and database patterns. Use it as a reference or starting point.',
    icon: BookOpenIcon,
  },
  {
    name: 'Integration Patterns',
    summary: 'Best practices built-in',
    description:
      'See how to integrate Clerk auth, Workers AI, D1 database, and R2 storage with proper error handling and type safety using tRPC.',
    icon: PuzzleIcon,
  },
  {
    name: 'Durable Workflows',
    summary: 'Reliable AI processing',
    description:
      'Process AI tasks reliably with durable Cloudflare Workers, ensuring your AI operations complete successfully even with longer processing times.',
    icon: WorkflowIcon,
  },
]

export function SecondaryFeatures() {
  return (
    <section
      id="secondary-features"
      aria-label="Features for building modern applications"
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-950 py-24 sm:py-32"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-cyan-500/5 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-orange-400">AI-First Development</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built for AI applications
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Includes everything you need to build AI-powered applications with proper error handling,
            scalability, and user experience best practices.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {secondaryFeatures.map((feature) => (
              <div key={feature.name} className="group relative">
                <div className="relative overflow-hidden rounded-2xl bg-white/[0.07] p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-[6px] border border-white/[0.18] transition-all duration-300 hover:bg-white/[0.1] hover:shadow-orange-500/25">
                  <div className="absolute -inset-px bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 transition duration-300 group-hover:opacity-100" />
                  
                  <div className="relative">
                    {/* Icon */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 backdrop-blur-sm">
                      <feature.icon className="h-6 w-6 text-orange-400" />
                    </div>

                    {/* Content */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold leading-8 tracking-tight text-white">
                        {feature.name}
                      </h3>
                      <p className="mt-2 text-base text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 