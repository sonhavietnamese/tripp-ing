import { useEffect } from 'react'
import { useFloorStore } from '@/stores/floor'
import QRCode from 'react-qr-code'
import { cn } from '@/lib/utils'
import InventoryModal from './inventory-modal'
import PowerUpModal from './power-up-modal'

export default function Hud() {
  const {
    showAttackButton,
    performAttackSequence,
    trippHP,
    trippMaxHP,
    trippDamage,
    showBuyCokeButton,
    performBuyCoke,
    /* onboarding */
    showOnboardingModal,
    setShowOnboardingModal,
    hasOnboarded,
    setHasOnboarded,
    missionStep,
    /* shop */
    showShopModal,
    setShowShopModal,
    /* inventory */
    setShowInventoryModal,
    showWinModal,
    setShowWinModal,
    winCode,
    /* Item animation */
    showItemAnimation,
    itemAnimationType,
    inventoryIconScale,
    itemAnimationTarget,
    /* Player management */
    initializePlayer,
  } = useFloorStore()

  /* ---------------- Player initialization ---------------- */
  useEffect(() => {
    initializePlayer()
  }, [initializePlayer])

  /* ---------------- Onboarding delay ---------------- */
  useEffect(() => {
    // show onboarding modal after 2 s
    const t = setTimeout(() => setShowOnboardingModal(true), 2000)
    return () => clearTimeout(t)
  }, [setShowOnboardingModal])

  const slots = [0, 1, 2]
  /* ---------------- Low-HP vignette ---------------- */
  const lowHP = hasOnboarded && trippHP > 0 && trippHP <= Math.max(1, Math.ceil(trippMaxHP * 0.33))

  return (
    <div className='fixed z-[9999] pointer-events-none top-0 left-0 w-full h-full'>
      {/* Vignette when HP is critical (below 33% or 1) */}
      {lowHP && (
        <div className='fixed inset-0 pointer-events-none z-[9900] opacity-0 vignette-overlay animate-[vignette-pulse_1100ms_ease-in-out_infinite]' />
      )}

      {/* Top mission bar & score — hidden during onboarding */}
      {hasOnboarded && (
        <aside
          id='mission-bar'
          className='absolute select-none scale-[.8] origin-top-left top-4 left-1/2 flex justify-between -translate-x-1/2 pointer-events-none md:w-[700px] w-full px-4  opacity-0 animate-[slide-down-fade_400ms_ease-out_50ms_forwards]'>
          <div className='font-oc-format flex text-lg flex-col gap-1 p-4 bg-[#6A371D] border-[#B05100] border-[3px] rounded-3xl relative leading-none text-white tracking-wider'>
            <span className='text-lg'>Mission: Beat Grub</span>
            {/* dynamic mission lines */}
            {['Find Grub', 'Get a Coke', 'Hit Grub'].map((label, i) => {
              const completed = missionStep > i
              const future = missionStep < i
              return (
                <span
                  key={label}
                  className={cn(
                    completed &&
                      'relative w-fit after:content-[""] after:absolute after:left-0 after:w-full after:h-1 after:top-1/2 after:-translate-y-1/2 after:bg-white',
                    future && 'opacity-60',
                  )}>
                  {i + 1} — {label}
                </span>
              )
            })}
          </div>
          {/* <ul id='score-slots' className='flex gap-1 opacity-0 animate-[slide-down-fade_400ms_ease-out_100ms_forwards]'>
            {slots.map((i) => (
              <li key={i} className='w-8 aspect-square'>
                <img src={i < score ? '/elements/chestnut.png' : '/elements/chestnut-silhouette.png'} alt='Chestnut' />
              </li>
            ))}
          </ul> */}
        </aside>
      )}

      {/* Onboarding Modal */}
      {showOnboardingModal && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center pointer-events-auto z-[10000] opacity-0 animate-[fade-in_300ms_ease-out_forwards]'>
          {/* Panel container to anchor the OK button */}
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
      {/* {showWinModal && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center pointer-events-auto z-[10000]'>
          <div className='bg-white rounded-lg p-6 max-w-sm text-center shadow-xl flex flex-col items-center gap-4'>
            <h2 className='text-xl font-bold text-emerald-700'>Coke Power up!</h2>
            <p className='text-sm text-gray-700'>Here&#39;s your code, let&#39;s go pick one in your nearest store</p>
            <QRCode value={winCode} size={128} />
            <code className='font-mono text-sm'>{winCode}</code>
            <button className='mt-2 px-4 py-2 bg-emerald-600 text-white rounded-md shadow' onClick={() => setShowWinModal(false)}>
              Close
            </button>
          </div>
        </div>
      )} */}

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
        <aside className='absolute bottom-8 w-full flex justify-between items-center px-4 md:w-[700px] left-1/2 -translate-x-1/2 pointer-events-auto select-none'>
          <div
            id='player-ui'
            className='pointer-events-none w-[280px] scale-[0.8] origin-bottom-left opacity-0 animate-[slide-up-fade_450ms_ease-out_100ms_forwards]'>
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
          <button
            id='player-ui-inventory'
            className={cn(
              'h-[100px] w-[100px] animate-[slide-up-fade_450ms_ease-out_100ms_forwards] pointer-events-auto scale-[.8] origin-bottom-right transition-transform',
              inventoryIconScale && 'animate-[inventory-scale-bounce_600ms_ease-out]',
            )}
            onClick={() => setShowInventoryModal(true)}>
            <img src='/elements/element-button-inventory.png' className='h-full w-auto' />
          </button>
        </aside>
      )}

      {/* Inventory Modal */}
      <InventoryModal />

      {/* Power-up Modal */}
      <PowerUpModal />

      {/* Item Animation */}
      {showItemAnimation && itemAnimationTarget && itemAnimationType && typeof window !== 'undefined' && (
        <div
          className='fixed top-1/2 left-1/2 z-[9998] pointer-events-none'
          style={
            {
              '--target-x': `${itemAnimationTarget.x - window.innerWidth / 2}px`,
              '--target-y': `${itemAnimationTarget.y - window.innerHeight / 2}px`,
            } as React.CSSProperties
          }>
          <img
            src={itemAnimationType === 'qr' ? '/elements/qr.png' : '/elements/chestnut.png'}
            alt={itemAnimationType === 'qr' ? 'QR Code' : 'Chestnut'}
            className='w-[80px] h-[80px] animate-[qr-curve-to-inventory_1500ms_ease-out_forwards]'
          />
        </div>
      )}
    </div>
  )
}
