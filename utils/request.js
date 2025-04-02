"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

const API_URL = process.env.BACKEND_URL
const AUTH_URL = process.env.BACKEND_URL + '/auth'

/**
 * Sends a request to the specified URL using the specified method and options.
 * @param {Object} options - The request options.
 * @param {string} options.url - The URL to send the request to.
 * @param {string} [options.method='GET'] - The HTTP method to use for the request. `GET`, `POST`, `PUT`, or `DELETE`.
 * @param {Object} [options.body={}] - The request body.
 * @param {boolean} [options.auth=true] - Indicates whether authentication is required.
 * @param {boolean} [options.cache=true] - Indicates whether to cache the response.
 * @returns {Promise<Object|boolean>} - A promise that resolves to the response data if successful, or false if there was an error.
 */
export const sendRequest = async ({ url, method = 'GET', body = {}, auth = true, cache = true }) => {
    if(!url) return false
    let methodType = ['get', 'post', 'put', 'delete']
    if(!methodType.includes(method.toLowerCase())) return false
    let accessToken = ''
    if(auth){
        const session = await getServerSession(authOptions)
        if(!session) {
            redirect('/login')
            return false
        }
        if(!session.user) {
            redirect('/login')
            return false
        }
        accessToken = session?.user?.accessToken
        if(!accessToken) {
            redirect('/login')
            return false
        }
    }
    let headers = {}
    if(auth) headers = {"Authorization" : `Bearer ${accessToken}`, "Content-Type": "application/json", "Access-Control-Allow-Credentials": "true", "Cookie": cookies().toString() }
    else headers = {"Content-Type": "application/json", "Access-Control-Allow-Credentials": "true", "Cookie": cookies().toString()}
    let fetchOptions
    if(method.toLowerCase() == 'get' || method.toLowerCase() == 'delete') fetchOptions = { method, headers, credentials: 'include' }
    else fetchOptions = { method, headers, body: JSON.stringify(body), credentials: 'include' }
    if(!cache) fetchOptions = { ...fetchOptions, cache: 'no-store' }
    else fetchOptions = { ...fetchOptions, cache: 'force-cache' }
    let res
    try {
        res = await fetch(API_URL + url, fetchOptions)
    } catch(err){
        console.error(`Error sending ${method} request: `, err)
        return false
    }
    if(!res) return false
    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) return false
    const result = await res.json()
    if(!result) return false
    if(result.status == 502) return redirect('/logout')
    return result
}
