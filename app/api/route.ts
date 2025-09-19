import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const { uuid } = await request.json()

    if (!uuid) {
      return new Response(JSON.stringify({ error: 'UUID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Paths to the files
    const generatedCodesPath = join(process.cwd(), 'app/api/generated-codes.txt')
    const assignedCodesPath = join(process.cwd(), 'app/api/code-assigned.json')

    // Read generated codes
    const generatedCodes = readFileSync(generatedCodesPath, 'utf-8')
      .split('\n')
      .map((code) => code.trim())
      .filter((code) => code.length > 0)

    // Read existing assignments or create empty object
    let assignedCodes: Record<string, string> = {}
    if (existsSync(assignedCodesPath)) {
      const assignedData = readFileSync(assignedCodesPath, 'utf-8')
      if (assignedData.trim()) {
        assignedCodes = JSON.parse(assignedData)
      }
    }

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

    // Assign the code to the UUID
    assignedCodes[uuid] = availableCode

    // Save the updated assignments
    writeFileSync(assignedCodesPath, JSON.stringify(assignedCodes, null, 2))

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
