/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from 'node:stream'

import type {
  ActionFunctionArgs,
  AppLoadContext,
  EntryContext,
  LoaderFunctionArgs,
  Session,
} from '@remix-run/node'
import { createReadableStreamFromReadable } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import { createExpressApp } from 'remix-create-express-app'
import morgan from 'morgan'
import { sayHello } from '#app/hello.server'
import { type SessionData, type SessionFlashData } from '#app/session.server'

const ABORT_DELAY = 5_000

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext,
) {
  const handlerName = isbot(request.headers.get('user-agent') || '')
    ? 'onAllReady'
    : 'onShellReady'
  return new Promise((resolve, reject) => {
    let shellRendered = false
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        [handlerName]() {
          shellRendered = true
          const body = new PassThrough()
          const stream = createReadableStreamFromReadable(body)

          responseHeaders.set('Content-Type', 'text/html')

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          )

          pipe(body)
        },
        onShellError(error: unknown) {
          reject(error)
        },
        onError(error: unknown) {
          responseStatusCode = 500
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error)
          }
        },
      },
    )

    setTimeout(abort, ABORT_DELAY)
  })
}

export function handleDataRequest(
  response: Response,
  { request, params, context }: LoaderFunctionArgs | ActionFunctionArgs,
) {
  console.log('handleDataRequest', response)
  return response
}

declare module '@remix-run/server-runtime' {
  export interface AppLoadContext {
    sayHello: () => string
    session: Session<SessionData, SessionFlashData>
    user?: string
  }
}

export const app = createExpressApp({
  configure: app => {
    // customize your express app with additional middleware
    app.use(morgan('tiny'))
  },
  getLoadContext: () => {
    // return the AppLoadContext
    return { sayHello } as AppLoadContext
  },
  unstable_middleware: true,
})
