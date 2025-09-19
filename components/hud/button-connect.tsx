import { useConnect } from 'wagmi'

export default function ButtonConnect() {
  const { connect, connectors } = useConnect()

  return (
    <>
      {connectors.map((connector) => (
        <button onClick={() => connect({ connector })} key={connector.id} className='bg-white text-black p-2 rounded-md pointer-events-auto'>
          Connect to {connector.name}
        </button>
      ))}
    </>
  )
}
