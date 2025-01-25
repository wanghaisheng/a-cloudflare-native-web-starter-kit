import { Code2Icon, ShieldIcon, ZapIcon, DatabaseIcon, CloudIcon, RocketIcon, SparklesIcon, SmartphoneIcon } from 'lucide-react'

const primaryFeatures = [
  {
    title: 'Cross-Platform Mobile',
    description:
      'Build native mobile applications with Expo that work seamlessly across iOS and Android platforms.',
    icon: SmartphoneIcon,
    secondaryIcon: RocketIcon,
  },
  {
    title: 'Edge Computing',
    description:
      'Leverage Cloudflare Workers for serverless compute at the edge, bringing your code closer to your users.',
    icon: CloudIcon,
    secondaryIcon: ZapIcon,
  },
  {
    title: 'Secure Authentication',
    description:
      'Built-in authentication with Clerk ensures your users and data remain protected with enterprise-grade security.',
    icon: ShieldIcon,
    secondaryIcon: SparklesIcon,
  },
  {
    title: 'Edge Database & Storage',
    description:
      'Store and retrieve data efficiently with D1 Database and R2 Storage, optimized for edge computing.',
    icon: DatabaseIcon,
    secondaryIcon: Code2Icon,
  },
]

export function PrimaryFeatures() {
  return (
    <section
      id="features"
      aria-label="Primary features"
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-24 sm:py-32"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-cyan-500/5 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-orange-400">Production Ready</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to build AI apps
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Start with a fully configured development environment and production-ready infrastructure.
            Focus on building your AI features, not setting up tooling.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            {primaryFeatures.map((feature) => (
              <div key={feature.title} className="group relative">
                {/* Glassmorphism card */}
                <div className="relative overflow-hidden rounded-2xl bg-white/[0.07] p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-[6px] border border-white/[0.18] transition-all duration-300 hover:bg-white/[0.1] hover:shadow-orange-500/25">
                  <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  {/* Content */}
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="rounded-xl bg-orange-600/20 p-2.5">
                        <feature.icon className="h-6 w-6 text-orange-400" aria-hidden="true" />
                      </div>
                      <div className="rounded-xl bg-gray-800/50 p-2">
                        <feature.secondaryIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                    </div>
                    <dt className="text-xl font-semibold leading-7 text-white">{feature.title}</dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
} 