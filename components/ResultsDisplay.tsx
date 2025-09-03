
import React, { useState } from 'react';
import { FortuneResult, CategoryKey } from '../types';
import { getCategories } from '../locales';
import FortuneCard from './FortuneCard';
import DetailModal from './DetailModal';
import { useLanguage } from '../contexts/LanguageContext';

interface ResultsDisplayProps {
  results: Record<CategoryKey, FortuneResult>;
  userName: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, userName }) => {
  const { locale, t } = useLanguage();
  const CATEGORIES = getCategories(locale);
  const [viewedCategories, setViewedCategories] = useState<Set<CategoryKey>>(new Set());
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  const categoryOrder = Object.keys(CATEGORIES) as CategoryKey[];

  const handleCardClick = (key: CategoryKey) => {
    setViewedCategories(prev => new Set(prev).add(key));
    const index = categoryOrder.findIndex(k => k === key);
    setActiveModalIndex(index);
  };
  
  const handleCloseModal = () => {
    setActiveModalIndex(null);
  };
  
  const handleNavigate = (direction: 'next' | 'prev') => {
    if (activeModalIndex === null) return;
    
    if (direction === 'next') {
        const nextIndex = (activeModalIndex + 1) % categoryOrder.length;
        setViewedCategories(prev => new Set(prev).add(categoryOrder[nextIndex]));
        setActiveModalIndex(nextIndex);
    } else {
        const prevIndex = (activeModalIndex - 1 + categoryOrder.length) % categoryOrder.length;
        setViewedCategories(prev => new Set(prev).add(categoryOrder[prevIndex]));
        setActiveModalIndex(prevIndex);
    }
  }

  const resultsArray = categoryOrder.map(key => ({ key, ...results[key] }));

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-2">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">{userName}</span>{t('resultsTitle')}
      </h2>
      <p className="text-center text-slate-400 mb-10">{t('resultsDescription')}</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 [perspective:1000px]">
        {categoryOrder.map(key => (
            results[key] ? (
            <FortuneCard 
              key={key}
              categoryKey={key}
              result={results[key]}
              isViewed={viewedCategories.has(key)}
              onClick={() => handleCardClick(key)}
            />
            ) : null
        ))}
      </div>

      {activeModalIndex !== null && (
        <DetailModal
          results={resultsArray}
          currentIndex={activeModalIndex}
          onClose={handleCloseModal}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

export default ResultsDisplay;
