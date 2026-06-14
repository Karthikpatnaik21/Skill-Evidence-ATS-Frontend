import type { MockTemplate, WeightsConfig } from './types';

export const defaultWeights: WeightsConfig = {
  fresher: {
    projectRelevance: 35,
    skillEvidence: 30,
    knowledgeDepth: 25,
    learningVelocity: 10,
    experienceMatch: 0,
    leadershipImpact: 0,
  },
  mid: {
    skillEvidence: 30,
    experienceMatch: 25,
    projectRelevance: 25,
    knowledgeDepth: 10,
    learningVelocity: 10,
    leadershipImpact: 0,
  },
  senior: {
    experienceMatch: 40,
    skillEvidence: 25,
    projectRelevance: 15,
    knowledgeDepth: 10,
    leadershipImpact: 10,
    learningVelocity: 0,
  },
};

export const mockTemplates: MockTemplate[] = [
  {
    id: 'fresher-python',
    name: 'Python/Backend Developer (Alex Carter - Fresher)',
    description: 'Demonstrates high capability and potential through deep open-source contributions and complex personal projects, overcoming a lack of professional experience.',
    jdText: `Position: Backend Engineer (Python)
Department: Engineering
Location: Remote (US/Canada)

Role Overview:
We are looking for a Backend Engineer to join our core API team. You will be building scalable RESTful APIs, optimizing database queries, and helping us deploy services onto AWS. 

Required Skills:
- Python (Flask/FastAPI)
- Relational Databases (PostgreSQL)
- RESTful API design & integration
- Understanding of AWS services (ECS, S3, RDS)

Preferred Skills:
- Redis/Caching strategies
- Docker containerization
- Open-source contributions
- CI/CD workflows (GitHub Actions)

Responsibilities:
- Build and maintain high-performance APIs
- Write clean, testable, and well-documented Python code
- Collaborate with frontend engineers to integrate services
- Optimize queries and schema designs for PostgreSQL`,
    resumeText: `ALEX CARTER
Email: alex.carter@dev.io | GitHub: github.com/alexcarter-dev | Web: alexcarter.dev

OBJECTIVE
Highly passionate self-taught developer with deep technical proficiency in Python backend architectures. Seeking a backend developer role where I can apply my experience in writing high-performance APIs and working on complex systems.

TECHNICAL SKILLS
- Languages: Python, JavaScript, SQL, HTML/CSS
- Frameworks: FastAPI, Flask, Express.js
- Tools/DB: PostgreSQL, Docker, Redis, Git, GitHub Actions, AWS (S3, ECS)

PROJECTS
1. FastQuery - Open-Source Database Cache Manager (Creator)
   - Created a Python-based Redis cache wrapper for FastAPI, saving up to 80% database load.
   - Built with FastAPI, Redis, and PostgreSQL. Used Docker for local development.
   - Garnered over 300+ stars on GitHub and accepted 15+ external pull requests.
2. Microchat - Real-Time API Gateway
   - Developed a distributed WebSockets server utilizing Python's asyncio and Redis Pub/Sub.
   - Deployed on AWS ECS using a custom Terraform file, handling 5,000+ concurrent connections.
   - Setup GitHub Actions CI/CD to run pytest suites and build Docker images.

ACHIEVEMENTS / WORK
- Core contributor to 'Python-FastAPI-Boilerplate' (50+ commits, 1,200+ stars).
- Successfully completed AWS Certified Cloud Practitioner (2025).
- Mentored 10+ students in Python programming during a local non-profit bootcamp.

EDUCATION
B.S. in Computer Science (Ongoing, Year 3) - State University`,
    jdParsed: {
      title: 'Backend Engineer (Python)',
      requiredSkills: ['Python', 'FastAPI/Flask', 'PostgreSQL', 'RESTful API Design', 'AWS'],
      preferredSkills: ['Redis/Caching', 'Docker', 'Open-Source', 'CI/CD'],
      responsibilities: ['Build & maintain APIs', 'Write clean testable code', 'PostgreSQL optimization', 'Frontend integration'],
      seniority: 'Junior / Mid-level',
      idealProfile: 'A developer with strong practical knowledge of Python async frameworks, database optimization, and deployment pipelines. Prior evidence of building APIs in production or equivalent complex hobby projects is highly desired.'
    },
    resumeParsed: {
      name: 'Alex Carter',
      skills: ['Python', 'FastAPI', 'Flask', 'PostgreSQL', 'Docker', 'Redis', 'Git', 'GitHub Actions', 'AWS (S3, ECS)', 'asyncio'],
      projects: [
        {
          title: 'FastQuery (Open-Source Cache Manager)',
          description: 'A Python-based Redis cache wrapper for FastAPI that reduces DB queries by 80%. 300+ GitHub stars. Built using Docker and PostgreSQL.',
          technologies: ['Python', 'FastAPI', 'Redis', 'PostgreSQL', 'Docker']
        },
        {
          title: 'Microchat (Real-Time API Gateway)',
          description: 'A distributed WebSockets API powered by asyncio and Redis Pub/Sub. Deployed on AWS ECS with auto-scaling configs, serving 5,000 concurrent sockets.',
          technologies: ['Python', 'asyncio', 'Redis', 'AWS ECS', 'GitHub Actions', 'Terraform']
        }
      ],
      experience: [], // 0 years
      education: [
        {
          degree: 'B.S. in Computer Science',
          school: 'State University',
          year: 'Expected 2027'
        }
      ],
      certifications: ['AWS Certified Cloud Practitioner'],
      achievements: [
        'Core contributor to FastAPI community boilerplate (1200+ stars)',
        'Built open source project FastQuery (300+ stars)',
        'Mentored 10+ peers in python coding'
      ]
    },
    skillEvidence: [
      {
        skillName: 'Python',
        isMentioned: true,
        projectUsageCount: 2,
        professionalExperienceYears: 0,
        leadershipUsage: true, // Created the open source project
        evidencePoints: [
          'Created FastQuery library using FastAPI (Python async framework)',
          'Authored complex asyncio WebSocket engine in Microchat project',
          'Core contributor to widely-used FastAPI boilerplate repo'
        ],
        score: 95
      },
      {
        skillName: 'FastAPI/Flask',
        isMentioned: true,
        projectUsageCount: 2,
        professionalExperienceYears: 0,
        leadershipUsage: false,
        evidencePoints: [
          'Used FastAPI as the primary backend framework for FastQuery and Microchat',
          'Configured async routes, dependency injection, and Pydantic validation schemas'
        ],
        score: 92
      },
      {
        skillName: 'PostgreSQL',
        isMentioned: true,
        projectUsageCount: 2,
        professionalExperienceYears: 0,
        leadershipUsage: false,
        evidencePoints: [
          'Designed relational database schema for FastQuery cache metrics',
          'Integrated SQLAlchemy ORM and optimized query execution paths'
        ],
        score: 80
      },
      {
        skillName: 'AWS',
        isMentioned: true,
        projectUsageCount: 1,
        professionalExperienceYears: 0,
        leadershipUsage: false,
        evidencePoints: [
          'Deployed Microchat to AWS ECS using Terraform scripts',
          'Configured AWS S3 buckets and IAM policies',
          'Earned the AWS Certified Cloud Practitioner credential'
        ],
        score: 75
      }
    ],
    projectRelevance: [
      {
        projectTitle: 'FastQuery',
        matchScore: 94,
        justification: 'Highly relevant backend infrastructure project addressing API scalability, database loads, and caching. Strong correlation with job requirements for RESTful APIs and PostgreSQL.',
        alignedSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis/Caching']
      },
      {
        projectTitle: 'Microchat',
        matchScore: 88,
        justification: 'Complex architectural project featuring real-time communications and AWS containerized deployment. Proves capability to deploy to cloud environments requested in JD.',
        alignedSkills: ['Python', 'asyncio', 'AWS ECS', 'Docker', 'CI/CD']
      }
    ],
    stageDetection: {
      detectedStage: 'fresher',
      detectedYearsOfExperience: 0,
      reasoning: 'Candidate lists active education, personal projects, and open source work, but has no documented professional roles, indicating a career stage of Fresher.'
    },
    scores: {
      knowledgeDepth: 88,
      learningVelocity: 95,
      leadershipImpact: 40,
      experienceMatch: 10
    }
  },
  {
    id: 'mid-react',
    name: 'Frontend Developer (Sarah Lin - Mid-Level)',
    description: 'Strong front-end developer with 3 years of commercial experience, showing great technical capability and solid alignment across all required frontend technologies.',
    jdText: `Position: Frontend Engineer (React/TS)
Company: SaaS Systems Ltd.

Role Description:
We are looking for a Mid-Level Frontend Engineer to scale our web applications. You will collaborate closely with UI/UX designers and backend developers to build pixel-perfect interfaces and manage complex application state.

Required Skills:
- React (hooks, context, performance optimization)
- TypeScript (strong typing, interfaces)
- Tailwind CSS
- State management (Zustand, Redux, or Recoil)

Preferred Skills:
- Experience with Next.js or Vite
- Unit testing with Jest/React Testing Library
- API integration with React Query / Axios`,
    resumeText: `SARAH LIN
Front-End Developer | Denver, CO | sarah.lin@email.com | github.com/sarahlin-dev

SUMMARY
Sleek front-end developer with 3 years of professional experience building responsive web applications. Specialized in React, TypeScript, and state optimization.

EXPERIENCE
Frontend Developer | InnovateTech Corp (2023 - Present)
- Developed customer-facing dashboards using React 18, TypeScript, and Tailwind CSS.
- Migrated legacy state management from Redux to Zustand, reducing bundle size by 15% and code complexity.
- Wrote 80+ unit tests using Jest and React Testing Library, boosting coverage from 40% to 75%.
- Integrated RESTful APIs using Axios and React Query, handling caching and pagination.

Junior Frontend Developer | PixelCraft Studio (2022 - 2023)
- Built interactive marketing pages and single page apps using React, HTML5, CSS3, and JavaScript.
- Collaborated on an internal UI component library styled with Tailwind CSS.

EDUCATION
B.S. in Software Engineering (2021) - Colorado State University

SKILLS
React, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, Zustand, Redux, React Query, Jest, Git, Vite`,
    jdParsed: {
      title: 'Frontend Engineer (React/TS)',
      requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'State Management (Zustand/Redux)'],
      preferredSkills: ['Vite/Next.js', 'Jest/RTL', 'React Query / Axios'],
      responsibilities: ['Scale web applications', 'Pixel-perfect UI design', 'Manage application state', 'Collaborate with backend/designers'],
      seniority: 'Mid-level (2-5 years)',
      idealProfile: 'A mid-level developer who can work independently on complex frontend codebases, has practical experience with component design systems, and understands state modeling and testing.'
    },
    resumeParsed: {
      name: 'Sarah Lin',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Redux', 'React Query', 'Jest', 'Git', 'Vite', 'HTML5', 'CSS3'],
      projects: [
        {
          title: 'InnovateTech Dashboard Suite',
          description: 'A data-heavy SaaS dashboard application featuring real-time charts and data tables. Developed entirely in React, TypeScript, and Tailwind CSS with Zustand.',
          technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'React Query']
        },
        {
          title: 'PixelCraft Shared UI Kit',
          description: 'A highly modular, accessible UI library built for cross-product branding. Documented with Storybook and styled using Tailwind.',
          technologies: ['React', 'Tailwind CSS', 'JavaScript']
        }
      ],
      experience: [
        {
          role: 'Frontend Developer',
          company: 'InnovateTech Corp',
          duration: '2023 - Present (2+ years)',
          description: 'Developed SaaS dashboards, optimized state management, and integrated backend APIs. Wrote Jest tests.'
        },
        {
          role: 'Junior Frontend Developer',
          company: 'PixelCraft Studio',
          duration: '2022 - 2023 (1 year)',
          description: 'Coded client responsive sites, assisted in frontend component libraries.'
        }
      ],
      education: [
        {
          degree: 'B.S. in Software Engineering',
          school: 'Colorado State University',
          year: '2021'
        }
      ],
      certifications: [],
      achievements: [
        'Boosted test coverage at InnovateTech from 40% to 75%',
        'Successfully migrated state logic to Zustand, speeding up rendering times'
      ]
    },
    skillEvidence: [
      {
        skillName: 'React',
        isMentioned: true,
        projectUsageCount: 2,
        professionalExperienceYears: 3,
        leadershipUsage: false,
        evidencePoints: [
          '3 years of commercial React development across two software firms',
          'Optimized React renders and replaced complex Redux architectures with custom hooks and Zustand',
          'Authored modular component systems in InnovateTech Dashboards'
        ],
        score: 88
      },
      {
        skillName: 'TypeScript',
        isMentioned: true,
        projectUsageCount: 1,
        professionalExperienceYears: 2,
        leadershipUsage: false,
        evidencePoints: [
          'Used TypeScript extensively at InnovateTech to build type-safe API consumers and components',
          'Defined strictly typed state stores and network payload interfaces'
        ],
        score: 82
      },
      {
        skillName: 'Tailwind CSS',
        isMentioned: true,
        projectUsageCount: 2,
        professionalExperienceYears: 3,
        leadershipUsage: false,
        evidencePoints: [
          'Styled multiple responsive platforms with utility classes',
          'Helped draft a shared company-wide design system and theme using Tailwind configs'
        ],
        score: 90
      },
      {
        skillName: 'State Management (Zustand/Redux)',
        isMentioned: true,
        projectUsageCount: 1,
        professionalExperienceYears: 2,
        leadershipUsage: false,
        evidencePoints: [
          'Transformed legacy Redux stores to clean Zustand instances at InnovateTech',
          'Managed complex asynchronous caching queries using TanStack (React) Query'
        ],
        score: 85
      }
    ],
    projectRelevance: [
      {
        projectTitle: 'InnovateTech Dashboard Suite',
        matchScore: 92,
        justification: 'Perfect alignment with modern frontend expectations. Solves state issues, handles APIs, and utilizes the exact required tech stack (React, TS, Tailwind, Zustand).',
        alignedSkills: ['React', 'TypeScript', 'Tailwind CSS', 'State Management']
      },
      {
        projectTitle: 'PixelCraft Shared UI Kit',
        matchScore: 78,
        justification: 'Highly relevant for proving component-driven UI coding abilities and mastery of responsive CSS, but lacks the TypeScript/State integration of the primary project.',
        alignedSkills: ['React', 'Tailwind CSS']
      }
    ],
    stageDetection: {
      detectedStage: 'mid',
      detectedYearsOfExperience: 3,
      reasoning: 'Candidate has 3 years of combined professional software engineering experience across InnovateTech and PixelCraft Studio.'
    },
    scores: {
      knowledgeDepth: 80,
      learningVelocity: 75,
      leadershipImpact: 50,
      experienceMatch: 80
    }
  },
  {
    id: 'senior-arch',
    name: 'Principal Engineer (David Miller - Senior)',
    description: 'Expert engineer with 8+ years of experience in distributed systems, leadership, and container orchestration. Demonstrates exceptional seniority and architectural alignment.',
    jdText: `Position: Lead Distributed Systems Architect
Company: Enterprise Cloud Scale Inc.

Responsibilities:
- Architect, deploy, and scale high-volume microservices serving millions of active users.
- Drive adoption of container orchestration (Kubernetes) and cloud native best practices.
- Lead and mentor cross-functional engineering teams, aligning technical goals.

Required Profile:
- 7+ years of experience in backend development (Go/Java/Python)
- Deployed and operated Kubernetes clusters at scale
- Strong architectural knowledge of distributed messaging (Kafka, gRPC)
- Proven experience leading and mentoring developer groups`,
    resumeText: `DAVID MILLER
Principal Architect | Austin, TX | david.miller@cloudscale.net | LinkedIn: linkedin.com/in/david-miller-arch

PROFESSIONAL SUMMARY
Distinguished systems engineer with over 8 years of architectural experience in building distributed, high-performance cloud platforms. Proven track record leading developer teams and steering legacy-to-cloud migrations.

PROFESSIONAL EXPERIENCE
Principal Engineer / Architect | CloudScale Solutions (2021 - Present)
- Designed and oversaw the migration of a legacy monolithic API to a Go-based microservices architecture, boosting performance by 300% and scaling to 15M monthly active users.
- Led the deployment and governance of multi-region EKS (Kubernetes) clusters, introducing ArgoCD and GitOps, which slashed deployment cycle times by 40%.
- Directly managed a team of 8 senior backend developers. Designed technical roadmaps and conducted design reviews.
- Spearheaded the integration of Apache Kafka for real-time transactional event-streaming.

Senior Backend Engineer | DataPulse Systems (2018 - 2021)
- Developed scalable, data-intensive Java APIs handling high-throughput analytics.
- Mentored 4 junior engineers, and standardizing Docker-based development setups.
- Designed database clustering schemas for MongoDB, securing high-availability.

TECHNICAL SKILLS
- Languages: Go, Java, Python, SQL
- Distributed Systems: Kubernetes (EKS), Docker, Apache Kafka, gRPC, RabbitMQ, Terraform
- Databases: PostgreSQL, MongoDB, Redis, DynamoDB
- Leadership: Technical Roadmapping, Team Mentorship, System Architecture Design`,
    jdParsed: {
      title: 'Lead Distributed Systems Architect',
      requiredSkills: ['Backend Systems (Go/Java/Python)', 'Kubernetes', 'Distributed Messaging (Kafka/gRPC)', 'Engineering Leadership'],
      preferredSkills: ['AWS/Cloud-Native', 'Terraform', 'CI/CD (ArgoCD/GitOps)', 'NoSQL (MongoDB)'],
      responsibilities: ['Architect microservices', 'Govern Kubernetes scaling', 'Lead and mentor teams', 'Technical goal alignment'],
      seniority: 'Senior / Lead (7+ years)',
      idealProfile: 'A senior technical architect with a track record of running large-scale cloud applications. They must have hands-on experience in container orchestration, distributed logs like Kafka, and people leadership.'
    },
    resumeParsed: {
      name: 'David Miller',
      skills: ['Go', 'Java', 'Python', 'Kubernetes (EKS)', 'Docker', 'Apache Kafka', 'gRPC', 'RabbitMQ', 'Terraform', 'PostgreSQL', 'MongoDB', 'Redis', 'DynamoDB', 'GitOps', 'ArgoCD'],
      projects: [
        {
          title: 'CloudScale Go Microservices Migration',
          description: 'A monumental migration effort replacing a monolith with a distributed Go framework. Handles 15 million users and utilizes gRPC for inter-service communication.',
          technologies: ['Go', 'gRPC', 'Docker', 'Kubernetes', 'Kafka']
        },
        {
          title: 'Multi-Region GitOps Orchestration',
          description: 'Built EKS infrastructures with Terraform, managed deployments via GitOps workflows (ArgoCD), enforcing security compliance policies.',
          technologies: ['Kubernetes', 'Terraform', 'ArgoCD', 'AWS']
        }
      ],
      experience: [
        {
          role: 'Principal Engineer / Architect',
          company: 'CloudScale Solutions',
          duration: '2021 - Present (5 years)',
          description: 'Led technical architecture, migrated systems to Go, managed EKS clusters, and led 8 senior developers.'
        },
        {
          role: 'Senior Backend Engineer',
          company: 'DataPulse Systems',
          duration: '2018 - 2021 (3 years)',
          description: 'Engineered high-performance Java APIs, set up MongoDB clustering, and mentored 4 junior developers.'
        }
      ],
      education: [
        {
          degree: 'B.S. in Computer Science',
          school: 'University of Texas at Austin',
          year: '2017'
        }
      ],
      certifications: [],
      achievements: [
        'Migrated monolith to microservices, boosting speed by 300% for 15M active users',
        'Directly mentored and led a team of 8 backend developers'
      ]
    },
    skillEvidence: [
      {
        skillName: 'Backend Systems (Go/Java/Python)',
        isMentioned: true,
        projectUsageCount: 2,
        professionalExperienceYears: 8,
        leadershipUsage: true,
        evidencePoints: [
          '8 years of backend engineering across Go and Java in enterprise environments',
          'Successfully designed, written, and deployed Go-based APIs scaling to millions of accounts'
        ],
        score: 96
      },
      {
        skillName: 'Kubernetes',
        isMentioned: true,
        projectUsageCount: 2,
        professionalExperienceYears: 5,
        leadershipUsage: true,
        evidencePoints: [
          'Oversaw cluster scheduling, security networking, and containerization policies for multi-region EKS',
          'Introduced ArgoCD for automated continuous delivery onto production clusters'
        ],
        score: 95
      },
      {
        skillName: 'Distributed Messaging (Kafka/gRPC)',
        isMentioned: true,
        projectUsageCount: 1,
        professionalExperienceYears: 5,
        leadershipUsage: false,
        evidencePoints: [
          'Engineered event stream processing scripts with Kafka at CloudScale Solutions',
          'Defined gRPC service definitions for low-latency cluster communications'
        ],
        score: 92
      },
      {
        skillName: 'Engineering Leadership',
        isMentioned: true,
        projectUsageCount: 2,
        professionalExperienceYears: 5,
        leadershipUsage: true,
        evidencePoints: [
          'Directly managed 8 senior developers and managed cross-functional workflows',
          'Mentored 4 junior engineers at DataPulse Systems'
        ],
        score: 95
      }
    ],
    projectRelevance: [
      {
        projectTitle: 'CloudScale Go Microservices Migration',
        matchScore: 97,
        justification: 'Highly complex software migration demonstrating master-level experience in Go, scalable backend systems, gRPC, and Kafka. Addresses all core JD requirements.',
        alignedSkills: ['Backend Systems', 'Distributed Messaging', 'Kubernetes']
      },
      {
        projectTitle: 'Multi-Region GitOps Orchestration',
        matchScore: 90,
        justification: 'Strong cloud-native automation deployment showcase. Proves competency in cluster governance and Terraform provisioning.',
        alignedSkills: ['Kubernetes', 'Terraform']
      }
    ],
    stageDetection: {
      detectedStage: 'senior',
      detectedYearsOfExperience: 8,
      reasoning: 'Candidate has over 8 years of professional experience, with senior roles (Senior Backend Engineer) and principal roles (Principal Engineer/Architect).'
    },
    scores: {
      knowledgeDepth: 94,
      learningVelocity: 70,
      leadershipImpact: 96,
      experienceMatch: 95
    }
  }
];

