export type Service = {
  slug: string
  title: string
  shortDescription: string
  headline: string
  summary: string
  features: { title: string; description: string }[]
  benefits: string[]
  cta: string
  iconKey: string
}

export const services: Service[] = [
  {
    slug: 'cloud-infrastructure',
    title: 'Cloud Infrastructure',
    shortDescription: 'Scalable cloud management optimized for performance, security, and cost efficiency for any business size.',
    headline: 'Enterprise-Grade Cloud Infrastructure',
    summary: 'Leverage cloud technology to scale your operations efficiently. We design, deploy, and manage cloud architectures tailored to your business needs, ensuring optimal performance, security, and cost efficiency across AWS, Azure, Google Cloud, and hybrid environments.',
    features: [
      { title: 'Multi-Cloud Management', description: 'Seamless integration and management across AWS, Azure, and Google Cloud platforms' },
      { title: 'Auto-Scaling Solutions', description: 'Automatically adjust resources based on demand to optimize costs and performance' },
      { title: 'High Availability Design', description: 'Built-in redundancy and disaster recovery for 99.99% uptime guarantee' },
      { title: 'Security & Compliance', description: 'Industry-standard encryption, VPC isolation, and compliance with SOC 2, HIPAA, and PCI-DSS' },
      { title: 'Cost Optimization', description: 'Intelligent monitoring and optimization to reduce cloud spending by up to 40%' },
      { title: '24/7 Monitoring', description: 'Round-the-clock infrastructure monitoring with proactive alerts and incident response' },
    ],
    benefits: [
      'Scale from startup to enterprise without infrastructure complexity',
      'Reduce operational overhead with managed cloud services',
      'Gain compliance certifications faster with built-in security controls',
      'Achieve global reach with multi-region deployments',
      'Eliminate capital expenditure on hardware and servers',
    ],
    cta: 'Let\'s build your cloud foundation',
    iconKey: 'CloudIcon',
  },
  {
    slug: 'cost-optimization',
    title: 'Cost Optimization',
    shortDescription: 'Reduce cloud spending by up to 40% with intelligent resource allocation and smart monitoring.',
    headline: 'Cut Cloud Costs Without Sacrificing Performance',
    summary: 'Most organizations waste 20-40% of their cloud budget on unused or inefficiently allocated resources. Our cost optimization specialists analyze your infrastructure, identify waste, and implement smart strategies to reduce spending while improving performance.',
    features: [
      { title: 'Infrastructure Audit', description: 'Comprehensive analysis of your current cloud setup to identify cost-saving opportunities' },
      { title: 'Reserved Instance Strategy', description: 'Right-sizing and commitment-based purchasing to maximize discounts' },
      { title: 'Automated Resource Management', description: 'Smart tools that automatically turn off unused resources and optimize configurations' },
      { title: 'Cost Allocation & Tracking', description: 'Detailed billing dashboards that assign costs to business units and projects' },
      { title: 'Performance Benchmarking', description: 'Continuous monitoring to ensure cost cuts don\'t impact application performance' },
      { title: 'Vendor Negotiation', description: 'Leverage our relationships with cloud providers to secure better rates' },
    ],
    benefits: [
      'Save 20-40% on cloud spending immediately',
      'Improve cost visibility across teams and departments',
      'Scale infrastructure growth without proportional cost increases',
      'Redirect savings to innovation and development',
      'Maintain or improve application performance while reducing costs',
    ],
    cta: 'Audit your cloud spending today',
    iconKey: 'CostIcon',
  },
  {
    slug: 'process-automation',
    title: 'Process Automation',
    shortDescription: 'Eliminate manual tasks and boost productivity with intelligent workflow automation.',
    headline: 'Automate Repetitive Work and Boost Productivity',
    summary: 'Manual workflows waste thousands of hours annually. We design and implement intelligent automation solutions that eliminate repetitive tasks, reduce errors, and free your team to focus on strategic work that drives business growth.',
    features: [
      { title: 'Workflow Automation', description: 'Automated business processes using N8N, Zapier, and custom integrations' },
      { title: 'Data Pipeline Automation', description: 'Seamless data flow between systems with automated ETL and data transformation' },
      { title: 'Document Processing', description: 'AI-powered document recognition and automated data extraction' },
      { title: 'Notification & Alert Systems', description: 'Smart alerts and notifications that trigger workflows based on business events' },
      { title: 'Integration Architecture', description: 'Connect disparate systems and APIs for unified data and process flow' },
      { title: 'Custom Automation Builders', description: 'Low-code platforms to build automation without heavy development' },
    ],
    benefits: [
      'Save 5-10 hours per employee weekly on manual tasks',
      'Reduce human error by 80% in data processing',
      'Improve process completion time by 60%',
      'Free team bandwidth for higher-value strategic work',
      'Scale operations without proportional headcount increase',
    ],
    cta: 'Automate your first workflow',
    iconKey: 'AutomationIcon',
  },
  {
    slug: 'ai-services',
    title: 'AI Services',
    shortDescription: 'Deploy smart chatbots and AI solutions to enhance customer experience and support.',
    headline: 'Harness AI to Transform Your Business',
    summary: 'Artificial Intelligence is no longer a luxury—it\'s a competitive necessity. We help you deploy AI-powered solutions that improve customer service, automate complex tasks, and unlock insights from your data.',
    features: [
      { title: 'Intelligent Chatbots', description: 'AI chatbots that handle customer inquiries, support tickets, and lead qualification 24/7' },
      { title: 'Predictive Analytics', description: 'Machine learning models that forecast trends and enable data-driven decisions' },
      { title: 'Sentiment Analysis', description: 'Understand customer sentiment from text and voice data automatically' },
      { title: 'Custom AI Models', description: 'Build specialized AI models tailored to your specific business challenges' },
      { title: 'AI-Powered Search', description: 'Semantic search and recommendations that understand user intent' },
      { title: 'Process Intelligence', description: 'Analyze and optimize processes using AI-driven insights' },
    ],
    benefits: [
      'Reduce support ticket resolution time by 50%',
      'Improve customer satisfaction with instant, intelligent responses',
      'Unlock actionable insights from unstructured data',
      'Automate complex decision-making processes',
      'Gain competitive advantage through AI-powered personalization',
    ],
    cta: 'Explore AI for your business',
    iconKey: 'AIIcon',
  },
  {
    slug: 'web-development',
    title: 'Web Development',
    shortDescription: 'Beautiful, fast, and responsive web applications built with cutting-edge technology.',
    headline: 'Modern Web Applications That Drive Results',
    summary: 'Your website is your digital storefront. We build fast, responsive, and visually stunning web applications using modern frameworks like React, Next.js, and Vue that deliver seamless user experiences and convert visitors into customers.',
    features: [
      { title: 'Responsive Design', description: 'Perfect user experience on desktop, tablet, and mobile devices' },
      { title: 'High-Performance Architecture', description: 'Optimized for speed with lazy loading, caching, and CDN delivery' },
      { title: 'Modern Tech Stack', description: 'React, Next.js, Vue, and TypeScript for maintainable, scalable code' },
      { title: 'SEO Optimization', description: 'Built-in SEO best practices for search engine visibility' },
      { title: 'E-Commerce Integration', description: 'Shopify, Stripe, and custom payment solutions' },
      { title: 'Analytics & Tracking', description: 'Integrated analytics to understand user behavior and optimize conversion' },
    ],
    benefits: [
      'Load pages 3x faster than competitor websites',
      'Increase conversion rates with optimized user experience',
      'Rank higher in search results with built-in SEO',
      'Scale to millions of users with cloud-native architecture',
      'Reduce maintenance overhead with modern frameworks',
    ],
    cta: 'Start your web project',
    iconKey: 'WebDevIcon',
  },
  {
    slug: 'web-hosting',
    title: 'Web Hosting',
    shortDescription: 'Reliable, scalable hosting with 99.99% uptime and 24/7 expert support.',
    headline: 'Enterprise Web Hosting Built for Performance and Reliability',
    summary: 'Unreliable hosting loses customers and damages your brand. We provide enterprise-grade hosting with 99.99% uptime guarantee, lightning-fast performance, automatic scaling, and white-glove support.',
    features: [
      { title: '99.99% Uptime SLA', description: 'Guaranteed uptime with automatic failover and redundancy' },
      { title: 'Auto-Scaling', description: 'Automatically handle traffic spikes without performance degradation' },
      { title: 'DDoS Protection', description: 'Built-in protection against distributed denial-of-service attacks' },
      { title: 'SSL/TLS Security', description: 'Free automated SSL certificates and security headers' },
      { title: 'CDN Integration', description: 'Global content delivery network for instant load times worldwide' },
      { title: '24/7 Expert Support', description: 'Round-the-clock support from experienced DevOps engineers' },
    ],
    benefits: [
      'Never worry about server downtime again',
      'Serve global customers with lightning-fast performance',
      'Protect your site and customers with enterprise security',
      'Scale from hundreds to millions of visitors effortlessly',
      'Reduce operational complexity with managed hosting',
    ],
    cta: 'Move to reliable hosting',
    iconKey: 'HostingIcon',
  },
  {
    slug: 'security-engineering',
    title: 'Security Engineering & Zero Trust',
    shortDescription: 'Zero Trust architecture, identity-first access, secure remote entry, and ransomware blast-radius reduction.',
    headline: 'Build an Impenetrable Security Fortress',
    summary: 'In today\'s threat landscape, traditional security perimeters are obsolete. We implement Zero Trust architecture that assumes no user or device is trusted by default, protecting your organization from breaches, ransomware, and insider threats.',
    features: [
      { title: 'Zero Trust Architecture', description: 'Verify every user and device before granting access, regardless of location' },
      { title: 'Identity-First Security', description: 'Strong authentication, MFA, and identity governance across all systems' },
      { title: 'Secure Remote Access', description: 'VPN-less remote access with fine-grained permission controls' },
      { title: 'Ransomware Defense', description: 'Blast-radius reduction, immutable backups, and threat detection' },
      { title: 'Security Audits', description: 'Penetration testing, vulnerability assessments, and compliance reviews' },
      { title: 'Threat Monitoring', description: '24/7 SIEM monitoring with automated threat detection and response' },
    ],
    benefits: [
      'Reduce breach risk by 85% with Zero Trust implementation',
      'Eliminate VPN complexity while improving security',
      'Meet compliance requirements (SOC 2, ISO 27001, HIPAA, PCI-DSS)',
      'Detect and respond to threats in minutes, not hours',
      'Protect against ransomware with automatic backup isolation',
    ],
    cta: 'Implement Zero Trust security',
    iconKey: 'SecurityIcon',
  },
  {
    slug: 'ci-cd-pipelines',
    title: 'CI/CD Pipelines',
    shortDescription: 'Automated build, test, and deployment pipelines for faster, safer releases.',
    headline: 'Deploy Code With Confidence Every Single Day',
    summary: 'Manual deployments are slow, error-prone, and risky. We build automated CI/CD pipelines that test every change, catch bugs early, and deploy safely—enabling teams to ship code multiple times per day without fear.',
    features: [
      { title: 'Continuous Integration', description: 'Automated testing, code quality checks, and build verification on every commit' },
      { title: 'Automated Testing', description: 'Unit, integration, and E2E tests that catch bugs before production' },
      { title: 'Deployment Automation', description: 'Automated deployments with zero-downtime updates and instant rollback' },
      { title: 'Environment Management', description: 'Consistent development, staging, and production environments' },
      { title: 'Pipeline Monitoring', description: 'Real-time visibility into pipeline status and deployment metrics' },
      { title: 'Release Orchestration', description: 'Coordinate complex deployments across multiple services and teams' },
    ],
    benefits: [
      'Deploy 10x more frequently with automated pipelines',
      'Catch bugs 80% faster with automated testing',
      'Reduce deployment failures by 95%',
      'Enable teams to move at startup speed',
      'Maintain high code quality while increasing velocity',
    ],
    cta: 'Automate your deployments',
    iconKey: 'CiCdIcon',
  },
  {
    slug: 'virtual-training',
    title: 'Virtual Training Environments',
    shortDescription: 'Secure, realistic training labs with role-based access, scenario content, and progress tracking.',
    headline: 'Create Immersive, Realistic Training Experiences',
    summary: 'Traditional training videos and manuals don\'t stick. We build interactive virtual training environments where learners practice real-world skills in safe, controlled environments with hands-on labs and scenario-based learning.',
    features: [
      { title: 'Hands-On Labs', description: 'Realistic cloud and on-premises environments where trainees practice skills' },
      { title: 'Scenario-Based Learning', description: 'Real-world scenarios that teach troubleshooting, security, and best practices' },
      { title: 'Role-Based Access', description: 'Customize environments for different skill levels and roles' },
      { title: 'Progress Tracking', description: 'Detailed analytics on learner progress, scores, and competency development' },
      { title: 'Automated Lab Reset', description: 'Automatic environment cleanup between exercises for cost efficiency' },
      { title: 'Content Library', description: 'Pre-built course content or custom scenarios tailored to your curriculum' },
    ],
    benefits: [
      'Improve knowledge retention by 75% with hands-on practice',
      'Reduce training time by 30% with interactive learning',
      'Scale training globally without increasing instructor workload',
      'Certify competency through measurable skill validation',
      'Reduce training costs while improving outcomes',
    ],
    cta: 'Build your training program',
    iconKey: 'VirtualTrainingIcon',
  },
  {
    slug: 'managed-deployment',
    title: 'Deployment & Managed Services',
    shortDescription: 'Deploy, monitor, and manage production systems with patching, observability, and lifecycle support.',
    headline: 'Hands-Off Production Management',
    summary: 'Running production systems is complex and never-ending. We take over the operational burden with managed services that handle deployments, monitoring, patching, and optimization so your team can focus on building, not firefighting.',
    features: [
      { title: 'Deployment Management', description: 'Expert deployment planning, execution, and post-deployment validation' },
      { title: '24/7 Monitoring', description: 'Continuous system monitoring with automated alerting and incident response' },
      { title: 'Patch Management', description: 'Security and stability patches deployed safely without downtime' },
      { title: 'Observability', description: 'Centralized logging, metrics, and distributed tracing for full system visibility' },
      { title: 'Capacity Planning', description: 'Proactive resource planning to prevent performance issues' },
      { title: 'Incident Response', description: 'Expert on-call support with rapid incident detection and resolution' },
    ],
    benefits: [
      'Eliminate on-call burden and operational stress',
      'Reduce mean-time-to-resolution (MTTR) by 70%',
      'Prevent 95% of outages through proactive monitoring',
      'Keep systems secure with automated patching',
      'Focus team on product development, not operations',
    ],
    cta: 'Transition to managed services',
    iconKey: 'ManagedDeployIcon',
  },
]

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug)
}

export function getAllServiceSlugs(): string[] {
  return services.map((s) => s.slug)
}
