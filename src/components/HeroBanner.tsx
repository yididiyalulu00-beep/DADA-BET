import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, ChevronRight, Zap } from 'lucide-react';
import { Fixture, MarketSelection } from '../types/sportsbook';
import { Language, getTranslation } from '../utils/i18n';

interface HeroBannerProps {
  featuredFixtures: Fixture[];
  onSelectOdds: (fixture: Fixture, marketId: string, selection: MarketSelection) => void;
  language: Language;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredFixtures,
  onSelectOdds,
  language,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = (k: string) => getTranslation(k, language);

  const slides = [
    {
      id: 'slide-1',
      badge: 'MATCH OF THE WEEK',
      title: 'Arsenal vs Chelsea',
      subtitle: 'London Derby · Live in 2nd Half · Intensifying Odds',
      image: '/src/assets/images/hero_stadium_lights_1792109161130.jpg',
      fixtureId: 'fix-1',
    },
    {
      id: 'slide-2',
      badge: 'ETHIOPIAN PREMIER LEAGUE',
      title: 'Saint George vs Ethiopian Coffee',
      subtitle: 'The Great Sheger Derby · Addis Ababa Stadium',
      image: '/src/assets/images/ethiopia_match_banner_1792109162576.jpg',
      fixtureId: 'fix-4',
    },
    {
      id: 'slide-3',
      badge: 'ACCA BOOST PROMO',
      title: 'Up to 50% Accumulator Bonus',
      subtitle: 'Combine 4+ legs to unlock multi-bet cash multiplier',
      image: '/src/assets/images/promo_accaball_boost_1792109161659.jpg',
      promo: true,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[currentSlide];
  const activeFixture = featuredFixtures.find(f => f.id === activeSlide.fixtureId);
  const matchResultMkt = activeFixture?.markets.find(m => m.type === '1X2');

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
      {/* Background Image with Measured Scrim */}
      <div className="relative h-56 sm:h-72 md:h-80 w-full overflow-hidden">
        <img
          src={activeSlide.image}
          alt={activeSlide.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Measured dark gradient scrim for WCAG AA readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080d14] via-[#080d14]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080d14] via-[#080d14]/60 to-transparent" />
      </div>

      {/* Slide Content Overlay */}
      <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-between">
        {/* Top Kicker - Clean unboxed metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="tracking-wide uppercase">{activeSlide.badge}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-400 font-normal">SIMULATED FEED</span>
          </div>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-600/70'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Center / Bottom Title and Quick Bet Controls */}
        <div className="space-y-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md text-balance">
              {activeSlide.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              {activeSlide.subtitle}
            </p>
          </div>

          {/* If match slide, render 1X2 quick odds row */}
          {activeFixture && matchResultMkt && (
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Quick 1X2:
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {matchResultMkt.selections.map(sel => (
                  <button
                    key={sel.id}
                    onClick={() => onSelectOdds(activeFixture, matchResultMkt.id, sel)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 hover:bg-emerald-600 hover:text-white border border-slate-700/80 hover:border-emerald-500 rounded-lg text-xs font-semibold text-slate-200 transition-all cursor-pointer active:scale-95 group shadow-sm"
                  >
                    <span className="truncate max-w-[100px] text-slate-300 group-hover:text-white">
                      {sel.outcomeKey === '1' ? activeFixture.homeTeam.shortCode : sel.outcomeKey === '2' ? activeFixture.awayTeam.shortCode : 'Draw'}
                    </span>
                    <span className="font-mono font-bold text-emerald-400 group-hover:text-white tabular-nums">
                      {sel.odds.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSlide.promo && (
            <div className="pt-1 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>+50% Extra Acca Profit Multiplier Active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
