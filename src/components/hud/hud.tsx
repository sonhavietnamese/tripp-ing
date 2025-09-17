import { useEffect } from 'react'
import { useFloorStore } from '@/stores/floor'
import QRCode from 'react-qr-code'
import { cn } from '@/lib/utils'

export default function Hud() {
  const {
    showAttackButton,
    performAttackSequence,
    trippHP,
    trippMaxHP,
    trippDamage,
    showBuyCokeButton,
    performBuyCoke,
    score,
    /* onboarding */
    showOnboardingModal,
    setShowOnboardingModal,
    hasOnboarded,
    setHasOnboarded,
    missionStep,
    /* shop */
    showShopModal,
    setShowShopModal,
    showWinModal,
    winCode,
  } = useFloorStore()

  /* ---------------- Onboarding delay ---------------- */
  useEffect(() => {
    // show onboarding modal after 2 s
    const t = setTimeout(() => setShowOnboardingModal(true), 2000)
    return () => clearTimeout(t)
  }, [])

  const slots = [0, 1, 2]

  return (
    <div className='fixed z-[9999] pointer-events-none top-0 left-0 w-full h-full'>
      {/* Top mission bar & score — hidden during onboarding */}
      {hasOnboarded && (
        <aside
          id='mission-bar'
          className='absolute select-none top-4 left-1/2 flex justify-between -translate-x-1/2 pointer-events-none md:w-[700px] w-full px-4 origin-top-left opacity-0 animate-[slide-down-fade_400ms_ease-out_50ms_forwards]'>
          <div className='font-oc-format flex text-lg flex-col p-2 bg-[#6A371D] border-[#B05100] border-[3px] rounded-2xl relative leading-none text-white tracking-wider'>
            <span className='text-base'>Mission: Beat Grub</span>
            {/* dynamic mission lines */}
            {['Find Grub', 'Get a Coke', 'Hit Grub'].map((label, i) => {
              const completed = missionStep > i
              const future = missionStep < i
              return (
                <span
                  key={label}
                  className={cn(
                    'text-sm ml-1',
                    completed &&
                      'relative w-fit after:content-[""] leading-none after:absolute after:left-0 after:w-full after:h-1 after:top-1/2 after:-translate-y-1/2 after:bg-white',
                    future && 'opacity-60',
                  )}>
                  {i + 1} — {label}
                </span>
              )
            })}
          </div>
          <ul id='score-slots' className='flex gap-1 opacity-0 animate-[slide-down-fade_400ms_ease-out_100ms_forwards]'>
            {slots.map((i) => (
              <li key={i} className='w-8 aspect-square'>
                <img src={i < score ? '/elements/chestnut.png' : '/elements/chestnut-silhouette.png'} alt='Chestnut' />
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Onboarding Modal */}
      {showOnboardingModal && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center pointer-events-auto z-[10000] opacity-0 animate-[fade-in_300ms_ease-out_forwards]'>
          <div className='relative opacity-0 animate-[slide-up-fade_400ms_ease-out_75ms_forwards] p-10'>
            <img src='/elements/panel-onboarding.png' alt='Onboarding' className='w-[540px] max-w-full h-auto' fetchPriority='high' />
            <button
              className='absolute bottom-14 right-16 sm:right-20 sm:bottom-20'
              onClick={() => {
                setShowOnboardingModal(false)
                setHasOnboarded(true)
              }}>
              <img src='/elements/element-button-ok.png' alt='OK' className='sm:w-[80px] w-[60px] h-auto' fetchPriority='high' />
            </button>
          </div>
        </div>
      )}

      {/* Win Modal */}
      {showWinModal && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center pointer-events-auto z-[10000]'>
          <div className='p-6 max-w-sm text-center flex flex-col items-center gap-4 relative'>
            <img src='/elements/panel-qr.png' alt='Win' className='w-[540px] translate-x-[6%] max-w-full h-auto' />
            <QRCode value={winCode} size={180} className='absolute top-[13%] rounded-xl' bgColor='#361607' fgColor='#F9F9F9' />
            <span className='absolute bottom-[16%] left-[20%] z-10 font-oc-format text-white'>({winCode})</span>
          </div>
        </div>
      )}

      {/* Attack button hidden during onboarding */}
      {showAttackButton && hasOnboarded && (
        <div className='absolute bottom-[18%] active:scale-[.8] transition-transform duration-100 left-1/2 w-[100px] h-[100px] flex justify-center items-center -translate-x-1/2 pointer-events-none'>
          <button
            className='pointer-events-auto w-full h-full bg-[url(/elements/element-button-attack.png)] bg-no-repeat bg-center bg-contain'
            onClick={performAttackSequence}></button>
        </div>
      )}

      {/* Buy Coke button hidden during onboarding */}
      {showBuyCokeButton && hasOnboarded && (
        <div className='absolute bottom-[16%] active:scale-[.8] transition-transform duration-100 left-1/2 w-[140px] h-[100px] flex justify-center items-center -translate-x-1/2 pointer-events-none'>
          <button
            className='pointer-events-auto w-full h-full bg-[url(/elements/element-button-enter.png)] bg-no-repeat bg-center bg-contain'
            onClick={() => setShowShopModal(true)}></button>
        </div>
      )}

      {/* Shop Modal */}
      {showShopModal && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center pointer-events-auto z-[10000] opacity-0 animate-[fade-in_300ms_ease-out_forwards]'>
          <div className='relative opacity-0 animate-[slide-up-fade_400ms_ease-out_75ms_forwards] p-10'>
            <img src='/elements/panel-shop.png' alt='Shop' className='w-[540px] max-w-full h-auto' />
            <button
              className='absolute bottom-14 right-16 sm:right-20 sm:bottom-20'
              onClick={() => {
                setShowShopModal(false)
                performBuyCoke()
              }}>
              <img src='/elements/element-button-buy.png' alt='Buy' className='sm:w-[80px] w-[60px] h-auto' />
            </button>
          </div>
        </div>
      )}

      {/* Bottom-center player UI — hidden during onboarding */}
      {hasOnboarded && (
        <div
          id='player-ui'
          className='absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none w-[280px] scale-[0.9] opacity-0 animate-[slide-up-fade_450ms_ease-out_100ms_forwards]'>
          <img src='/elements/panel-player.png' className='w-full h-auto top-0 left-0' />
          <img src='/elements/avatar-normal.png' className='absolute w-[130px] h-auto top-[-4px] left-[-18px]' />
          <div className='absolute top-[24px] left-0 w-full h-full pl-[120px] pr-10 flex flex-col gap-2'>
            <div className='flex items-center gap-2 font-ciko text-white text-2xl w-full justify-between'>
              <img src='/elements/element-hp.png' className='h-[30px] w-auto top-0 left-0' />
              <span>
                {trippHP}/{trippMaxHP}
              </span>
            </div>
            <div className='flex items-center gap-2 font-ciko text-white text-2xl w-full justify-between'>
              <img src='/elements/element-dmg.png' className='h-[32px] w-auto top-0 left-0' />
              <span>{trippDamage}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
