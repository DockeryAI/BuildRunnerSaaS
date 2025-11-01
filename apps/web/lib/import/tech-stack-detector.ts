/**
 * Tech Stack Detector
 *
 * Analyzes project files to detect technologies, frameworks, and libraries
 */

import { TechStack, Technology, ProjectScan, Dependency } from './types';

export class TechStackDetector {
  /**
   * Detect full tech stack from project scan
   */
  public detectTechStack(scan: ProjectScan): TechStack {
    return {
      frontend: this.detectFrontend(scan),
      backend: this.detectBackend(scan),
      database: this.detectDatabase(scan),
      infrastructure: this.detectInfrastructure(scan),
      tools: this.detectTools(scan),
    };
  }

  /**
   * Detect frontend technologies
   */
  private detectFrontend(scan: ProjectScan): Technology[] {
    const technologies: Technology[] = [];
    const { dependencies } = scan;

    // React
    if (this.hasDependency(dependencies, 'react')) {
      technologies.push({
        name: 'React',
        version: this.getDependencyVersion(dependencies, 'react'),
        category: 'framework',
        confidence: 1.0,
        evidence: ['package.json: react dependency'],
      });
    }

    // Next.js
    if (this.hasDependency(dependencies, 'next')) {
      technologies.push({
        name: 'Next.js',
        version: this.getDependencyVersion(dependencies, 'next'),
        category: 'framework',
        confidence: 1.0,
        evidence: ['package.json: next dependency'],
      });
    }

    // Vue
    if (this.hasDependency(dependencies, 'vue')) {
      technologies.push({
        name: 'Vue.js',
        version: this.getDependencyVersion(dependencies, 'vue'),
        category: 'framework',
        confidence: 1.0,
        evidence: ['package.json: vue dependency'],
      });
    }

    // Angular
    if (this.hasDependency(dependencies, '@angular/core')) {
      technologies.push({
        name: 'Angular',
        version: this.getDependencyVersion(dependencies, '@angular/core'),
        category: 'framework',
        confidence: 1.0,
        evidence: ['package.json: @angular/core dependency'],
      });
    }

    // Svelte
    if (this.hasDependency(dependencies, 'svelte')) {
      technologies.push({
        name: 'Svelte',
        version: this.getDependencyVersion(dependencies, 'svelte'),
        category: 'framework',
        confidence: 1.0,
        evidence: ['package.json: svelte dependency'],
      });
    }

    // Tailwind CSS
    if (this.hasDependency(dependencies, 'tailwindcss')) {
      technologies.push({
        name: 'Tailwind CSS',
        version: this.getDependencyVersion(dependencies, 'tailwindcss'),
        category: 'styling',
        confidence: 1.0,
        evidence: ['package.json: tailwindcss dependency'],
      });
    }

    // Material UI
    if (this.hasDependency(dependencies, '@mui/material')) {
      technologies.push({
        name: 'Material-UI',
        version: this.getDependencyVersion(dependencies, '@mui/material'),
        category: 'ui-library',
        confidence: 1.0,
        evidence: ['package.json: @mui/material dependency'],
      });
    }

    // Zustand
    if (this.hasDependency(dependencies, 'zustand')) {
      technologies.push({
        name: 'Zustand',
        version: this.getDependencyVersion(dependencies, 'zustand'),
        category: 'state-management',
        confidence: 1.0,
        evidence: ['package.json: zustand dependency'],
      });
    }

    // Redux
    if (this.hasDependency(dependencies, 'redux') || this.hasDependency(dependencies, '@reduxjs/toolkit')) {
      technologies.push({
        name: 'Redux',
        version: this.getDependencyVersion(dependencies, 'redux'),
        category: 'state-management',
        confidence: 1.0,
        evidence: ['package.json: redux dependency'],
      });
    }

    return technologies;
  }

