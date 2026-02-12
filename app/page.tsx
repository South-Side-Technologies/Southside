import React from 'react'
import Link from 'next/link'
import { CloudIcon, CostIcon, AutomationIcon, AIIcon, WebDevIcon, HostingIcon, SecurityIcon, CiCdIcon, VirtualTrainingIcon, ManagedDeployIcon } from './components/Icons'
import { ScrollAnimation, AnimatedCounter } from './components/Animations'
import ChatWidget from './components/ChatWidget'
import Header from './components/Header'
import Footer from './components/Footer'

const ServiceCard = ({ icon: Icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-white rounded-xl p-6 md:p-8 shadow-md hover:shadow-xl transition-shadow border-t-4 border-red-700 group h-full flex flex-col">
    <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform">
      {Icon}
    </div>
    <h3 className="text-lg md:text-xl font-bold text-black mb-3 font-playfair text-center">{title}</h3>
    <p className="text-gray-700 text-sm md:text-base text-center">{description}</p>
  </div>
)

export default function Home() {
  return (
    <>
      {/* Header */}
      <Header variant="public" />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-red-50 to-red-100 py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-6xl mx-auto text-center mb-12 md:mb-20">
            <ScrollAnimation animation="slide-up">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 font-playfair">Transforming Businesses Through Technology</h2>
            </ScrollAnimation>
            <ScrollAnimation animation="slide-up" delay={100}>
              <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">From startups to enterprises, we provide scalable solutions that drive growth, reduce costs, and automate your operations</p>
            </ScrollAnimation>
            <ScrollAnimation animation="slide-up" delay={200}>
              <p className="text-base md:text-lg font-semibold text-red-700 mt-6">U.S.A Owned and Operated</p>
            </ScrollAnimation>
          </div>

          {/* Services Grid */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((delay, idx) => (
              <ScrollAnimation key={idx} animation="bounce-in" delay={delay}>
                {idx === 0 && <ServiceCard icon={<CloudIcon />} title="Cloud Infrastructure" description="Scalable cloud management optimized for performance, security, and cost efficiency for any business size." />}
                {idx === 1 && <ServiceCard icon={<CostIcon />} title="Cost Optimization" description="Reduce cloud spending by up to 40% with intelligent resource allocation and smart monitoring." />}
                {idx === 2 && <ServiceCard icon={<AutomationIcon />} title="Process Automation" description="Eliminate manual tasks and boost productivity with intelligent workflow automation." />}
                {idx === 3 && <ServiceCard icon={<AIIcon />} title="AI Services" description="Deploy smart chatbots and AI solutions to enhance customer experience and support." />}
                {idx === 4 && <ServiceCard icon={<WebDevIcon />} title="Web Development" description="Beautiful, fast, and responsive web applications built with cutting-edge technology." />}
                {idx === 5 && <ServiceCard icon={<HostingIcon />} title="Web Hosting" description="Reliable, scalable hosting with 99.99% uptime and 24/7 expert support." />}
                {idx === 6 && <ServiceCard icon={<SecurityIcon />} title="Security Engineering & Zero Trust" description="Zero Trust architecture, identity-first access, secure remote entry, and ransomware blast-radius reduction." />}
                {idx === 7 && <ServiceCard icon={<CiCdIcon />} title="CI/CD Pipelines" description="Automated build, test, and deployment pipelines for faster, safer releases." />}
                {idx === 8 && <ServiceCard icon={<VirtualTrainingIcon />} title="Virtual Training Environments" description="Secure, realistic training labs with role-based access, scenario content, and progress tracking." />}
                {idx === 9 && <ServiceCard icon={<ManagedDeployIcon />} title="Deployment & Managed Services" description="Deploy, monitor, and manage production systems with patching, observability, and lifecycle support." />}
              </ScrollAnimation>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation animation="slide-up">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-12 font-playfair text-center">Why Choose South Side Tech?</h2>
            </ScrollAnimation>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[0, 100, 200].map((delay, idx) => (
                <ScrollAnimation key={idx} animation="slide-up" delay={delay}>
                  <div className="text-center group hover:transform hover:scale-105 transition-transform duration-300">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 group-hover:shadow-lg transition-all">
                      <span className="text-2xl font-bold text-red-700">
                        {idx === 0 && <AnimatedCounter target={15} suffix="+" />}
                        {idx === 1 && <AnimatedCounter target={1000} suffix="+" />}
                        {idx === 2 && '<24h'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-2 font-playfair">
                      {idx === 0 && 'Years Experience'}
                      {idx === 1 && 'Automation Workflows'}
                      {idx === 2 && 'Response Time'}
                    </h3>
                    <p className="text-gray-700">
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
        <section id="chatbot" className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-red-50 via-white to-red-100 scroll-mt-24 md:scroll-mt-32">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div>
              <ScrollAnimation animation="slide-up">
                <p className="text-sm font-semibold text-red-700 tracking-[0.2em] uppercase mb-3">Instant Support</p>
              </ScrollAnimation>
              <ScrollAnimation animation="slide-up" delay={100}>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-5 font-playfair">Chat with our automated assistant</h2>
              </ScrollAnimation>
              <ScrollAnimation animation="slide-up" delay={200}>
                <p className="text-gray-700 text-lg md:text-xl mb-6">
                  Get answers about automation, cloud optimization, or web development in seconds. Our AI assistant
                  connects directly to our n8n workflows for fast routing and follow-up.
                </p>
              </ScrollAnimation>
              <ScrollAnimation animation="slide-up" delay={300}>
                <div className="flex flex-wrap gap-3">
                  {['Service fit', 'Automation ideas', 'Project timelines', 'Budget guidance'].map((pill) => (
                    <span key={pill} className="bg-white border border-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
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
