const NEEDED = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
]

// Shown instead of a crash when the Firebase settings are not there yet.
function ConfigMissing() {
  const missing = NEEDED.filter((name) => !import.meta.env[name])
  return (
    <div className='mx-auto mt-20 max-w-xl px-5 text-center'>
      <h2 className='text-2xl font-bold'>Firebase is not configured yet</h2>
      <p className='mt-3 text-gray-500'>
        Copy <code>.env.example</code> to <code>.env.local</code>, fill in these values, then restart <code>npm run dev</code>:
      </p>
      <ul className='mt-4 space-y-1 font-mono text-sm'>
        {missing.map((name) => <li key={name}>{name}</li>)}
      </ul>
    </div>
  )
}

export default ConfigMissing
