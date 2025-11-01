/**
 * Project Import API Routes
 *
 * Handles project scanning, analysis, and import execution
 */

import { NextRequest, NextResponse } from 'next/server';
import { codeAnalyzer } from '@/lib/import/code-analyzer';
import { techStackDetector } from '@/lib/import/tech-stack-detector';
import { featureExtractor } from '@/lib/import/feature-extractor';
import { prdGenerator } from '@/lib/import/prd-generator';
import { featureRegistry } from '@/lib/orchestration';
import type { ImportRequest, ImportResult } from '@/lib/import/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'scan':
        return await handleScan(body);
      case 'analyze':
        return await handleAnalyze(body);
      case 'execute':
        return await handleExecute(body);
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}

/**
 * Scan a project directory
 */
async function handleScan(body: any) {
  const { path: projectPath, method } = body as ImportRequest;

  if (!projectPath) {
    return NextResponse.json(
      { error: 'Project path is required' },
      { status: 400 }
    );
  }

  console.log(`📁 Scanning project: ${projectPath}`);

  // Scan the project
  const scanResults = await codeAnalyzer.scanProject(projectPath);

  // Detect tech stack
  const techStack = techStackDetector.detectTechStack(scanResults);

  return NextResponse.json({
    success: true,
    scanResults,
    techStack,
  });
}

/**
 * Deep analysis with AI
 */
async function handleAnalyze(body: any) {
  const { scanResults, techStack } = body;

  if (!scanResults || !techStack) {
    return NextResponse.json(
      { error: 'Scan results and tech stack are required' },
      { status: 400 }
    );
  }

  console.log(`🤖 Analyzing project with AI...`);

  // Extract features
  const detectedFeatures = await featureExtractor.extractFeatures(
    scanResults,
    techStack
  );

  // Generate PRD
  const generatedPRD = await prdGenerator.generatePRD(
    scanResults,
    detectedFeatures,
    techStack
  );

  // Create feature mapping
  const featureMapping = detectedFeatures.map(f => ({
    featureId: f.id,
    name: f.name,
    status: f.status,
    codeFiles: f.codeFiles,
    confidence: f.confidence,
  }));

  return NextResponse.json({
    success: true,
    detectedFeatures,
    generatedPRD,
    featureMapping,
  });
}

/**
 * Execute import - create project in BuildRunner
 */
async function handleExecute(body: any) {
  const { scanResults, generatedPRD, featureMapping } = body;

  if (!scanResults || !generatedPRD || !featureMapping) {
    return NextResponse.json(
      { error: 'Missing required data for import' },
      { status: 400 }
    );
  }

  console.log(`✅ Executing import for: ${scanResults.projectInfo.name}`);

  const projectId = `project-${Date.now()}`;
  let completedCount = 0;
  let inProgressCount = 0;
  let plannedCount = 0;

  // Add features to registry
  for (const prdFeature of generatedPRD.features) {
    const feature = await featureRegistry.addFeature({
      name: prdFeature.name,
      description: prdFeature.description,
      status: prdFeature.status === 'completed' ? 'completed' :
              prdFeature.status === 'in_progress' ? 'in_progress' : 'planned',
      phase: prdFeature.phase,
      step: 1,
      priority: 'medium',
      sub_features: [],
      acceptance_criteria: prdFeature.acceptanceCriteria.map(ac => ({
        description: ac,
        verified: prdFeature.status === 'completed',
        verification_method: 'Code Analysis',
      })),
      dependencies: {
        required_features: prdFeature.dependencies,
        required_packages: [],
      },
      blockers: [],
    });

    // Mark completed features
    if (prdFeature.status === 'completed') {
      await featureRegistry.completeFeature(feature.id, {
        code_files: featureMapping.find((f: any) => f.name === prdFeature.name)?.codeFiles || [],
        tests_passed: true,
        documentation: prdFeature.technicalNotes,
      });
      completedCount++;
    } else if (prdFeature.status === 'in_progress') {
      inProgressCount++;
    } else {
      plannedCount++;
    }
  }

  const result: ImportResult = {
    projectId,
    projectName: scanResults.projectInfo.name,
    featuresImported: generatedPRD.features.length,
    prdSectionsCreated: 4, // All 4 phases
    registryPopulated: true,
    completedFeatures: completedCount,
    inProgressFeatures: inProgressCount,
    plannedFeatures: plannedCount,
  };

  return NextResponse.json({
    success: true,
    result,
  });
}
