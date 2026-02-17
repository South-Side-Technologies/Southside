import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { ScrollAnimation } from '@/app/components/Animations'
import { getServiceBySlug, getAllServiceSlugs } from '@/app/data/services'
import {
  CloudIcon,
  CostIcon,
  AutomationIcon,
  AIIcon,
  WebDevIcon,
  HostingIcon,
  SecurityIcon,
  CiCdIcon,
  VirtualTrainingIcon,
  ManagedDeployIcon,
} from '@/app/components/Icons'

const iconMap = {
  CloudIcon,
  CostIcon,
  AutomationIcon,
  AIIcon,
  WebDevIcon,
  HostingIcon,
  SecurityIcon,
  CiCdIcon,
  VirtualTrainingIcon,
  ManagedDeployIcon,
}

export async function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({
    slug,
  }))
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug)

  if (!service) {
    notFound()
  }

  const IconComponent = iconMap[service.iconKey as keyof typeof iconMap] || CloudIcon

  return (
    <>
      <Header variant="public" />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="section-accent py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <ScrollAnimation animation="slide-up">
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 p-4 rounded-full">
                  <IconComponent />
                </div>
              </div>
            </ScrollAnimation>
            <ScrollAnimation animation="slide-up" delay={100}>
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 font-playfair">{service.headline}</h1>
            </ScrollAnimation>
            <ScrollAnimation animation="slide-up" delay={200}>
              <p className="text-lg md:text-xl text-secondary max-w-3xl mx-auto">{service.summary}</p>
            </ScrollAnimation>
          </div>
        </section>

        {/* Features Grid */}
        <section className="section-light py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation animation="slide-up">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 font-playfair text-center">
                Key Features
              </h2>
            </ScrollAnimation>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {service.features.map((feature, idx) => (
                <ScrollAnimation
                  key={idx}
                  animation="bounce-in"
                  delay={idx * 100}
                >
                  <div className="service-card">
                    <h3 className="text-lg font-bold text-primary mb-3 font-playfair">{feature.title}</h3>
                    <p className="text-secondary">{feature.description}</p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section-dark py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation animation="slide-up">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 font-playfair text-center">
                Business Benefits
              </h2>
            </ScrollAnimation>
            <div className="space-y-4">
              {service.benefits.map((benefit, idx) => (
                <ScrollAnimation key={idx} animation="slide-up" delay={idx * 50}>
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="stat-badge-light w-10 h-10">
                        <span className="text-sm font-bold text-red-700
                      </div>
                    </div>"
                    <<p className="text-secondary text-lg">{benefit}</p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-accent py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollAnimation animation="slide-up">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 font-playfair">
                Ready to get started?
              </h2>
            </ScrollAnimation>
            <ScrollAnimation animation="slide-up" delay={100}>
              <p className="text-lg text-secondary mb-8">
                Let's discuss how {service.title} can transform your business.
              </p>
            </ScrollAnimation>
            <ScrollAnimation animation="slide-up" delay={200}>
              <a
                href="/#chatbot"
                className="inline-block bg-red-700 hover:bg-red-800:bg-red-800 text-white font-semibold py-4 px-8 rounded-xl transition-all"
              >
                Chat with us about {service.title}
              </a>
            </ScrollAnimation>
          </div>
        </section>
      </main>
      <Footer variant="full" />
    </>
  )
}
