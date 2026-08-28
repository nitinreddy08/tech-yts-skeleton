'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { SpecTemplate, SpecField } from '@/types'

interface DynamicSpecFormProps {
  categoryId: string | null
  existingSpecs?: Record<string, string | number | boolean | null>
  onChange?: (specs: Record<string, string | number | boolean | null>) => void
  onSubmit?: (specs: Record<string, string | number | boolean | null>) => void
  standalone?: boolean
}

export function DynamicSpecForm({
  categoryId,
  existingSpecs,
  onChange,
  onSubmit,
  standalone = false,
}: DynamicSpecFormProps) {
  const [template, setTemplate] = useState<SpecTemplate | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Record<string, string | number | boolean | null>>({
    defaultValues: existingSpecs ?? {},
  })

  useEffect(() => {
    if (!categoryId) {
      setTemplate(null)
      reset({})
      return
    }

    setLoading(true)
    fetch(`/api/mock/categories/by-id/${categoryId}`)
      .then(r => (r.ok ? r.json() : null))
      .then((data: { spec_template?: SpecTemplate } | null) => {
        if (data?.spec_template) {
          setTemplate(data.spec_template)
          const defaults: Record<string, string | number | boolean | null> = {}
          for (const field of data.spec_template.fields) {
            defaults[field.key] =
              existingSpecs?.[field.key] ??
              (field.defaultValue !== undefined ? field.defaultValue : null)
          }
          reset(defaults)
        } else {
          setTemplate(null)
          reset({})
        }
      })
      .catch(() => {
        setTemplate(null)
        reset({})
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId])

  const watchedValues = watch()
  useEffect(() => {
    if (template && onChange) onChange(watchedValues as Record<string, string | number | boolean | null>)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)])

  if (!categoryId) return null
  if (loading) return <p className="text-sm text-muted">Loading spec fields…</p>
  if (!template || !template.fields.length) return null

  const fields = (
    <div className="flex flex-col gap-4">
      {template.fields.map(field => (
        <SpecFieldInput
          key={field.key}
          field={field}
          register={register}
          setValue={setValue}
          watch={watch}
          error={errors[field.key]?.message as string | undefined}
        />
      ))}
    </div>
  )

  if (standalone) {
    return (
      <form onSubmit={handleSubmit(data => onSubmit?.(data))} noValidate>
        {fields}
        <button
          type="submit"
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Save Specs
        </button>
      </form>
    )
  }

  return fields
}

interface SpecFieldInputProps {
  field: SpecField
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: any
  error?: string
}

function SpecFieldInput({ field, register, setValue, watch, error }: SpecFieldInputProps) {
  const inputId = `spec-${field.key}`
  const value = watch(field.key)
  const errorBorder = error ? 'border-red-400' : ''

  const validationRules = field.required
    ? {
        validate: (v: string | number | boolean | null | undefined) =>
          v === null || v === undefined || v === '' ? `${field.label} is required` : true,
      }
    : {}

  const INPUT_BASE = `w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-accent ${errorBorder}`

  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-muted">
        {field.label}
        {field.unit && <span className="ml-1 text-xs text-muted">({field.unit})</span>}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {field.type === 'text' && (
        <input
          id={inputId}
          type="text"
          {...register(field.key, validationRules)}
          className={INPUT_BASE}
        />
      )}

      {field.type === 'number' && (
        <input
          id={inputId}
          type="number"
          {...register(field.key, {
            ...validationRules,
            setValueAs: (v: string) => (v === '' ? null : Number(v)),
          })}
          className={INPUT_BASE}
        />
      )}

      {field.type === 'boolean' && (
        <div className="flex items-center gap-2">
          <input
            id={inputId}
            type="checkbox"
            {...register(field.key)}
            className="h-4 w-4 accent-accent"
          />
          <span className="text-sm text-muted">Yes</span>
        </div>
      )}

      {field.type === 'select' && field.options && (
        <select id={inputId} {...register(field.key, validationRules)} className={INPUT_BASE}>
          <option value="">— Select —</option>
          {field.options.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {field.type === 'multiselect' && field.options && (
        <div className="flex flex-wrap gap-2">
          {field.options.map(opt => {
            const current: string[] = Array.isArray(value) ? value : []
            const checked = current.includes(opt)
            return (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-1.5 text-sm text-primary"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => {
                    const next = e.target.checked
                      ? [...current, opt]
                      : current.filter(v => v !== opt)
                    setValue(field.key, next.length ? next : null, { shouldValidate: true })
                  }}
                  className="accent-accent"
                />
                {opt}
              </label>
            )
          })}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
