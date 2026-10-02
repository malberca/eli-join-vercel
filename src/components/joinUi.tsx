import type { KeyboardEventHandler, ReactNode, Ref } from 'react'

// Solo se muestra un paso a la vez: los campos usan este id como nombre accesible.
export const STEP_TITLE_ID = 'join-step-title'

export const Screen = ({ children }: { children: ReactNode }) => (
  <div className="animate-[eliStepIn_480ms_cubic-bezier(0.22,1,0.36,1)]">
    {children}
  </div>
)

export const Title = ({ children }: { children: ReactNode }) => (
  <h1
    className="flex animate-[eliTextIn_580ms_cubic-bezier(0.22,1,0.36,1)] flex-col text-[2.65rem] leading-[0.98] tracking-[-0.045em] text-zinc-950"
    id={STEP_TITLE_ID}
  >
    {children}
  </h1>
)

export const LineInput = ({
  inputRef,
  onChange,
  onKeyDown,
  placeholder,
  type = 'text',
  value,
}: {
  inputRef: Ref<HTMLInputElement>
  onChange: (value: string) => void
  onKeyDown: KeyboardEventHandler<HTMLInputElement>
  placeholder: string
  type?: string
  value: string
}) => (
  <input
    aria-labelledby={STEP_TITLE_ID}
    className="mt-12 w-full border-0 border-b border-zinc-300 bg-transparent pb-3 text-2xl font-[100] text-zinc-950 transition outline-none placeholder:text-zinc-300 focus:border-[#2346DD]"
    onChange={event => onChange(event.target.value)}
    onKeyDown={onKeyDown}
    placeholder={placeholder}
    ref={inputRef}
    type={type}
    value={value}
  />
)

export const CircleButton = ({
  children,
  disabled = false,
  onClick,
}: {
  children: ReactNode
  disabled?: boolean
  onClick: () => void
}) => (
  <button
    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2346DD] text-2xl font-[100] text-white transition hover:scale-[1.05] disabled:opacity-30"
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
)

export const ContinueButton = ({
  disabled,
  onClick,
}: {
  disabled: boolean
  onClick: () => void
}) => (
  <div className="mt-8 flex items-center justify-end gap-4">
    <CircleButton disabled={disabled} onClick={onClick}>
      →
    </CircleButton>

    <span className="text-xs font-[100] text-zinc-400">ENTER ↵</span>
  </div>
)

export const Review = ({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) => (
  <div className="border-b border-zinc-100 pb-3">
    <div className="text-[0.7rem] font-medium tracking-[0.16em] text-zinc-400 uppercase">
      {label}
    </div>

    <div className="mt-1 text-lg font-[100] text-zinc-900">{children}</div>
  </div>
)
