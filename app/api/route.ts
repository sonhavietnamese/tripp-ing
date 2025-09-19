import { readFileSync } from 'fs'
import { join } from 'path'

// In-memory storage for assigned codes (resets on each deployment)
// eslint-disable-next-line prefer-const
let assignedCodes: Record<string, string> = {}

export async function POST(request: Request) {
  try {
    const { uuid } = await request.json()

    if (!uuid) {
      return new Response(JSON.stringify({ error: 'UUID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Path to the generated codes file (read-only, works on Vercel)
    const generatedCodesPath = join(process.cwd(), 'app/api/generated-codes.txt')

    // Read generated codes
    const generatedCodes = readFileSync(generatedCodesPath, 'utf-8')
      .split('\n')
      .map((code) => code.trim())
      .filter((code) => code.length > 0)

    // Check if UUID already has an assigned code
    if (assignedCodes[uuid]) {
      return new Response(
        JSON.stringify({
          uuid,
          code: assignedCodes[uuid],
          message: 'Code already assigned',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Find an unassigned code
    const assignedCodesList = Object.values(assignedCodes)
    const availableCode = generatedCodes.find((code) => !assignedCodesList.includes(code))

    if (!availableCode) {
      return new Response(
        JSON.stringify({
          error: 'No more codes available',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Assign the code to the UUID (in-memory storage)
    assignedCodes[uuid] = availableCode

    return new Response(
      JSON.stringify({
        uuid,
        code: availableCode,
        message: 'Code assigned successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error assigning code:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