  /**
   * Detect backend technologies
   */
  private detectBackend(scan: ProjectScan): Technology[] {
    const technologies: Technology[] = [];
    const { dependencies, configFiles } = scan;

    // Express.js
    if (this.hasDependency(dependencies, 'express')) {
      technologies.push({
        name: 'Express.js',
        version: this.getDependencyVersion(dependencies, 'express'),
        category: 'framework',
        confidence: 1.0,
        evidence: ['package.json: express dependency'],
      });
    }

    // Fastify
    if (this.hasDependency(dependencies, 'fastify')) {
      technologies.push({
        name: 'Fastify',
        version: this.getDependencyVersion(dependencies, 'fastify'),
        category: 'framework',
        confidence: 1.0,
        evidence: ['package.json: fastify dependency'],
      });
    }

    // NestJS
    if (this.hasDependency(dependencies, '@nestjs/core')) {
      technologies.push({
        name: 'NestJS',
        version: this.getDependencyVersion(dependencies, '@nestjs/core'),
        category: 'framework',
        confidence: 1.0,
        evidence: ['package.json: @nestjs/core dependency'],
      });
    }

    // Django (Python)
    const requirementsTxt = configFiles.find(f => f.path.includes('requirements.txt'));
    if (requirementsTxt && requirementsTxt.content.includes('Django')) {
      technologies.push({
        name: 'Django',
        category: 'framework',
        confidence: 1.0,
        evidence: ['requirements.txt: Django'],
      });
    }

    // Flask (Python)
    if (requirementsTxt && requirementsTxt.content.includes('Flask')) {
      technologies.push({
        name: 'Flask',
        category: 'framework',
        confidence: 1.0,
        evidence: ['requirements.txt: Flask'],
      });
    }

    // FastAPI (Python)
    if (requirementsTxt && requirementsTxt.content.includes('fastapi')) {
      technologies.push({
        name: 'FastAPI',
        category: 'framework',
        confidence: 1.0,
        evidence: ['requirements.txt: fastapi'],
      });
    }

    // tRPC
    if (this.hasDependency(dependencies, '@trpc/server')) {
      technologies.push({
        name: 'tRPC',
        version: this.getDependencyVersion(dependencies, '@trpc/server'),
        category: 'api',
        confidence: 1.0,
        evidence: ['package.json: @trpc/server dependency'],
      });
    }

    // GraphQL
    if (this.hasDependency(dependencies, 'graphql')) {
      technologies.push({
        name: 'GraphQL',
        version: this.getDependencyVersion(dependencies, 'graphql'),
        category: 'api',
        confidence: 1.0,
        evidence: ['package.json: graphql dependency'],
      });
    }

    return technologies;
  }

  /**
   * Detect database technologies
   */
  private detectDatabase(scan: ProjectScan): Technology[] {
    const technologies: Technology[] = [];
    const { dependencies, configFiles } = scan;

    // Prisma
    if (this.hasDependency(dependencies, '@prisma/client')) {
      technologies.push({
        name: 'Prisma',
        version: this.getDependencyVersion(dependencies, '@prisma/client'),
        category: 'orm',
        confidence: 1.0,
        evidence: ['package.json: @prisma/client dependency'],
      });

      // Try to detect database from Prisma schema
      const prismaSchema = configFiles.find(f => f.path.includes('schema.prisma'));
      if (prismaSchema) {
        const schemaContent = JSON.stringify(prismaSchema.content);
        if (schemaContent.includes('postgresql')) {
          technologies.push({
            name: 'PostgreSQL',
            category: 'database',
            confidence: 0.9,
            evidence: ['prisma/schema.prisma: postgresql provider'],
          });
        } else if (schemaContent.includes('mysql')) {
          technologies.push({
            name: 'MySQL',
            category: 'database',
            confidence: 0.9,
            evidence: ['prisma/schema.prisma: mysql provider'],
          });
        } else if (schemaContent.includes('sqlite')) {
          technologies.push({
            name: 'SQLite',
            category: 'database',
            confidence: 0.9,
            evidence: ['prisma/schema.prisma: sqlite provider'],
          });
        } else if (schemaContent.includes('mongodb')) {
          technologies.push({
            name: 'MongoDB',
            category: 'database',
            confidence: 0.9,
            evidence: ['prisma/schema.prisma: mongodb provider'],
          });
        }
      }
    }

    // Mongoose (MongoDB)
    if (this.hasDependency(dependencies, 'mongoose')) {
      technologies.push({
        name: 'Mongoose',
        version: this.getDependencyVersion(dependencies, 'mongoose'),
        category: 'orm',
        confidence: 1.0,
        evidence: ['package.json: mongoose dependency'],
      });
      technologies.push({
        name: 'MongoDB',
        category: 'database',
        confidence: 0.95,
        evidence: ['package.json: mongoose (MongoDB ODM)'],
      });
    }

    // TypeORM
    if (this.hasDependency(dependencies, 'typeorm')) {
      technologies.push({
        name: 'TypeORM',
        version: this.getDependencyVersion(dependencies, 'typeorm'),
        category: 'orm',
        confidence: 1.0,
        evidence: ['package.json: typeorm dependency'],
      });
    }

    // Sequelize
    if (this.hasDependency(dependencies, 'sequelize')) {
      technologies.push({
        name: 'Sequelize',
        version: this.getDependencyVersion(dependencies, 'sequelize'),
        category: 'orm',
        confidence: 1.0,
        evidence: ['package.json: sequelize dependency'],
      });
    }

    // Supabase
    if (this.hasDependency(dependencies, '@supabase/supabase-js')) {
      technologies.push({
        name: 'Supabase',
        version: this.getDependencyVersion(dependencies, '@supabase/supabase-js'),
        category: 'database',
        confidence: 1.0,
        evidence: ['package.json: @supabase/supabase-js dependency'],
      });
      technologies.push({
        name: 'PostgreSQL',
        category: 'database',
        confidence: 0.9,
        evidence: ['Supabase uses PostgreSQL'],
      });
    }

    // Firebase
    if (this.hasDependency(dependencies, 'firebase')) {
      technologies.push({
        name: 'Firebase',
        version: this.getDependencyVersion(dependencies, 'firebase'),
        category: 'database',
        confidence: 1.0,
        evidence: ['package.json: firebase dependency'],
      });
    }

    return technologies;
  }

