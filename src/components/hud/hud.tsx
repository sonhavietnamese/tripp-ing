export default function Hud() {
  return (
    <div className='fixed z-[10] pointer-events-none top-0 left-0 w-full h-full'>
      <aside className='absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none'>
        <ul className='flex gap-1'>
          <li className='w-8 aspect-square'>
            <img src='/elements/chestnut.png' alt='Chestnut' />
          </li>
          <li className='w-8 aspect-square'>
            <img src='/elements/chestnut.png' alt='Chestnut' />
          </li>
          <li className='w-8 aspect-square'>
            <img src='/elements/chestnut-silhouette.png' alt='Chestnut' />
          </li>
        </ul>
      </aside>
    </div>
  )
}
