import VaultComponent from "./vault"

export default function VaultPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-800 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white text-center mb-8">Secure Vault</h1>
        <VaultComponent />
      </div>
    </div>
  )
}

