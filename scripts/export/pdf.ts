import puppeteer from 'puppeteer'

export async function generatePdf(ideaId: string): Promise<Buffer> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'
  const url = `${baseUrl}/ideas/${ideaId}/export`

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    const page = await browser.newPage()

    await page.setViewport({ width: 1280, height: 900 })

    // Pass service role cookie so the export page can load protected data
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      const domain = new URL(supabaseUrl).hostname
      await page.setCookie({
        name: 'sb-service-role',
        value: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
        domain,
        httpOnly: true,
        secure: true,
      })
    }

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 })

    // Wait for the export page to signal it's ready (data loaded)
    await page.waitForSelector('[data-export-ready]', { timeout: 15_000 }).catch(() => {
      // No signal element — proceed anyway after a short delay
    })

    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      printBackground: true,
    })

    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
