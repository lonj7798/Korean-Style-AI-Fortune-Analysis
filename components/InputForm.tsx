
import React, { useState, useEffect, useRef } from 'react';
import { UserInput } from '../types';
import { PhotoIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface InputFormProps {
  onStart: (data: UserInput) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onStart }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  
  // New state for custom time input
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [ampm, setAmPm] = useState<'AM' | 'PM'>('AM');
  const [isAmPmOpen, setIsAmPmOpen] = useState(false);
  const ampmDropdownRef = useRef<HTMLDivElement>(null);
  const [tob, setTob] = useState(''); // This will hold the final HH:mm string

  const [facePhoto, setFacePhoto] = useState<File | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  // Close AM/PM dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ampmDropdownRef.current && !ampmDropdownRef.current.contains(event.target as Node)) {
        setIsAmPmOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Combine hour, minute, and ampm into a single 24-hour format string
  useEffect(() => {
    if (hour && minute) {
      let h = parseInt(hour, 10);
      const m = parseInt(minute, 10);

      if (isNaN(h) || h < 1 || h > 12 || isNaN(m) || m < 0 || m > 59) {
        setTob('');
        return;
      }

      if (ampm === 'PM' && h < 12) {
        h += 12;
      } else if (ampm === 'AM' && h === 12) { // Midnight case: 12 AM is 00 hours
        h = 0;
      }

      const formattedHour = String(h).padStart(2, '0');
      const formattedMinute = String(m).padStart(2, '0');
      
      setTob(`${formattedHour}:${formattedMinute}`);
    } else {
      setTob('');
    }
  }, [hour, minute, ampm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFacePhoto(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && dob) {
      setIsLoading(true);
      onStart({ name, dob, tob, facePhoto });
    }
  };
  
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 2) setHour(val);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 2) setMinute(val);
  };

  const validateHour = () => {
    const num = parseInt(hour, 10);
    if (isNaN(num) || num < 1 || num > 12) setHour('');
  };

  const validateMinute = () => {
    const num = parseInt(minute, 10);
    if (isNaN(num) || num < 0 || num > 59) {
      setMinute('');
    } else {
      setMinute(String(num).padStart(2, '0'));
    }
  };

  const handleAmPmChange = (value: 'AM' | 'PM') => {
    setAmPm(value);
    setIsAmPmOpen(false);
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-slate-800 rounded-xl shadow-2xl shadow-purple-500/20">
      <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        {t('inputTitle')}
      </h2>
      <p className="text-center text-slate-400 mb-8">
        {t('inputDescription').split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">{t('nameLabel')}</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            placeholder={t('namePlaceholder')}
          />
        </div>
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-slate-300 mb-2">{t('dobLabel')}</label>
          <input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">{t('tobLabel')}</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={hour}
              onChange={handleHourChange}
              onBlur={validateHour}
              maxLength={2}
              className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="HH"
              aria-label="Hour of birth"
            />
            <span className="font-bold text-slate-400">:</span>
            <input
              type="text"
              value={minute}
              onChange={handleMinuteChange}
              onBlur={validateMinute}
              maxLength={2}
              className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="MM"
              aria-label="Minute of birth"
            />
            <div className="relative" ref={ampmDropdownRef}>
              <button
                type="button"
                onClick={() => setIsAmPmOpen(!isAmPmOpen)}
                className="w-24 flex justify-between items-center bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                aria-haspopup="true"
                aria-expanded={isAmPmOpen}
              >
                <span>{ampm}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isAmPmOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
              {isAmPmOpen && (
                <div className="absolute top-full right-0 mt-2 w-24 bg-slate-800 rounded-md shadow-lg border border-slate-700 z-10">
                  <button
                    type="button"
                    onClick={() => handleAmPmChange('AM')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50"
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAmPmChange('PM')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50"
                  >
                    PM
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">{t('photoLabel')}</label>
          <label htmlFor="facePhoto" className="cursor-pointer bg-slate-700 border border-dashed border-slate-600 rounded-lg px-3 py-4 flex flex-col items-center justify-center hover:border-purple-500 transition">
            <PhotoIcon />
            <span className="mt-2 text-sm text-slate-400">{fileName || t('photoPlaceholder')}</span>
          </label>
          <input id="facePhoto" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
        <button
          type="submit"
          disabled={!name || !dob || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300"
        >
          {isLoading ? t('analyzing') : t('startAnalysis')}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
