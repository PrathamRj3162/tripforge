import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { searchPlaces } from '@/lib/api'

// Destination search box. It asks OUR server (/api/places-autocomplete), which holds the Places key.
// `onChange` receives { label, placeId } after a suggestion is picked, and null while the user is typing.
function PlacesAutocomplete({ onChange }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [error, setError] = useState('')
  const justChose = useRef(false)

  useEffect(() => {
    if (justChose.current) {
      justChose.current = false
      return undefined
    }
    const text = query.trim()
    if (text.length < 2) {
      setSuggestions([])
      return undefined
    }
    const controller = new AbortController()
    const timer = setTimeout(() => {
      searchPlaces(text, controller.signal)
        .then((data) => {
          setSuggestions(data.suggestions ?? [])
          setActive(-1)
          setOpen(true)
          setError('')
        })
        .catch((err) => {
          if (err?.name !== 'AbortError') setError(err.message)
        })
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const choose = (item) => {
    justChose.current = true
    setQuery(item.label)
    setSuggestions([])
    setOpen(false)
    setError('')
    onChange({ label: item.label, placeId: item.id })
  }

  const onKeyDown = (e) => {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      choose(suggestions[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className='relative'>
      <Input
        placeholder='Search places'
        value={query}
        role='combobox'
        aria-expanded={open && suggestions.length > 0}
        aria-controls='place-suggestions'
        aria-autocomplete='list'
        autoComplete='off'
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          onChange(null)
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
      />
      {open && suggestions.length > 0 && (
        <ul id='place-suggestions' role='listbox' className='absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-white shadow-md'>
          {suggestions.map((item, index) => (
            <li
              key={item.id || item.label}
              role='option'
              aria-selected={index === active}
              className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${index === active ? 'bg-gray-100' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault()
                choose(item)
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
      {error && <p className='mt-1 text-xs text-red-600'>{error}</p>}
    </div>
  )
}

export default PlacesAutocomplete
