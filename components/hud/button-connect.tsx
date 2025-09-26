import { useConnect } from 'wagmi'
import { trackButtonClick } from '@/lib/button-tracking'

export default function ButtonConnect() {
  const { connect, connectors } = useConnect()

  return (
    <>
      {connectors.map((connector) => (
        <button onClick={() => {
          trackButtonClick({
            buttonName: 'wallet_connect',
            section: 'wallet',
            variant: connector.name.toLowerCase(),
            metadata: { connector_id: connector.id }
          })
          connect({ connector })
        }} key={connector.id} className='bg-white text-black p-2 rounded-md pointer-events-auto'>
          Connect to {connector.name}
        </button>
      ))}
    </>
  )
}
