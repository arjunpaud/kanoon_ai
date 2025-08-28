import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { message, model } = await request.json()

    if (!message || !model) {
      return NextResponse.json({ error: "Message and model are required" }, { status: 400 })
    }

    const command = `cd ..\\model && venv\\Scripts\\activate && python main.py ${model} "${message.replace(/"/g, '\\"')}"`

    console.log(`[v0] Executing command: ${command}`)

    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 second timeout
      cwd: process.cwd(),
    })

    if (stderr) {
      console.error(`[v0] Python stderr: ${stderr}`)
    }

    const response = stdout.trim() || "No response from Python model"

    return NextResponse.json({
      response,
      model,
      command,
    })
  } catch (error: any) {
    console.error(`[v0] Error executing Python command:`, error)

    return NextResponse.json(
      {
        error: "Failed to execute Python model",
        details: error.message,
        fallbackResponse: `I apologize, but I'm currently unable to process your request using the ${request.body ? JSON.parse(await request.text()).model : "selected"} model. Please try again later.`,
      },
      { status: 500 },
    )
  }
}
