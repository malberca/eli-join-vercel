'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'

type Unit = {
  id: string
  label: string
}

type JoinData = {
  consorcio: {
    name: string
    address: string | null
  }
  units: Unit[]
}

type Relationship = 'OWNER' | 'TENANT' | 'FAMILY' | 'COHABITANT' | 'OTHER'

const relationships: {
  value: Relationship
  label: string
}[] = [
  { value: 'OWNER', label: 'Propietario' },
  { value: 'TENANT', label: 'Inquilino' },
  { value: 'FAMILY', label: 'Familiar' },
  { value: 'COHABITANT', label: 'Conviviente' },
  { value: 'OTHER', label: 'Otro' },
]

export default function JoinOnboarding({ token }: { token: string }) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [data, setData] = useState<JoinData | null>(null)

  const [step, setStep] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [unitSearch, setUnitSearch] = useState('')
  const [unitId, setUnitId] = useState('')

  const [relationship, setRelationship] = useState<Relationship | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/join/${encodeURIComponent(token)}`)

        if (!response.ok) {
          setLoadError(true)
          return
        }

        const result = (await response.json()) as JoinData
        setData(result)
      } catch {
        setLoadError(true)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token])

  const filteredUnits = useMemo(() => {
    if (!data) return []

    const search = unitSearch.trim().toLowerCase()

    if (!search) return data.units

    return data.units.filter(unit => unit.label.toLowerCase().includes(search))
  }, [data, unitSearch])

  const selectedUnit = data?.units.find(unit => unit.id === unitId)

  function next() {
    if (transitioning) return

    setTransitioning(true)

    window.setTimeout(() => {
      setStep(current => current + 1)
      setTransitioning(false)
    }, 240)
  }

  function handleEnter(
    event: React.KeyboardEvent<HTMLInputElement>,
    value: string,
  ) {
    if (event.key === 'Enter' && value.trim()) {
      event.preventDefault()
      next()
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()

    if (!unitId || !relationship) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch(
        `/api/join/${encodeURIComponent(token)}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone,
            unitId,
            relationshipType: relationship,
          }),
        },
      )

      const result = await response.json()

      if (!response.ok) {
        if (result.code === 'ALREADY_PENDING') {
          setStep(9)
          return
        }

        setSubmitError(result.code ?? 'No pudimos enviar tu solicitud.')
        return
      }

      setStep(8)
    } catch {
      setSubmitError('No pudimos enviar tu solicitud.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EEF2FA]">
        <div className="flex h-[780px] w-full max-w-[430px] items-center justify-center rounded-[42px] bg-[#2346DD] text-white shadow-[0_24px_70px_rgba(40,61,120,0.18)]">
          <span className="animate-pulse text-sm font-semibold tracking-[0.35em]">
            ELI
          </span>
        </div>
      </main>
    )
  }

  if (loadError || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EEF2FA] px-5">
        <div className="flex min-h-[720px] w-full max-w-[430px] items-center justify-center rounded-[42px] bg-[#2346DD] px-10 text-center text-white shadow-[0_24px_70px_rgba(40,61,120,0.18)]">
          <div>
            <h1 className="text-4xl leading-tight font-bold">
              Este acceso no está disponible.
            </h1>

            <p className="mt-5 text-lg font-[100] text-white/70">
              El enlace puede haber vencido o ya no estar activo.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#EEF2FA] px-4 py-8 md:flex md:items-center md:justify-center md:py-10">
      <div className="relative mx-auto min-h-[780px] w-full max-w-[430px] overflow-hidden rounded-[42px] bg-[#2346DD] shadow-[0_30px_90px_rgba(48,70,140,0.22)]">
        <header className="relative h-[285px] bg-[#2346DD] px-8 pt-8 text-white">
          <div className="text-sm font-semibold tracking-[0.35em]">ELI</div>

          <div className="absolute right-8 bottom-12 left-8">
            <p className="text-sm font-[100] text-white/70">
              {data.consorcio.address}
            </p>
          </div>
        </header>

        <section className="relative -mt-7 min-h-[522px] rounded-t-[42px] bg-white px-8 pt-12 pb-10">
          <div
            className={`mx-auto flex min-h-[430px] max-w-[330px] flex-col justify-center transition-all duration-[420ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
              transitioning
                ? '-translate-y-8 opacity-0'
                : 'translate-y-0 opacity-100'
            }`}
          >
            {step === 0 && (
              <Screen>
                <Title>
                  <strong>Hola Vecino!</strong>
                  <span>soy Eli..</span>
                </Title>

                <p className="mt-6 text-xl leading-relaxed font-[100] text-zinc-500">
                  Bienvenido a {data.consorcio.name}.
                </p>

                <div className="mt-10 flex justify-center">
                  <CircleButton onClick={next}>→</CircleButton>
                </div>
              </Screen>
            )}

            {step === 1 && (
              <Screen>
                <Title>
                  <strong>¿Cómo</strong>
                  <span>te llamás?</span>
                </Title>

                <p className="mt-4 text-sm font-[100] text-zinc-400">
                  Solo tu nombre, el apellido va después.
                </p>

                <LineInput
                  autoFocus
                  onChange={setFirstName}
                  onKeyDown={event => handleEnter(event, firstName)}
                  placeholder="Tu nombre"
                  value={firstName}
                />

                <ContinueButton disabled={!firstName.trim()} onClick={next} />
              </Screen>
            )}

            {step === 2 && (
              <Screen>
                <Title>
                  <span>Perfecto, {firstName}.</span>
                  <strong>¿Y tu apellido?</strong>
                </Title>

                <LineInput
                  autoFocus
                  onChange={setLastName}
                  onKeyDown={event => handleEnter(event, lastName)}
                  placeholder="Tu apellido"
                  value={lastName}
                />

                <ContinueButton disabled={!lastName.trim()} onClick={next} />
              </Screen>
            )}

            {step === 3 && (
              <Screen>
                <Title>
                  <strong>¿Cuál es</strong>
                  <span>tu email?</span>
                </Title>

                <p className="mt-5 text-sm leading-relaxed font-[100] text-zinc-400">
                  Lo usamos para enviarte novedades y seguimiento de tus
                  solicitudes.
                </p>

                <LineInput
                  autoFocus
                  onChange={setEmail}
                  onKeyDown={event => handleEnter(event, email)}
                  placeholder="nombre@email.com"
                  type="email"
                  value={email}
                />

                <ContinueButton disabled={!email.trim()} onClick={next} />
              </Screen>
            )}

            {step === 4 && (
              <Screen>
                <Title>
                  <strong>¿Cuál es</strong>
                  <span>tu teléfono?</span>
                </Title>

                <LineInput
                  autoFocus
                  onChange={setPhone}
                  onKeyDown={event => handleEnter(event, phone)}
                  placeholder="+54 9 11..."
                  type="tel"
                  value={phone}
                />

                <ContinueButton disabled={!phone.trim()} onClick={next} />
              </Screen>
            )}

            {step === 5 && (
              <Screen>
                <Title>
                  <strong>¿En qué unidad</strong>
                  <span>vivís?</span>
                </Title>

                <div className="mt-10 flex justify-end">
                  <input
                    autoFocus
                    className="w-full border-0 border-b border-zinc-300 bg-transparent pb-3 text-2xl font-[100] text-zinc-950 transition outline-none placeholder:text-zinc-300 focus:border-[#2346DD]"
                    onChange={event => {
                      setUnitSearch(event.target.value)
                      setUnitId('')
                    }}
                    placeholder="Buscá tu unidad"
                    value={unitSearch}
                  />

                  <div className="mt-3 max-h-52 overflow-y-auto">
                    {filteredUnits.map(unit => (
                      <button
                        className={`flex w-full items-center justify-between border-b border-zinc-100 py-4 text-left text-base transition ${
                          unitId === unit.id
                            ? 'font-semibold text-[#2346DD]'
                            : 'font-[100] text-zinc-600'
                        }`}
                        key={unit.id}
                        onClick={() => {
                          setUnitId(unit.id)
                          setUnitSearch(unit.label)
                        }}
                        type="button"
                      >
                        <span>{unit.label}</span>
                        {unitId === unit.id && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <ContinueButton disabled={!unitId} onClick={next} />
              </Screen>
            )}

            {step === 6 && (
              <Screen>
                <Title>
                  <strong>¿Qué relación tenés</strong>
                  <span>con esa unidad?</span>
                </Title>

                <div className="mt-8 space-y-2">
                  {relationships.map(item => (
                    <button
                      className={`w-full rounded-[18px] px-5 py-4 text-left text-base transition ${
                        relationship === item.value
                          ? 'bg-[#2346DD] font-semibold text-white'
                          : 'bg-[#F4F6FA] font-[100] text-zinc-700 hover:bg-[#EBEEF5]'
                      }`}
                      key={item.value}
                      onClick={() => setRelationship(item.value)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <ContinueButton disabled={!relationship} onClick={next} />
              </Screen>
            )}

            {step === 7 && (
              <Screen>
                <Title>
                  <strong>¿Está todo</strong>
                  <span>bien?</span>
                </Title>

                <div className="mt-8 space-y-4">
                  <Review label="Nombre">
                    {firstName} {lastName}
                  </Review>

                  <Review label="Email">{email}</Review>

                  <Review label="Teléfono">{phone}</Review>

                  <Review label="Unidad">{selectedUnit?.label}</Review>

                  <Review label="Relación">
                    {
                      relationships.find(item => item.value === relationship)
                        ?.label
                    }
                  </Review>
                </div>

                {submitError && (
                  <p className="mt-5 text-sm font-medium text-red-600">
                    {submitError}
                  </p>
                )}

                <form className="mt-8" onSubmit={submit}>
                  <button
                    aria-label="Enviar solicitud"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2346DD] text-2xl text-white transition hover:scale-[1.04] disabled:opacity-40"
                    disabled={submitting}
                    type="submit"
                  >
                    {submitting ? '…' : '→'}
                  </button>
                </form>
              </Screen>
            )}

            {step === 8 && (
              <Screen>
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#2346DD] text-2xl text-white">
                  ✓
                </div>

                <Title>
                  <strong>Solicitud</strong>
                  <span>enviada.</span>
                </Title>

                <p className="mt-6 text-lg leading-relaxed font-[100] text-zinc-500">
                  La administración va a verificar tus datos antes de habilitar
                  tu acceso a ELI.
                </p>

                <p className="mt-6 text-sm font-[100] text-zinc-400">
                  Te avisaremos cuando esté listo.
                </p>
              </Screen>
            )}

            {step === 9 && (
              <Screen>
                <Title>
                  <strong>Hey, tranqui!!</strong>
                  <span>Ya tenés un registro iniciado con esos datos.</span>
                </Title>

                <p className="mt-6 text-lg leading-relaxed font-[100] text-zinc-500">
                  En minutos recibirás la confirmación del registro.
                </p>

                <p className="mt-6 text-sm font-[100] text-zinc-400">
                  Gracias.
                </p>
              </Screen>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

const Screen = ({ children }: { children: React.ReactNode }) => (
  <div className="animate-[eliStepIn_480ms_cubic-bezier(0.22,1,0.36,1)]">
    {children}
  </div>
)

const Title = ({ children }: { children: React.ReactNode }) => (
  <h1 className="flex animate-[eliTextIn_580ms_cubic-bezier(0.22,1,0.36,1)] flex-col text-[2.65rem] leading-[0.98] tracking-[-0.045em] text-zinc-950">
    {children}
  </h1>
)

const LineInput = ({
  autoFocus,
  onChange,
  onKeyDown,
  placeholder,
  type = 'text',
  value,
}: {
  value: string
  onChange: (value: string) => void
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  placeholder: string
  type?: string
  autoFocus?: boolean
}) => (
  <input
    autoFocus={autoFocus}
    className="mt-12 w-full border-0 border-b border-zinc-300 bg-transparent pb-3 text-2xl font-[100] text-zinc-950 transition outline-none placeholder:text-zinc-300 focus:border-[#2346DD]"
    onChange={event => onChange(event.target.value)}
    onKeyDown={onKeyDown}
    placeholder={placeholder}
    type={type}
    value={value}
  />
)

const ContinueButton = ({
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

const CircleButton = ({
  children,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
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

const Review = ({
  children,
  label,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="border-b border-zinc-100 pb-3">
    <div className="text-[0.7rem] font-medium tracking-[0.16em] text-zinc-400 uppercase">
      {label}
    </div>

    <div className="mt-1 text-lg font-[100] text-zinc-900">{children}</div>
  </div>
)
