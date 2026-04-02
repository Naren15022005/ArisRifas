import { test, expect } from '@playwright/test'

test('backend login and reserve (API)', async ({ page, request }) => {
  // quick sanity check frontend is up
  await page.goto('http://localhost:3000')

  // Login directly against backend to obtain token
  const loginRes = await request.post('http://127.0.0.1:3001/api/auth/login', {
    data: { email: 'test@example.com', password: 'changeme' },
  })
  const loginJson = await loginRes.json()
  const token = loginJson.access_token
  expect(token).toBeTruthy()

  // Call protected reserve endpoint
  const reserveRes = await request.post('http://127.0.0.1:3001/api/purchases/reserve', {
    data: { raffleId: 1, quantity: 1 },
    headers: { Authorization: `Bearer ${token}`, 'idempotency-key': `e2e-${Math.random()}` },
  })
  const reserveJson = await reserveRes.json()
  expect(reserveJson).toHaveProperty('purchaseId')
})
