import React from 'react';

export default function VerifyOtpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Digite o código</h1>
        <p className="text-sm text-center text-gray-500 mb-8">
          Enviamos um SMS com 6 dígitos para o seu telefone.
        </p>

        <form className="space-y-4">
          <div className="flex justify-center gap-2 mb-6">
            {/* Simple representation of 6 inputs for OTP */}
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            ))}
          </div>
          
          <button
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Confirmar Código
          </button>
        </form>

        <div className="mt-6 text-center">
          <button className="text-sm text-blue-600 hover:underline">
            Reenviar código
          </button>
        </div>
      </div>
    </div>
  );
}
