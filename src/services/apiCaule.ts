import axios from 'axios'

export const apiCaule = axios.create({
  baseURL: 'http://138.197.170.221:9194/api',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
  auth: {
    username: 'ST2U',
    password: 'Sexing@24#'
  }
})

