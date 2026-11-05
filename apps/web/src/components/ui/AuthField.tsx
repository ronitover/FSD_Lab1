import { Check, Eye, EyeOff, type LucideIcon } from 'lucide-react';
import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { passwordStrength } from '../../lib/passwordStrength.ts';
import { useAuthMascot } from '../layout/authMascot.ts';

type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'type' | 'placeholder' | 'className'
>;

interface AuthFieldProps extends InputProps {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'password';
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  /** Shows a green tick once the value looks right. */
  valid?: boolean;
  /** For new passwords: a meter showing how strong it is. */
  showStrength?: boolean;
}

const SHAKE = { x: [0, -9, 9, -6, 6, -2, 0], transition: { duration: 0.45 } };

let measureCanvas: HTMLCanvasElement | null = null;

/** Where the text cursor is on screen, so the mascot can look at it while someone types. */
function caretPoint(input: HTMLInputElement) {
  const style = getComputedStyle(input);
  measureCanvas ??= document.createElement('canvas');
  const context = measureCanvas.getContext('2d');
  const box = input.getBoundingClientRect();
  if (!context) return { x: box.left, y: box.top + box.height / 2 };
  context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const before = input.value.slice(0, input.selectionStart ?? input.value.length);
  const width = context.measureText(before).width;
  const left = box.left + parseFloat(style.paddingLeft) - input.scrollLeft;
  return { x: Math.min(left + width, box.right - 8), y: box.top + box.height / 2 };
}

/**
 * The text field used on the sign-in screens: an icon, a label that floats up when there is text,
 * a glow on focus, a tick when the value is valid, and a shake when there's an error.
 * Password fields get a show/hide toggle and, for new passwords, a strength meter.
 */
export function AuthField({
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
  error,
  hint,
  optional,
  valid,
  showStrength,
  ...input
}: AuthFieldProps) {
  const id = useId();
  const mascot = useAuthMascot();
  const [revealed, setRevealed] = useState(false);
  const secret = type === 'password';
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  function track(event: SyntheticEvent<HTMLInputElement>) {
    if (secret) mascot.secret(true, revealed);
    else mascot.lookAt(caretPoint(event.currentTarget));
  }

  function toggleReveal() {
    const next = !revealed;
    setRevealed(next);
    mascot.secret(true, next);
  }

  return (
    <div>
      <m.div className="relative" animate={error ? SHAKE : { x: 0 }}>
        <input
          id={id}
          type={secret && revealed ? 'text' : type}
          value={value}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => {
            onChange(event.target.value);
            track(event);
          }}
          onFocus={track}
          onKeyUp={track}
          onClick={track}
          onBlur={() => (secret ? mascot.secret(false) : mascot.lookAt(null))}
          className={`peer block h-14 w-full rounded-2xl border bg-cream/60 pt-5 pr-11 pb-1.5 pl-11 text-[15px] text-ink transition duration-200 outline-none focus:bg-surface focus:ring-4 ${
            error
              ? 'border-danger/70 focus:border-danger focus:ring-danger/15'
              : 'border-forest/15 hover:border-forest/35 focus:border-moss focus:ring-moss/15'
          }`}
          {...input}
        />
        <Icon
          className={`pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 transition-colors duration-200 ${
            error ? 'text-danger' : 'text-forest/40 peer-focus:text-moss'
          }`}
          aria-hidden="true"
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute top-2 left-11 text-[11px] font-semibold tracking-wide text-forest/60 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:font-medium peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:tracking-wide peer-focus:text-moss"
        >
          {label}
          {optional && <span className="ml-1 font-normal text-forest/45">(optional)</span>}
        </label>

        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
          <AnimatePresence>
            {valid && !error && !secret && (
              <m.span
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="flex size-6 items-center justify-center rounded-full bg-moss text-white"
                aria-hidden="true"
              >
                <Check className="size-3.5" strokeWidth={3} />
              </m.span>
            )}
          </AnimatePresence>
          {secret && (
            <button
              type="button"
              // Keep focus in the field, so the mascot knows it's still a password being typed.
              onMouseDown={(event) => event.preventDefault()}
              onClick={toggleReveal}
              className="flex size-8 items-center justify-center rounded-full text-forest/50 transition hover:bg-forest/5 hover:text-forest"
              aria-label={revealed ? 'Hide password' : 'Show password'}
              aria-pressed={revealed}
            >
              {revealed ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          )}
        </div>
      </m.div>

      {showStrength && <StrengthMeter password={value} />}

      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <m.p
            key="error"
            id={`${id}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 pl-1 text-xs font-medium text-danger"
          >
            {error}
          </m.p>
        ) : hint && !showStrength ? (
          <p key="hint" id={`${id}-hint`} className="mt-1.5 pl-1 text-xs text-forest/55">
            {hint}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const METER_COLOURS = ['bg-danger', 'bg-orange', 'bg-amber-400', 'bg-moss', 'bg-moss'];

/** Four bars that fill and change colour as the password gets stronger. */
function StrengthMeter({ password }: { password: string }) {
  const { score, label } = passwordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2 flex items-center gap-3 pl-1" aria-live="polite">
      <div className="flex flex-1 gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((bar) => (
          <span key={bar} className="h-1.5 flex-1 overflow-hidden rounded-full bg-forest/10">
            <m.span
              className={`block h-full rounded-full ${METER_COLOURS[score]}`}
              initial={false}
              animate={{ scaleX: score >= bar || (bar === 1 && score === 0) ? 1 : 0 }}
              style={{ originX: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </span>
        ))}
      </div>
      <span className="w-20 text-right text-xs font-semibold text-forest/70">{label}</span>
    </div>
  );
}
