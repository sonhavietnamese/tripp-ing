import { writeFileSync } from 'fs'
import { join } from 'path'

function generateCodes(count: number): string[] {
  const codes: string[] = []
  const usedNumbers = new Set<number>()

  while (codes.length < count) {
    // Generate a random 4-digit number (1000-9999)
    const randomNumber = Math.floor(Math.random() * 9000) + 1000

    // Check if this number hasn't been used before
    if (!usedNumbers.has(randomNumber)) {
      usedNumbers.add(randomNumber)
      codes.push(`SMCOKE-${randomNumber}`)
    }
  }

  return codes
}

function main() {
  const codes = generateCodes(500)
  const outputPath = join(process.cwd(), 'generated-codes.txt')

  // Join all codes with newlines
  const content = codes.join('\n')

  // Write to file
  writeFileSync(outputPath, content, 'utf8')

  console.log(`Generated ${codes.length} codes and saved to: ${outputPath}`)
  console.log('First few codes:')
  console.log(codes.slice(0, 5).join('\n'))
}

// Run the script
main()
