import { lexCompare } from './lex-comparator'

it('should return the correct value', () => {
  expect(lexCompare('a', 'b')).toBe(-1)
  expect(lexCompare('a', 'a')).toBe(0)
  expect(lexCompare('b', 'a')).toBe(1)
})
