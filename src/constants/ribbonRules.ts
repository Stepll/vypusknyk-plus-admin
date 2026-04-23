export type RibbonColor =
  | 'blue-yellow'
  | 'blue'
  | 'red'
  | 'white'
  | 'burgundy'
  | 'ivory'
  | 'gold'
  | 'silver'

export type PrintType = 'foil' | 'film' | '3d'
export type Material  = 'atlas' | 'silk' | 'satin'
export type TextColor = 'white' | 'black' | 'gold'
export type ExtraTextColor = 'white' | 'yellow'
export type Font = 'classic' | 'italic' | 'print'

export interface RibbonState {
  mainText: string
  school: string
  comment: string
  printType: PrintType
  color: RibbonColor
  material: Material
  textColor: TextColor
  extraTextColor: ExtraTextColor
  font: Font
  emblemKey: number
}

export const RIBBON_COLORS: { value: string; label: string; hex: string }[] = [
  { value: 'blue-yellow', label: 'Синьо-жовтий', hex: '#1a56a0' },
  { value: 'blue',        label: 'Синій',         hex: '#1d4ed8' },
  { value: 'red',         label: 'Червоний',      hex: '#dc2626' },
  { value: 'white',       label: 'Білий',         hex: '#e8e8e8' },
  { value: 'burgundy',    label: 'Бордовий',      hex: '#7f1d1d' },
  { value: 'ivory',       label: 'Айворі',        hex: '#f5f0e8' },
  { value: 'gold',        label: 'Золотий',       hex: '#c9a84c' },
  { value: 'silver',      label: 'Срібний',       hex: '#9ca3af' },
]

export const FONTS: { value: string; label: string; fontFamily: string }[] = [
  { value: 'classic', label: 'Класичний',  fontFamily: 'Georgia, serif' },
  { value: 'italic',  label: 'Курсив',     fontFamily: '"Times New Roman", serif' },
  { value: 'print',   label: 'Друкований', fontFamily: '"Arial", sans-serif' },
]

export const PRINT_TYPES: { value: string; label: string }[] = [
  { value: 'foil', label: 'Фольга' },
  { value: 'film', label: 'Плівка' },
  { value: '3d',   label: '3Д' },
]

export const MATERIALS: { value: string; label: string }[] = [
  { value: 'atlas', label: 'Атлас' },
  { value: 'silk',  label: 'Шовк' },
  { value: 'satin', label: 'Сатин' },
]

export const EMBLEMS: { key: number; label: string }[] = [
  { key: 0, label: 'Дзвіночок' },
  { key: 1, label: 'Зірка' },
  { key: 2, label: 'Диплом' },
  { key: 3, label: 'Серце' },
  { key: 4, label: 'Факел' },
  { key: 5, label: 'Зірка 3Д' },
]
