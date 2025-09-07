import { useFloorStore } from '@/stores/floor'

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
  } = useFloorStore()

  const slots = [0, 1, 2]

  return (
    <div className='fixed z-[10] pointer-events-none top-0 left-0 w-full h-full'>
      <aside className='absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none'>
        <ul className='flex gap-1'>
          {slots.map((i) => (
            <li key={i} className='w-8 aspect-square'>
              <img
                src={i < score ? '/elements/chestnut.png' : '/elements/chestnut-silhouette.png'}
                alt='Chestnut'
              />
            </li>
          ))}
        </ul>
      </aside>

      {showAttackButton && (
        <div className='absolute bottom-4 right-4 pointer-events-none'>
          <button
            className='pointer-events-auto px-6 py-3 rounded-md bg-red-600 text-white text-lg shadow-lg'
            onClick={performAttackSequence}>
            Attack
          </button>
        </div>
      )}

      {showBuyCokeButton && (
        <div className='absolute bottom-[5.5rem] right-4 pointer-events-none'>
          <button
            className='pointer-events-auto px-6 py-3 rounded-md bg-emerald-600 text-white text-lg shadow-lg'
            onClick={performBuyCoke}>
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
