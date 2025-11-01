/**
 * Orchestration Control Panel
 *
 * User controls for:
 * - Starting/stopping orchestration
 * - Extracting features from product idea
 * - Verifying phase completion
 * - Manual syncing
 */

'use client';

import React, { useState } from 'react';
import {
  PlayIcon,
  StopIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { useOrchestrationStore } from '@/lib/stores/orchestration-store';

export function ControlPanel() {
  const {
    isOrchestrationActive,
    productIdea,
    currentPhase,
    startOrchestration,
    stopOrchestration,
    extractFeaturesFromIdea,
    verifyPhase,
    syncToRegistry,
  } = useOrchestrationStore();

  const [isExtracting, setIsExtracting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleStartStop = async () => {
    if (isOrchestrationActive) {
      stopOrchestration();
    } else {
      await startOrchestration();
    }
  };

  const handleExtractFeatures = async () => {
    if (!productIdea) {
      alert('Please enter a product idea first');
      return;
    }

    setIsExtracting(true);
    try {
      const features = await extractFeaturesFromIdea(productIdea);
      alert(`✅ Extracted ${features.length} features from your product idea!`);
    } catch (error) {
      console.error('Feature extraction failed:', error);
      alert('❌ Feature extraction failed. Check console for details.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleVerifyPhase = async () => {
    setIsVerifying(true);
    try {
      const result = await verifyPhase(currentPhase);
      setVerificationResult(result);

      if (result.canProceed) {
        alert(`✅ Phase ${currentPhase} verified complete!`);
      } else {
        const missing = result.missing?.length || 0;
        alert(`❌ Phase ${currentPhase} incomplete. Missing ${missing} features.`);
      }
    } catch (error) {
      console.error('Verification failed:', error);
      alert('❌ Verification failed. Check console for details.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncToRegistry();
      alert('✅ Synced to feature registry!');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('❌ Sync failed. Check console for details.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Control Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Orchestration Controls</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start/Stop Orchestration */}
          <button
            onClick={handleStartStop}
            className={`flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all ${
              isOrchestrationActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg'
            }`}
          >
            {isOrchestrationActive ? (
              <>
                <StopIcon className="h-5 w-5" />
                <span>Stop Orchestration</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-5 w-5" />
                <span>Start Orchestration</span>
              </>
            )}
          </button>

          {/* Extract Features */}
          <button
            onClick={handleExtractFeatures}
            disabled={isExtracting || !productIdea}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isExtracting ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                <span>Extract Features</span>
              </>
            )}
          </button>

          {/* Verify Phase */}
          <button
            onClick={handleVerifyPhase}
            disabled={isVerifying}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isVerifying ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                <span>Verify Phase {currentPhase}</span>
              </>
            )}
          </button>

          {/* Manual Sync */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSyncing ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-5 w-5" />
                <span>Manual Sync</span>
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        <div className="mt-4 space-y-2">
          {!isOrchestrationActive && (
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <BeakerIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">Orchestration Inactive</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Click "Start Orchestration" to enable AI agents, loop detection, and auto-verification.
                </p>
              </div>
            </div>
          )}

          {!productIdea && (
            <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <SparklesIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">No Product Idea Yet</p>
                <p className="text-xs text-blue-700 mt-1">
                  Enter your product idea in the onboarding flow to enable feature extraction.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Results */}
      {verificationResult && (
        <VerificationResults result={verificationResult} phase={currentPhase} />
      )}
    </div>
  );
}

function VerificationResults({ result, phase }: { result: any; phase: number }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <CheckCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
        Phase {phase} Verification Results
      </h3>

      <div className={`p-4 rounded-lg border-2 mb-4 ${
        result.canProceed
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <p className={`font-semibold ${
          result.canProceed ? 'text-green-900' : 'text-red-900'
        }`}>
          {result.canProceed ? '✅ Phase Complete' : '❌ Phase Incomplete'}
        </p>
        <p className={`text-sm mt-1 ${
          result.canProceed ? 'text-green-700' : 'text-red-700'
        }`}>
          {result.canProceed
            ? 'All features verified by multi-LLM consensus'
            : `Missing ${result.missing?.length || 0} features`
          }
        </p>
      </div>

      {/* LLM Verdicts */}
      {result.verifications && result.verifications.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">LLM Verdicts:</h4>
          {result.verifications.map((v: any, idx: number) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                v.result === 'complete'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-gray-900">{v.model}</span>
                <span className={`text-xs font-semibold ${
                  v.result === 'complete' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {v.result === 'complete' ? '✅ Complete' : '❌ Incomplete'}
                </span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-gray-600">Confidence:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      v.confidence > 0.8 ? 'bg-green-500' :
                      v.confidence > 0.5 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${v.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {Math.round(v.confidence * 100)}%
                </span>
              </div>
              {v.reasoning && (
                <p className="text-xs text-gray-600 mt-2">{v.reasoning}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Missing Features */}
      {result.missing && result.missing.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">Missing Features:</h4>
          <div className="space-y-2">
            {result.missing.map((feature: any) => (
              <div key={feature.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900">{feature.name}</p>
                <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">Recommendations:</h4>
          <ul className="space-y-1">
            {result.recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="text-sm text-gray-600 flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