  /**
   * Detect infrastructure technologies
   */
  private detectInfrastructure(scan: ProjectScan): Technology[] {
    const technologies: Technology[] = [];
    const { configFiles } = scan;

    // Docker
    if (configFiles.some(f => f.path.includes('Dockerfile'))) {
      technologies.push({
        name: 'Docker',
        category: 'containerization',
        confidence: 1.0,
        evidence: ['Dockerfile found'],
      });
    }

    if (configFiles.some(f => f.path.includes('docker-compose'))) {
      technologies.push({
        name: 'Docker Compose',
        category: 'orchestration',
        confidence: 1.0,
        evidence: ['docker-compose.yml found'],
      });
    }

    // Kubernetes
    if (configFiles.some(f => f.path.includes('k8s') || f.path.includes('kubernetes'))) {
      technologies.push({
        name: 'Kubernetes',
        category: 'orchestration',
        confidence: 0.9,
        evidence: ['Kubernetes config files found'],
      });
    }

    // Vercel
    if (configFiles.some(f => f.path.includes('vercel.json'))) {
      technologies.push({
        name: 'Vercel',
        category: 'deployment',
        confidence: 1.0,
        evidence: ['vercel.json found'],
      });
    }

    // Netlify
    if (configFiles.some(f => f.path.includes('netlify.toml'))) {
      technologies.push({
        name: 'Netlify',
        category: 'deployment',
        confidence: 1.0,
        evidence: ['netlify.toml found'],
      });
    }

    // GitHub Actions
    if (configFiles.some(f => f.path.includes('.github/workflows'))) {
      technologies.push({
        name: 'GitHub Actions',
        category: 'ci-cd',
        confidence: 1.0,
        evidence: ['.github/workflows found'],
      });
    }

    return technologies;
  }

  /**
   * Detect development tools
   */
  private detectTools(scan: ProjectScan): Technology[] {
    const technologies: Technology[] = [];
    const { dependencies, configFiles } = scan;

    // TypeScript
    if (this.hasDependency(dependencies, 'typescript') || configFiles.some(f => f.path.includes('tsconfig.json'))) {
      technologies.push({
        name: 'TypeScript',
        version: this.getDependencyVersion(dependencies, 'typescript'),
        category: 'language',
        confidence: 1.0,
        evidence: ['TypeScript configuration found'],
      });
    }

    // ESLint
    if (this.hasDependency(dependencies, 'eslint') || configFiles.some(f => f.path.includes('.eslintrc'))) {
      technologies.push({
        name: 'ESLint',
        version: this.getDependencyVersion(dependencies, 'eslint'),
        category: 'linting',
        confidence: 1.0,
        evidence: ['ESLint configuration found'],
      });
    }

    // Prettier
    if (this.hasDependency(dependencies, 'prettier') || configFiles.some(f => f.path.includes('.prettierrc'))) {
      technologies.push({
        name: 'Prettier',
        version: this.getDependencyVersion(dependencies, 'prettier'),
        category: 'formatting',
        confidence: 1.0,
        evidence: ['Prettier configuration found'],
      });
    }

    // Jest
    if (this.hasDependency(dependencies, 'jest')) {
      technologies.push({
        name: 'Jest',
        version: this.getDependencyVersion(dependencies, 'jest'),
        category: 'testing',
        confidence: 1.0,
        evidence: ['package.json: jest dependency'],
      });
    }

    // Vitest
    if (this.hasDependency(dependencies, 'vitest')) {
      technologies.push({
        name: 'Vitest',
        version: this.getDependencyVersion(dependencies, 'vitest'),
        category: 'testing',
        confidence: 1.0,
        evidence: ['package.json: vitest dependency'],
      });
    }

    // Playwright
    if (this.hasDependency(dependencies, '@playwright/test')) {
      technologies.push({
        name: 'Playwright',
        version: this.getDependencyVersion(dependencies, '@playwright/test'),
        category: 'testing',
        confidence: 1.0,
        evidence: ['package.json: @playwright/test dependency'],
      });
    }

    return technologies;
  }

  // Helper methods

  private hasDependency(dependencies: any[], name: string): boolean {
    return dependencies.some(dep => dep.name === name);
  }

  private getDependencyVersion(dependencies: any[], name: string): string | undefined {
    const dep = dependencies.find(d => d.name === name);
    return dep?.version;
  }
}

export const techStackDetector = new TechStackDetector();
