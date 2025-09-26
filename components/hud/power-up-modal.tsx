import { useFloorStore } from '@/stores/floor'
import { trackButtonClick } from '@/lib/button-tracking'

export default function PowerUpModal() {
  const { showPowerUpModal, setShowPowerUpModal, performQRAnimation } = useFloorStore()

  if (!showPowerUpModal) return null

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center pointer-events-auto z-[10000] opacity-0 animate-[fade-in_300ms_ease-out_forwards]'>
      <div className='relative opacity-0 animate-[slide-up-fade_400ms_ease-out_75ms_forwards] p-10'>
        <img src='/elements/webp/panel-power-up.webp' alt='Power Up' className='w-[540px] max-w-full h-auto' />

        {/* Back to Battle button */}
        <button
          className='absolute bottom-14 left-1/2 -translate-x-1/2 sm:bottom-20'
          onClick={() => {
            trackButtonClick({
              buttonName: 'power_up_back_to_battle',
              section: 'power_up_modal'
            })
            setShowPowerUpModal(false)
            performQRAnimation()
          }}>
          <img src='/elements/webp/element-button-back-to-battle.webp' alt='Back to Battle' className='w-[200px] sm:w-[220px] h-auto' />
        </button>
      </div>
    </div>
  )
}