// Helper to calculate score dynamically based on weights config
export const calculateFinalScore = (
  template: MockTemplate,
  weights: WeightsConfig
) => {
  const stage = template.stageDetection.detectedStage;
  const stageWeights = weights[stage];
  
  let totalScore = 0;
  let totalWeight = 0;

  // 1. Skill Evidence
  if (stageWeights.skillEvidence !== undefined) {
    const avgSkillScore = template.skillEvidence.reduce((sum, s) => sum + s.score, 0) / template.skillEvidence.length;
    totalScore += avgSkillScore * stageWeights.skillEvidence;
    totalWeight += stageWeights.skillEvidence;
  }

  // 2. Project Relevance
  if (stageWeights.projectRelevance !== undefined) {
    const avgProjectScore = template.projectRelevance.reduce((sum, p) => sum + p.matchScore, 0) / template.projectRelevance.length;
    totalScore += avgProjectScore * stageWeights.projectRelevance;
    totalWeight += stageWeights.projectRelevance;
  }

  // 3. Knowledge Depth
  if (stageWeights.knowledgeDepth !== undefined) {
    totalScore += template.scores.knowledgeDepth * stageWeights.knowledgeDepth;
    totalWeight += stageWeights.knowledgeDepth;
  }

  // 4. Learning Velocity
  if (stageWeights.learningVelocity !== undefined && stageWeights.learningVelocity > 0) {
    totalScore += template.scores.learningVelocity * stageWeights.learningVelocity;
    totalWeight += stageWeights.learningVelocity;
  }

  // 5. Experience Match
  if (stageWeights.experienceMatch !== undefined && stageWeights.experienceMatch > 0) {
    totalScore += template.scores.experienceMatch * stageWeights.experienceMatch;
    totalWeight += stageWeights.experienceMatch;
  }

  // 6. Leadership Impact
  if (stageWeights.leadershipImpact !== undefined && stageWeights.leadershipImpact > 0) {
    totalScore += template.scores.leadershipImpact * stageWeights.leadershipImpact;
    totalWeight += stageWeights.leadershipImpact;
  }

  const finalScoreVal = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

  // Re-generate strengths/weaknesses and recommendation based on score
  let recommendation: 'Strong Fit' | 'Moderate Fit' | 'No Fit' = 'Moderate Fit';
  let reasoning = '';

  if (finalScoreVal >= 85) {
    recommendation = 'Strong Fit';
    reasoning = `Candidate ${template.resumeParsed.name} demonstrates exceptional suitability for the ${template.jdParsed.title} position, particularly backed by a high ${finalScoreVal}/100 evaluation score. They show strong capabilities matching key components of the job requirements.`;
  } else if (finalScoreVal >= 70) {
    recommendation = 'Moderate Fit';
    reasoning = `Candidate ${template.resumeParsed.name} is a solid match for the role with a score of ${finalScoreVal}/100. While they satisfy the majority of technical demands, some areas could benefit from ramp-up or additional supervision.`;
  } else {
    recommendation = 'No Fit';
    reasoning = `Candidate ${template.resumeParsed.name} does not meet the baseline criteria for the role at this time (Score: ${finalScoreVal}/100). The current experience profile or technical skills do not align closely enough with the job details.`;
  }

  // Generate breakdown object
  const breakdown = {
    skillEvidence: template.skillEvidence.reduce((sum, s) => sum + s.score, 0) / template.skillEvidence.length,
    projectRelevance: template.projectRelevance.reduce((sum, p) => sum + p.matchScore, 0) / template.projectRelevance.length,
    knowledgeDepth: template.scores.knowledgeDepth,
    learningVelocity: template.scores.learningVelocity,
    experienceMatch: template.scores.experienceMatch,
    leadershipImpact: template.scores.leadershipImpact
  };

  const weightedBreakdown = {
    skillEvidence: stageWeights.skillEvidence || 0,
    projectRelevance: stageWeights.projectRelevance || 0,
    knowledgeDepth: stageWeights.knowledgeDepth || 0,
    learningVelocity: stageWeights.learningVelocity || 0,
    experienceMatch: stageWeights.experienceMatch || 0,
    leadershipImpact: stageWeights.leadershipImpact || 0
  };

  return {
    finalScore: finalScoreVal,
    recommendation,
    reasoning,
    breakdown,
    weightedBreakdown
  };
};
