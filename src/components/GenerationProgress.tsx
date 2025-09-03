
import React from 'react';
import { ProgressState, AnalysisStatus, CategoryKey } from '../types';
import { getCategories } from '../locales';
import { useLanguage } from '../contexts/LanguageContext';

interface GenerationProgressProps {
  progress: ProgressState;
}

const getStatusIcon = (status: AnalysisStatus) => {
    switch (status) {
        case AnalysisStatus.ANALYZING:
            return (
                <svg className="animate-spin h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            );
        case AnalysisStatus.COMPLETED:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            );
        case AnalysisStatus.FAILED:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            );
        case AnalysisStatus.PENDING:
            return <div className="w-4 h-4 rounded-full bg-slate-600" />;
        default:
            return null;
    }
}

type StatusTranslationKey = 'pendingStatusShort' | 'analyzingStatusShort' | 'completedStatusShort' | 'failedStatusShort';

const statusKeyMap: Record<AnalysisStatus, StatusTranslationKey> = {
    [AnalysisStatus.PENDING]: 'pendingStatusShort',
    [AnalysisStatus.ANALYZING]: 'analyzingStatusShort',
    [AnalysisStatus.COMPLETED]: 'completedStatusShort',
    [AnalysisStatus.FAILED]: 'failedStatusShort',
};


const GenerationProgress: React.FC<GenerationProgressProps> = ({ progress }) => {
  const { locale, t } = useLanguage();
  const CATEGORIES = getCategories(locale);

  const total = Object.keys(CATEGORIES).length;
  const percentage = total > 0 ? (progress.completedCount / total) * 100 : 0;
  
  const failedCount = Object.values(progress.status).filter(s => s.status === AnalysisStatus.FAILED).length;
  const hasFailed = failedCount > 0;

  const getProgressDescription = () => {
    if (!hasFailed) {
      return t('progressDescription');
    }
    // This key will need to be added to locales.ts
    const key = progress.completedCount < total 
        ? 'progressDescriptionErrorInProgress' 
        : 'progressDescriptionErrorComplete';
    return t(key, { count: String(failedCount) });
  };


  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-10">
      <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        {t('progressTitle')}
      </h2>
      <p className="text-slate-400 mb-8 text-center">{getProgressDescription()}</p>
      
      <div className="w-full bg-slate-700 rounded-full h-4 mb-8 overflow-hidden">
        <div 
          className={`h-4 rounded-full transition-all duration-500 ease-out ${hasFailed ? 'bg-red-600' : 'bg-gradient-to-r from-purple-500 to-cyan-500'}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="w-full p-4 bg-slate-800 rounded-lg shadow-inner">
        <ul className="space-y-2">
          {(Object.keys(progress.status) as CategoryKey[]).map((key) => {
            const item = progress.status[key];
            return (
              <li key={key} className="flex flex-col items-start text-sm py-1">
                <div className="flex items-center justify-between w-full">
                  <span className="text-slate-300">{CATEGORIES[key]?.name || key}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs ${item.status === AnalysisStatus.FAILED ? 'text-red-400' : 'text-slate-400'}`}>
                        {t(statusKeyMap[item.status])}
                    </span>
                    {getStatusIcon(item.status)}
                  </div>
                </div>
                 {item.status === AnalysisStatus.FAILED && (
                  <p className="text-xs text-red-400/80 mt-1 pl-1 w-full break-words">{item.message}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default GenerationProgress;