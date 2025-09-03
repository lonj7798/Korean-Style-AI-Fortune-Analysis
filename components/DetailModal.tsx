
import React, { useEffect } from 'react';
import { FortuneResult, CategoryKey } from '../types';
import { getCategories } from '../locales';
import { LeftArrowIcon, RightArrowIcon, CloseIcon, ShareIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface DetailModalProps {
  results: (FortuneResult & {key: CategoryKey})[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'next' | 'prev') => void;
}

const FormattedDetailContent: React.FC<{ details: string }> = ({ details }) => {
  if (!details) return null;

  const sections = details.split('### ').filter(s => s.trim() !== '');

  return (
    <div>
      {sections.map((section, index) => {
        const firstNewlineIndex = section.indexOf('\n');
        if (firstNewlineIndex === -1) {
          return <p key={index} className="whitespace-pre-wrap">{section.trim()}</p>;
        }

        const title = section.substring(0, firstNewlineIndex).trim();
        const content = section.substring(firstNewlineIndex + 1).trim();

        return (
          <div key={index} className="mb-6 last:mb-0">
            <h4 className="font-bold text-lg text-cyan-400 mb-2 border-b border-cyan-400/30 pb-2">{title}</h4>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{content}</p>
          </div>
        );
      })}
    </div>
  );
};


const DetailModal: React.FC<DetailModalProps> = ({ results, currentIndex, onClose, onNavigate }) => {
  const { locale, t } = useLanguage();
  const CATEGORIES = getCategories(locale);

  const currentResult = results[currentIndex];
  const category = CATEGORIES[currentResult.key];
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate('next');
      if (e.key === 'ArrowLeft') onNavigate('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate]);

  const handleShare = () => {
    const shareText = t('shareText', {
        categoryName: category.name,
        summary: currentResult.summary
    });
    navigator.clipboard.writeText(shareText).then(() => {
        alert(t('shareSuccess'));
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert(t('shareError'));
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl shadow-purple-500/30 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 text-purple-400">{category.icon}</div>
                <h2 className="text-xl font-bold text-slate-100">{category.name}</h2>
            </div>
            <div className="flex items-center gap-2">
                 <button onClick={handleShare} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label={t('share')}>
                    <ShareIcon />
                </button>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label={t('close')}>
                    <CloseIcon />
                </button>
            </div>
        </header>
        <main className="p-6 overflow-y-auto text-slate-300">
          <div className="mb-6">
            <h3 className="font-bold text-lg text-purple-400 mb-3">{t('summary')}</h3>
            <p className="border-l-4 border-purple-500 pl-4 text-slate-200">{currentResult.summary}</p>
          </div>
          <FormattedDetailContent details={currentResult.details} />
        </main>
      </div>
      
      <button 
        onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }} 
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-slate-700/50 rounded-full hover:bg-slate-700/80 transition-colors"
        aria-label={t('previous')}
      >
        <LeftArrowIcon />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onNavigate('next'); }} 
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-slate-700/50 rounded-full hover:bg-slate-700/80 transition-colors"
        aria-label={t('next')}
      >
        <RightArrowIcon />
      </button>
    </div>
  );
};

export default DetailModal;
