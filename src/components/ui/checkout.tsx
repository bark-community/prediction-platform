"use client"

import Link from 'next/link'
 
function Checkout() {
  return (
    <ul>
      <li>
        <Link href="/payments">Payments</Link>
      </li>
      <li>
        <Link href="/wallet">Wallet</Link>
      </li>
      <li>
        <Link href="/api/gateway">API</Link>
      </li>
    </ul>
  )
}
 
export default Checkout