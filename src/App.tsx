
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { UserInput, ProgressState, FortuneResult, CategoryKey, AnalysisStatus } from './types';
import { getCategories } from './locales';
import { startBatchAnalysis } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import GenerationProgress from './components/GenerationProgress';
import ResultsDisplay from './components/ResultsDisplay';
import { useLanguage } from './contexts/LanguageContext';

type Page = 'input' | 'generating' | 'results';

export default function App() {
  const { locale, t } = useLanguage();
  const CATEGORIES = useMemo(() => getCategories(locale), [locale]);

  const initialProgressState = useCallback((): ProgressState => {
    const status = {} as Record<CategoryKey, { status: AnalysisStatus; message: string }>;
    (Object.keys(CATEGORIES) as CategoryKey[]).forEach(key => {
      status[key] = { status: AnalysisStatus.PENDING, message: t('pendingMessage', { categoryName: CATEGORIES[key].name }) };
    });
    return { completedCount: 0, status };
  }, [CATEGORIES, t]);
  
  const [page, setPage] = useState<Page>('input');
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [progress, setProgress] = useState<ProgressState>(initialProgressState());
  const [results, setResults] = useState<Record<CategoryKey, FortuneResult>>({} as Record<CategoryKey, FortuneResult>);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  useEffect(() => {
    // Reset progress state when language changes on the input/generating page
    // to reflect new category names. Does not reset if results are shown.
    if (page !== 'results') {
        setProgress(initialProgressState());
    }
  }, [initialProgressState, page]);

  const handleStartAnalysis = useCallback((input: UserInput) => {
    setUserInput(input);
    setPage('generating');
    setProgress(initialProgressState());
    setResults({} as Record<CategoryKey, FortuneResult>);
    setIsAnalyzing(true); // This will trigger the useEffect for analysis
  }, [initialProgressState]);

  useEffect(() => {
    if (!isAnalyzing || !userInput) {
      return;
    }

    const performAnalysis = async () => {
      const onStartCategory = (key: CategoryKey) => {
        setProgress(current => ({
          ...current,
          status: {
            ...current.status,
            [key]: { 
              status: AnalysisStatus.ANALYZING, 
              message: t('analyzingMessage', { categoryName: CATEGORIES[key]?.name || key }) 
            }
          }
        }));
      };

      const onCompleteCategory = (key: CategoryKey, result: FortuneResult | Error) => {
        setProgress(currentProgress => {
          const newStatus = { ...currentProgress.status };
          const categoryName = CATEGORIES[key]?.name || key;
          
          if (result instanceof Error) {
            newStatus[key] = { status: AnalysisStatus.FAILED, message: result.message };
          } else {
            newStatus[key] = { status: AnalysisStatus.COMPLETED, message: t('completedMessage', { categoryName }) };
            setResults(prevResults => ({...prevResults, [key]: result}));
          }
          const newCompletedCount = currentProgress.completedCount + 1;
          
          if (newCompletedCount === Object.keys(CATEGORIES).length) {
              setTimeout(() => setPage('results'), 1000);
          }

          return {
            completedCount: newCompletedCount,
            status: newStatus,
          };
        });
      };
      
      await startBatchAnalysis(userInput, locale, onStartCategory, onCompleteCategory);
      setIsAnalyzing(false); // Reset the trigger
    };
    
    performAnalysis();
    
  }, [isAnalyzing, userInput, locale, CATEGORIES, t]);

  const handleReset = useCallback(() => {
    setPage('input');
    setUserInput(null);
    setProgress(initialProgressState());
    setResults({} as Record<CategoryKey, FortuneResult>);
    setIsAnalyzing(false); // Also reset the analysis trigger
  }, [initialProgressState]);

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen font-sans">
      <Header onReset={handleReset} disableLanguageChange={page !== 'input'} />
      <main className="container mx-auto px-4 py-8 pt-24">
        {page === 'input' && <InputForm onStart={handleStartAnalysis} />}
        {page === 'generating' && <GenerationProgress progress={progress} />}
        {page === 'results' && userInput && <ResultsDisplay results={results} userName={userInput.name} />}
      </main>
    </div>
  );
}