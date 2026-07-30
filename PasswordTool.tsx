import React, { useState } from 'react';
import { Lock, Unlock, Download } from 'lucide-react';

interface PasswordToolProps {
  onAddPassword: (password: string) => void;
  onRemovePassword: (password: string) => void;
  isProcessing: boolean;
}

export const PasswordTool: React.FC<PasswordToolProps> = ({
  onAddPassword,
  onRemovePassword,
  isProcessing,
}) => {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      alert('Please enter a password.');
      return;
    }
    if (mode === 'encrypt') {
      onAddPassword(password);
    } else {
      onRemovePassword(password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('encrypt')}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              mode === 'encrypt' ? 'bg-[#00C2CB] text-white' : 'text-slate-300'
            }`}
          >
            Add Password (AES-256)
          </button>
          <button
            type="button"
            onClick={() => setMode('decrypt')}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              mode === 'decrypt' ? 'bg-[#00C2CB] text-white' : 'text-slate-300'
            }`}
          >
            Remove Password
          </button>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'encrypt' ? 'Enter new password...' : 'Enter current password...'}
          className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-1.5 rounded-lg w-52 focus:outline-none focus:border-[#00C2CB]"
        />
      </div>

      <button
        type="submit"
        disabled={!password || isProcessing}
        className="bg-[#00C2CB] hover:bg-[#00aeb6] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
      >
        {mode === 'encrypt' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        <span>
          {isProcessing
            ? 'Processing...'
            : mode === 'encrypt'
            ? 'Encrypt & Download PDF'
            : 'Unlock & Download PDF'}
        </span>
      </button>
    </form>
  );
};
