import { useFloorStore } from '@/stores/floor'
import QRCode from 'react-qr-code'

export default function Hud() {
  const {
    showAttackButton,
    performAttackSequence,
    trippHP,
    trippMaxHP,
    trippDamage,
    bossHP,
    bossMaxHP,
    showBuyCokeButton,
    performBuyCoke,
    score,
    showWinModal,
    setShowWinModal,
    winCode,
  } = useFloorStore()

  const slots = [0, 1, 2]

  return (
    <div className='fixed z-[9999] pointer-events-none top-0 left-0 w-full h-full'>
      <aside className='absolute select-none top-4 left-1/2 flex justify-between -translate-x-1/2 pointer-events-none md:w-[700px] w-full px-4'>
        <div className='font-oc-format flex text-lg flex-col gap-1 p-4 bg-[#6A371D] border-[#B05100] border-[3px] rounded-3xl relative leading-none text-white tracking-wider'>
          <span className='text-xl'>Mission: Beat Grub</span>
          <span className='after:content-[""] after:absolute after:left-0 after:w-full after:h-1 w-fit after:top-1/2 after:-translate-y-1/2 after:bg-white relative'>
            1 — Find Grub
          </span>
          {/* <span className='after:content-[""] after:absolute after:left-0 after:w-full after:h-1 w-fit after:top-1/2 after:-translate-y-1/2 after:bg-white relative'>
            2 — Get a Coke
          </span> */}
          {/* <span className='after:content-[""] after:absolute after:left-0 after:w-full after:h-1 w-fit after:top-1/2 after:-translate-y-1/2 after:bg-white relative'>
            3 — Hit Grub
          </span> */}
        </div>
        <ul className='flex gap-1'>
          {slots.map((i) => (
            <li key={i} className='w-8 aspect-square'>
              <img src={i < score ? '/elements/chestnut.png' : '/elements/chestnut-silhouette.png'} alt='Chestnut' />
            </li>
          ))}
        </ul>
      </aside>

      {/* Win Modal */}
      {showWinModal && (
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
      )}

      {showAttackButton && (
        <div className='absolute bottom-4 right-4 pointer-events-none'>
          <button className='pointer-events-auto px-6 py-3 rounded-md bg-red-600 text-white text-lg shadow-lg' onClick={performAttackSequence}>
            Attack
          </button>
        </div>
      )}

      {showBuyCokeButton && (
        <div className='absolute bottom-[5.5rem] right-4 pointer-events-none'>
          <button className='pointer-events-auto px-6 py-3 rounded-md bg-emerald-600 text-white text-lg shadow-lg' onClick={performBuyCoke}>
            Buy&nbsp;Coke
          </button>
        </div>
      )}

      {/* Bottom-center player UI */}
      <div className='absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none'>
        <div className='pointer-events-auto rounded-md bg-black/50 text-white px-4 py-2 text-sm flex gap-4'>
          <span>
            Tripp&nbsp;HP:&nbsp;{trippHP}/{trippMaxHP}
          </span>
          <span>DMG:&nbsp;{trippDamage}</span>
          <span>
            Boss&nbsp;HP:&nbsp;{bossHP}/{bossMaxHP}
          </span>
        </div>
      </div>
    </div>
  )
}
