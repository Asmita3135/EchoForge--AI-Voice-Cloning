import React, { useState, useEffect } from 'react';
import { useHealthCheck } from './hooks/useHealthCheck';
import { useAnalyze } from './hooks/useAnalyze';
import { Navbar } from './components/navigation/Navbar';
import { Footer } from './components/common/Footer';
import { AnalyzeCallPage } from './pages/AnalyzeCallPage';
import { LiveCallSimPage } from './pages/LiveCallSimPage';
import { SecurityResultsPage } from './pages/SecurityResultsPage';
import { SafetyCenterPage } from './pages/SafetyCenterPage';
import { FaqPage } from './pages/FaqPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HowItWorksPage } from './pages/HowItWorksPage';

export function App() {
  const [activeTab, setActiveTab] = useState('analyze-call');
  const { healthStatus, errorMessage: healthError, refetchHealth } = useHealthCheck();

  const {
    targetFile,
    setTargetFile,
    referenceFile,
    setReferenceFile,
    status,
    result,
    error,
    fileValidationError,
    runAnalysis,
    resetAnalysis,
  } = useAnalyze();

  // Automatically switch to 'results' tab when real backend analysis completes
  useEffect(() => {
    if (status === 'result' && result) {
      setActiveTab('results');
    }
  }, [status, result]);

  const handleResetAndNavigateToAnalyze = () => {
    resetAnalysis();
    setActiveTab('analyze-call');
  };

  const handleNavigateTo = (tabId) => setActiveTab(tabId);

  return (
    <div className="app-root">
      {/* FLOATING NAVBAR — lives outside page-content so it can float full-width */}
      <div className="navbar-outer">
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          hasResults={!!result}
          healthStatus={healthStatus}
          onRetryHealth={refetchHealth}
          onNavigateTo={handleNavigateTo}
        />
      </div>

      {/* MAIN PAGE CONTENT */}
      <main className="page-content">
        {activeTab === 'analyze-call' && (
          <AnalyzeCallPage
            targetFile={targetFile}
            setTargetFile={setTargetFile}
            referenceFile={referenceFile}
            setReferenceFile={setReferenceFile}
            status={status}
            error={error}
            fileValidationError={fileValidationError}
            runAnalysis={runAnalysis}
            healthStatus={healthStatus}
            onNavigateToDemo={() => setActiveTab('live-demo')}
            onNavigateTo={handleNavigateTo}
          />
        )}

        {activeTab === 'live-demo' && (
          <LiveCallSimPage onNavigateToUpload={() => setActiveTab('analyze-call')} />
        )}

        {activeTab === 'results' && (
          <SecurityResultsPage
            result={result}
            onResetAndNavigate={handleResetAndNavigateToAnalyze}
          />
        )}

        {activeTab === 'how-it-works' && (
          <HowItWorksPage onNavigateTo={handleNavigateTo} />
        )}

        {activeTab === 'safety' && (
          <SafetyCenterPage onNavigateTo={handleNavigateTo} />
        )}

        {activeTab === 'faq' && (
          <FaqPage onNavigateTo={handleNavigateTo} />
        )}

        {activeTab === 'about' && (
          <AboutPage onNavigateTo={handleNavigateTo} />
        )}

        {activeTab === 'contact' && (
          <ContactPage onNavigateTo={handleNavigateTo} />
        )}
      </main>

      {/* FOOTER */}
      <Footer onNavigateTo={handleNavigateTo} />
    </div>
  );
}

export default App;
