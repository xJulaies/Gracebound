export type TStatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 500;

export type TCreateError = Error & { status: TStatusCode };
