import { serverOnly$ } from 'vite-env-only'
import { requireAuth } from '#app/middleware/requireAuth'

export const middleware = serverOnly$([requireAuth])

import { type LoaderFunctionArgs } from '@remix-run/node'
import { Form, Outlet, useLoaderData } from '@remix-run/react'

export async function loader({ context }: LoaderFunctionArgs) {
  return { user: context.user }
}

export default function Component() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          marginBottom: 16,
        }}
      >
        <h1>Welcome {user}</h1>
        <Form method="post" action="/logout">
          <button>Logout</button>
        </Form>
      </div>
      <Outlet />
    </div>
  )
}
