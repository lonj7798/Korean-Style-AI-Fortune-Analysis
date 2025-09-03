

import React from 'react';
import { FortuneResult, CategoryKey } from '../types';
import { getCategories } from '../locales';
import { useLanguage } from '../contexts/LanguageContext';

interface FortuneCardProps {
  categoryKey: CategoryKey;
  result: FortuneResult;
  isViewed: boolean;
  onClick: () => void;
}

const FortuneCard: React.FC<FortuneCardProps> = ({ categoryKey, result, isViewed, onClick }) => {
  const { locale, t } = useLanguage();
  const CATEGORIES = getCategories(locale);
  const category = CATEGORIES[categoryKey];

  return (
    <div className="group w-full h-72 cursor-pointer" onClick={onClick}>
      <div 
        className={`relative w-full h-full rounded-xl shadow-lg transition-transform duration-700 [transform-style:preserve-3d] ${isViewed ? '[transform:rotateY(180deg)]' : ''} group-hover:[transform:rotateY(180deg)]`}
      >
        {/* Card Back */}
        <div className="absolute w-full h-full rounded-xl bg-slate-800 border border-purple-500/30 [backface-visibility:hidden] flex flex-col items-center justify-center p-4">
          <div className="text-purple-400 w-16 h-16 mb-4">{category.icon}</div>
          <h3 className="text-xl font-bold text-center text-slate-200">{category.name}</h3>
        </div>
        
        {/* Card Front */}
        <div className="absolute w-full h-full rounded-xl bg-slate-700 [transform:rotateY(180deg)] [backface-visibility:hidden] p-6 flex flex-col justify-between overflow-hidden">
          <div>
            <h3 className="text-lg font-bold text-purple-400 mb-2">{category.name}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {result.summary}
            </p>
          </div>
          <span className="text-xs font-semibold text-cyan-400 self-end">{t('viewDetails')}</span>
        </div>
      </div>
    </div>
  );
};

export default FortuneCard;