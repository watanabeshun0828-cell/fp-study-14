import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { GradeProvider } from './lib/grade-context'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><GradeProvider><App /></GradeProvider></React.StrictMode>)
