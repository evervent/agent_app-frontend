'use client';

import { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(6, '').slice(0, 6).split('');

  function updateDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join('').trimEnd());
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const d = e.target.value.replace(/\D/g, '').slice(-1);
    updateDigit(index, d);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        updateDigit(index, '');
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        updateDigit(index - 1, '');
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[i] ?? ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all focus:outline-none focus:scale-105 shadow-sm
            ${
              digits[i]
                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-blue-100'
                : 'border-slate-300 bg-white text-slate-900 hover:border-blue-400'
            }
            ${
              disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
            }
          `}
        />
      ))}
    </div>
  );
}
