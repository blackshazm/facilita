import React from 'react';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Bem-vindo ao FACILITA</h1>
        <p className="text-sm text-center text-gray-500 mb-8">
          Digite seu telefone para entrar ou se cadastrar
        </p>

        <form className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              id="phone"
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <button
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Receber Código via SMS
          </button>
        </form>
      </div>
    </div>
  );
}
