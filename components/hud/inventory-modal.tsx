import { useFloorStore } from '@/stores/floor'
import { useEffect } from 'react'
import QRCode from 'react-qr-code'

export default function InventoryModal() {
  const { showInventoryModal, setShowInventoryModal, winCode, inventoryItems, selectedInventoryItemId, setSelectedInventoryItemId } = useFloorStore()

  // Auto-select first item when modal opens and no item is selected
  useEffect(() => {
    if (showInventoryModal && inventoryItems.length > 0 && !selectedInventoryItemId) {
      setSelectedInventoryItemId(inventoryItems[0].id)
    }
  }, [showInventoryModal, inventoryItems, selectedInventoryItemId, setSelectedInventoryItemId])

  if (!showInventoryModal) return null

  const selectedItem = inventoryItems.find((item) => item.id === selectedInventoryItemId)

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center pointer-events-auto z-[10000] opacity-0 animate-[fade-in_300ms_ease-out_forwards]'>
      <div className='relative opacity-0 animate-[slide-up-fade_400ms_ease-out_75ms_forwards] p-10'>
        <img src='/elements/panel-inventory.png' alt='Inventory' className='w-[540px] max-w-full h-auto' />

        {/* Close button at top left corner */}
        <button className='absolute top-12 right-12 z-10' onClick={() => setShowInventoryModal(false)}>
          <img src='/elements/element-button-close.png' alt='Close' className='w-[40px] sm:w-[60px] h-auto' />
        </button>

        {/* Inventory details - top section */}
        <div className='absolute top-12 md:top-24 left-0 w-full h-[320px] px-24 sm:px-32 pt-16'>
          <div className='w-full h-full rounded-2xl flex flex-col items-center gap-2 sm:gap-4'>
            {selectedItem && (
              <>
                {selectedItem.id === 'qr-code' ? (
                  <div className='flex items-center justify-center'>
                    <QRCode
                      value={winCode}
                      size={100}
                      height={100}
                      className='flex w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] aspect-square'
                      bgColor='#361607'
                      fgColor='#fff'
                    />
                  </div>
                ) : (
                  <img src={selectedItem.image} alt={selectedItem.name} className='w-[100px] sm:w-[150px] h-auto' />
                )}

                <span className='text-white text-lg font-ciko mt-2 sm:text-3xl'>{selectedItem.name}</span>
                <span className='text-white text-sm font-oc-format text-center sm:text-lg'>{selectedItem.description}</span>
              </>
            )}
          </div>
        </div>

        {/* Inventory items - bottom section */}

        <div className='absolute bottom-14 left-1/2 -translate-x-1/2 px-28 sm:bottom-20'>
          <div className='relative h-[60px] sm:h-[80px]'>
            {inventoryItems.length > 0 ? (
              <div className='flex gap-4 h-full w-auto'>
                {inventoryItems.map((item) => (
                  <button
                    key={item.id}
                    className={`h-full rounded-2xl p-1 transition-all aspect-square ${
                      selectedInventoryItemId === item.id ? 'bg-[#5A2D1A] ring-2 ring-yellow-400' : 'bg-[#361607] hover:bg-[#4A2012]'
                    }`}
                    onClick={() => setSelectedInventoryItemId(item.id)}>
                    <img src={item.image} alt={item.name} className='object-contain' />
                  </button>
                ))}
              </div>
            ) : (
              <div className='flex items-center justify-center h-full'>
                <div className='w-[300px] h-full rounded-2xl flex items-center justify-center'>
                  <span className='text-gray-400 text-sm font-oc-format sm:text-lg'>No items</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
