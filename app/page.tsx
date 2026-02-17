import React from 'react'
import Link from 'next/link'
import { CloudIcon, CostIcon, AutomationIcon, AIIcon, WebDevIcon, HostingIcon, SecurityIcon, CiCdIcon, VirtualTrainingIcon, ManagedDeployIcon } from './components/Icons'
import { ScrollAnimation, AnimatedCounter } from './components/Animations'
import ChatWidget from './components/ChatWidget'
import Header from './components/Header'
import Footer from './components/Footer'

const ServiceCard = ({ icon: Icon, title, description, slug }: { icon: React.ReactNode; title: string; description: string; slug: string }) => (
  <Link href={`/services/${slug}`} className="service-card group block w-full cursor-pointer">
    <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform">
      {Icon}
    </div>
    <h3 className="text-lg md:text-xl font-bold text-primary mb-3 font-playfair text-center">{title}</h3>
    <p className="text-secondary text-sm md:text-base text-center">{description}</p>
  </Link>
)

export default function Home() {
  return (
    <>
      {/* Header */}
      <Header variant="public" />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="section-accent py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-6xl mx-auto text-center mb-12 md:mb-20">
            <ScrollAnimation animation="slide-up">
              <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6 font-playfair">Transforming Businesses Through Technology</h2>
            </ScrollAnimation>
            <ScrollAnimation animation="slide-up" delay={100}>
              <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto">From startups to enterprises, we provide scalable solutions that drive growth, reduce costs, and automate your operations</p>
            </ScrollAnimation>
            <ScrollAnimation animation="slide-up" delay={200}>
              <p className="text-base md:text-lg font-semibold text-red-700 mt-6">U.S.A Owned and Operated</p>
            </ScrollAnimation>
          </div>

          {/* Services Grid */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((delay, idx) => (
              <ScrollAnimation key={idx} animation="bounce-in" delay={delay}>
                {idx === 0 && <ServiceCard icon={<CloudIcon />} title="Cloud Infrastructure" description="Scalable cloud management optimized for performance, security, and cost efficiency for any business size." slug="cloud-infrastructure" />}
                {idx === 1 && <ServiceCard icon={<CostIcon />} title="Cost Optimization" description="Reduce cloud spending by up to 40% with intelligent resource allocation and smart monitoring." slug="cost-optimization" />}
                {idx === 2 && <ServiceCard icon={<AutomationIcon />} title="Process Automation" description="Eliminate manual tasks and boost productivity with intelligent workflow automation." slug="process-automation" />}
                {idx === 3 && <ServiceCard icon={<AIIcon />} title="AI Services" description="Deploy smart chatbots and AI solutions to enhance customer experience and support." slug="ai-services" />}
                {idx === 4 && <ServiceCard icon={<WebDevIcon />} title="Web Development" description="Beautiful, fast, and responsive web applications built with cutting-edge technology." slug="web-development" />}
                {idx === 5 && <ServiceCard icon={<HostingIcon />} title="Web Hosting" description="Reliable, scalable hosting with 99.99% uptime and 24/7 expert support." slug="web-hosting" />}
                {idx === 6 && <ServiceCard icon={<SecurityIcon />} title="Security Engineering & Zero Trust" description="Zero Trust architecture, identity-first access, secure remote entry, and ransomware blast-radius reduction." slug="security-engineering" />}
                {idx === 7 && <ServiceCard icon={<CiCdIcon />} title="CI/CD Pipelines" description="Automated build, test, and deployment pipelines for faster, safer releases." slug="ci-cd-pipelines" />}
                {idx === 8 && <ServiceCard icon={<VirtualTrainingIcon />} title="Virtual Training Environments" description="Secure, realistic training labs with role-based access, scenario content, and progress tracking." slug="virtual-training" />}
                {idx === 9 && <ServiceCard icon={<ManagedDeployIcon />} title="Deployment & Managed Services" description="Deploy, monitor, and manage production systems with patching, observability, and lifecycle support." slug="managed-deployment" />}
              </ScrollAnimation>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="section-light py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation animation="slide-up">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 font-playfair text-center">Why Choose South Side Tech?</h2>
            </ScrollAnimation>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[0, 100, 200].map((delay, idx) => (
                <ScrollAnimation key={idx} animation="slide-up" delay={delay}>
                  <div className="text-center group hover:transform hover:scale-105 transition-transform duration-300">
                    <div className="stat-badge-light mx-auto mb-4">
                      <span className="stat-badge-text">
                        {idx === 0 && <AnimatedCounter target={15} suffix="+" />}
                        {idx === 1 && <AnimatedCounter target={1000} suffix="+" />}
                        {idx === 2 && '<24h'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-2 font-playfair">
                      {idx === 0 && 'Years Experience'}
                      {idx === 1 && 'Automation Workflows'}
                      {idx === 2 && 'Response Time'}
                    </h3>
                    <p className="text-secondary">
                      {idx === 0 && 'Proven expertise in helping businesses of all sizes optimize their tech'}
                      {idx === 1 && 'We\'ve automated thousands of workflows for businesses nationwide'}
                      {idx === 2 && 'Quick response times from our U.S.-based team'}
                    </p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>

        {/* Chatbot Section */}
        <section id="chatbot" className="section-accent py-16 md:py-24 px-4 md:px-6 scroll-mt-24 md:scroll-mt-32">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div>
              <ScrollAnimation animation="slide-up">
                <p className="text-sm font-semibold text-red-700 tracking-[0.2em] uppercase mb-3">Instant Support</p>
              </ScrollAnimation>
              <ScrollAnimation animation="slide-up" delay={100}>
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-5 font-playfair">Chat with our automated assistant</h2>
              </ScrollAnimation>
              <ScrollAnimation animation="slide-up" delay={200}>
                <p className="text-secondary text-lg md:text-xl mb-6">
                  Get answers about automation, cloud optimization, or web development in seconds. Our AI assistant
                  connects directly to our n8n workflows for fast routing and follow-up.
                </p>
              </ScrollAnimation>
              <ScrollAnimation animation="slide-up" delay={300}>
                <div className="flex flex-wrap gap-3">
                  {['Service fit', 'Automation ideas', 'Project timelines', 'Budget guidance'].map((pill) => (
                    <span key={pill} className="badge-accent">
                      {pill}
                    </span>
                  ))}
                </div>
              </ScrollAnimation>
            </div>
            <ScrollAnimation animation="slide-in-right">
              <ChatWidget />
            </ScrollAnimation>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer variant="full" />
    </>
  )
}
