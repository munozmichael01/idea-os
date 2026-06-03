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

    // Set viewport to match the internal slide resolution
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 })

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

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 })

    // Wait for the export page to signal it's ready (data loaded)
    await page.waitForSelector('[data-export-ready]', { timeout: 15_000 }).catch(() => {
      // No signal element — proceed anyway after a short delay
    })

    const pdf = await page.pdf({
      width: '1920px',
      height: '1080px',
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true,
      preferCSSPageSize: true,
    })

    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
