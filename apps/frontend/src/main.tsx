import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/styles.css'
import { Providers } from './app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers />
  </StrictMode>,
)
